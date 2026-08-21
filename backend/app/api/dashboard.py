from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Research, Report, Source
from app.schemas.schemas import DashboardStatsResponse, ResearchResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard Analytics"])

@router.get("", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve summary metrics and recent activity for user dashboard."""
    user_researches = db.query(Research).filter(Research.user_id == current_user.id)

    total_research = user_researches.count()
    completed_research = user_researches.filter(Research.status == "completed").count()
    in_progress = user_researches.filter(Research.status.in_(["pending", "analyzing", "planning", "searching", "synthesizing"])).count()
    saved_reports = db.query(Report).join(Research).filter(Research.user_id == current_user.id).count()

    recent_researches_db = user_researches.order_by(Research.created_at.desc()).limit(5).all()

    recent_list = []
    for r in recent_researches_db:
        cnt = db.query(Source).filter(Source.research_id == r.id).count()
        r_dict = ResearchResponse.model_validate(r)
        r_dict.source_count = cnt
        recent_list.append(r_dict)

    return DashboardStatsResponse(
        total_research=total_research,
        completed_research=completed_research,
        in_progress=in_progress,
        saved_reports=saved_reports,
        recent_researches=recent_list
    )
