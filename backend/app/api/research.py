import threading
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.models import User, Research, Source
from app.schemas.schemas import ResearchCreate, ResearchResponse, ResearchDetailResponse, ProgressResponse
from app.api.deps import get_current_user
from app.agents.research_agent import execute_research_pipeline_bg

router = APIRouter(prefix="/research", tags=["Research Agent"])

@router.post("", response_model=ResearchResponse, status_code=status.HTTP_201_CREATED)
def create_research(
    research_in: ResearchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new research request and kick off the autonomous AI research pipeline in the background."""
    new_research = Research(
        user_id=current_user.id,
        topic=research_in.topic.strip(),
        depth=research_in.depth.lower(),
        source_preference=research_in.source_preference.lower(),
        additional_instructions=research_in.additional_instructions,
        status="pending",
        progress_percentage=5,
        current_step="Research request initialized. Preparing agent..."
    )
    db.add(new_research)
    db.commit()
    db.refresh(new_research)

    # Launch research agent workflow in dedicated thread with its own DB session
    thread = threading.Thread(target=execute_research_pipeline_bg, args=(new_research.id,))
    thread.daemon = True
    thread.start()

    return new_research

@router.get("", response_model=List[ResearchResponse])
def list_researches(
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    depth_filter: Optional[str] = Query(None, alias="depth"),
    sort_by: Optional[str] = "date_desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List research history for current user with search, filter, and sorting capabilities."""
    query = db.query(Research).filter(Research.user_id == current_user.id)

    if search:
        query = query.filter(Research.topic.ilike(f"%{search}%"))
    if status_filter:
        query = query.filter(Research.status == status_filter.lower())
    if depth_filter:
        query = query.filter(Research.depth == depth_filter.lower())

    if sort_by == "date_asc":
        query = query.order_by(Research.created_at.asc())
    else:  # date_desc
        query = query.order_by(Research.created_at.desc())

    researches = query.all()
    
    # Calculate source counts
    res_list = []
    for r in researches:
        cnt = db.query(Source).filter(Source.research_id == r.id).count()
        r_dict = ResearchResponse.model_validate(r)
        r_dict.source_count = cnt
        res_list.append(r_dict)

    return res_list

@router.get("/{research_id}", response_model=ResearchDetailResponse)
def get_research_detail(
    research_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get full details of a specific research item including sources, report, and plan."""
    research = db.query(Research).filter(Research.id == research_id, Research.user_id == current_user.id).first()
    if not research:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research not found.")

    cnt = db.query(Source).filter(Source.research_id == research.id).count()
    detail = ResearchDetailResponse.model_validate(research)
    detail.source_count = cnt
    return detail

@router.get("/{research_id}/progress", response_model=ProgressResponse)
def get_research_progress(
    research_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get real-time execution progress of a running research process."""
    research = db.query(Research).filter(Research.id == research_id, Research.user_id == current_user.id).first()
    if not research:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research not found.")

    completed = research.status in ["completed", "failed"]
    error_msg = research.current_step if research.status == "failed" else None

    return ProgressResponse(
        research_id=research.id,
        status=research.status,
        progress_percentage=research.progress_percentage,
        current_step=research.current_step,
        completed=completed,
        error=error_msg
    )

@router.delete("/{research_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_research(
    research_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a research item and all associated data."""
    research = db.query(Research).filter(Research.id == research_id, Research.user_id == current_user.id).first()
    if not research:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research not found.")

    db.delete(research)
    db.commit()
    return None
