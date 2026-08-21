from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Research, Report, FollowUpMessage
from app.schemas.schemas import FollowUpCreate, FollowUpMessageResponse
from app.api.deps import get_current_user
from app.services.ai_service import ai_service

router = APIRouter(prefix="/research", tags=["Follow-up Q&A"])

@router.post("/{research_id}/follow-up", response_model=FollowUpMessageResponse)
def ask_followup(
    research_id: int,
    followup_in: FollowUpCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a follow-up question regarding an existing research report."""
    research = db.query(Research).filter(Research.id == research_id, Research.user_id == current_user.id).first()
    if not research:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research not found.")

    report = db.query(Report).filter(Report.research_id == research_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot ask follow-up questions before research report is completed.")

    # Retrieve past conversation history
    past_messages = db.query(FollowUpMessage).filter(FollowUpMessage.research_id == research_id).order_by(FollowUpMessage.created_at.asc()).all()
    history = [{"user": m.user_message, "assistant": m.assistant_message} for m in past_messages]

    # Generate assistant answer using existing context
    assistant_reply = ai_service.answer_followup(
        topic=research.topic,
        report_content=report.content,
        conversation_history=history,
        user_message=followup_in.message
    )

    # Store in database
    followup_db = FollowUpMessage(
        research_id=research_id,
        user_message=followup_in.message.strip(),
        assistant_message=assistant_reply
    )
    db.add(followup_db)
    db.commit()
    db.refresh(followup_db)

    return followup_db
