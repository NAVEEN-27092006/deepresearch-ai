import json
import logging
from datetime import datetime, timezone
from app.database.session import SessionLocal
from app.models.models import Research, ResearchPlan, Source, Report
from app.services.ai_service import ai_service
from app.services.search_service import search_service

logger = logging.getLogger(__name__)

def execute_research_pipeline_bg(research_id: int):
    """Executes the full 7-step autonomous AI research agent workflow in a dedicated DB thread session."""
    db = SessionLocal()
    try:
        research = db.query(Research).filter(Research.id == research_id).first()
        if not research:
            logger.error(f"Research with ID {research_id} not found.")
            return

        # STEP 1: QUERY ANALYSIS
        _update_status(db, research, status="analyzing", progress=15, step="Step 1/7: Analyzing research question & key dimensions...")
        analysis = ai_service.analyze_query(
            topic=research.topic,
            depth=research.depth,
            additional_instructions=research.additional_instructions or ""
        )

        # STEP 2: RESEARCH PLAN GENERATION
        _update_status(db, research, status="planning", progress=30, step="Step 2/7: Generating tailored research plan & subtopics...")
        subtopics = ai_service.generate_plan(
            topic=research.topic,
            analysis=analysis,
            depth=research.depth
        )
        
        # Save research plan in DB
        plan_db = ResearchPlan(
            research_id=research.id,
            plan_content=json.dumps({"subtopics": subtopics, "analysis": analysis})
        )
        db.add(plan_db)
        db.commit()

        # STEP 3 & 4 & 5: SEARCH, SOURCE COLLECTION & SOURCE EVALUATION
        _update_status(db, research, status="searching", progress=50, step="Step 3-5/7: Searching sources & evaluating credibility...")
        collected_sources = []
        seen_urls = set()

        for sub in subtopics:
            search_query = f"{research.topic} {sub['title']}"
            search_results = search_service.search(
                query=search_query,
                max_results=3 if research.depth == "quick" else 4,
                category_preference=research.source_preference
            )

            for item in search_results:
                url = item["url"]
                if url in seen_urls:
                    continue
                seen_urls.add(url)

                source_db = Source(
                    research_id=research.id,
                    title=item["title"],
                    url=item["url"],
                    source_name=item["source_name"],
                    source_type=item["source_type"],
                    publication_date=item["publication_date"],
                    snippet=item["snippet"],
                    quality_score=item["quality_score"],
                    quality_metadata=item["quality_metadata"]
                )
                db.add(source_db)
                collected_sources.append(item)

        db.commit()

        # STEP 6 & 7: SYNTHESIS & CITED REPORT GENERATION
        _update_status(db, research, status="synthesizing", progress=80, step="Step 6-7/7: Synthesizing findings & drafting cited report...")
        report_data = ai_service.synthesize_research(
            topic=research.topic,
            plan=subtopics,
            sources=collected_sources,
            depth=research.depth,
            instructions=research.additional_instructions or ""
        )

        # Save Report in DB
        report_db = Report(
            research_id=research.id,
            title=report_data["title"],
            executive_summary=report_data["executive_summary"],
            content=report_data["content"]
        )
        db.add(report_db)

        # Mark research as COMPLETED
        research.status = "completed"
        research.progress_percentage = 100
        research.current_step = "Research completed successfully."
        research.completed_at = datetime.now(timezone.utc)
        db.commit()

        logger.info(f"Research #{research.id} completed successfully with {len(collected_sources)} sources.")

    except Exception as e:
        logger.error(f"Error executing research #{research_id}: {e}", exc_info=True)
        db.rollback()
        research = db.query(Research).filter(Research.id == research_id).first()
        if research:
            research.status = "failed"
            research.progress_percentage = 0
            research.current_step = f"Research failed: {str(e)}"
            db.commit()
    finally:
        db.close()

def _update_status(db, research: Research, status: str, progress: int, step: str):
    research.status = status
    research.progress_percentage = progress
    research.current_step = step
    db.commit()
    db.refresh(research)
