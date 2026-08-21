from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Research, Report, Source
from app.schemas.schemas import ReportResponse
from app.api.deps import get_current_user
from app.services.pdf_service import generate_pdf_report

router = APIRouter(prefix="/research", tags=["Reports & Export"])

@router.get("/{research_id}/report", response_model=ReportResponse)
def get_report(
    research_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve generated research report for a research session."""
    research = db.query(Research).filter(Research.id == research_id, Research.user_id == current_user.id).first()
    if not research:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research not found.")

    report = db.query(Report).filter(Report.research_id == research_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not generated yet.")

    return report

@router.get("/{research_id}/download")
def download_pdf_report(
    research_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export and download research report as a styled PDF document."""
    research = db.query(Research).filter(Research.id == research_id, Research.user_id == current_user.id).first()
    if not research:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research not found.")

    report = db.query(Report).filter(Report.research_id == research_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not ready for download.")

    sources = db.query(Source).filter(Source.research_id == research_id).all()
    source_dicts = [{"title": s.title, "url": s.url, "source_name": s.source_name, "publication_date": s.publication_date, "quality_score": s.quality_score} for s in sources]

    created_str = report.created_at.strftime("%Y-%m-%d %H:%M") if report.created_at else "2026"
    pdf_bytes = generate_pdf_report(
        title=report.title,
        topic=research.topic,
        depth=research.depth,
        created_at_str=created_str,
        content_markdown=report.content,
        sources=source_dicts
    )

    filename = f"DeepResearch_{research_id}_{research.topic[:25].replace(' ', '_')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
