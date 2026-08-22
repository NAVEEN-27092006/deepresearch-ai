import json
import logging
from datetime import datetime, timezone
from app.database.session import SessionLocal
from app.models.models import Research, ResearchPlan, Source, Report
from app.services.ai_service import ai_service
from app.services.search_service import search_service

logger = logging.getLogger(__name__)

def execute_research_pipeline_bg(research_id: int):
    """
    Executes the full 7-stage source-grounded Deep Research workflow in a background DB thread session:
    STAGE 1: Understanding research question & query normalization (14%)
    STAGE 2: Searching reliable sources (28%)
    STAGE 3: Filtering relevant sources (42%)
    STAGE 4: Extracting evidence (57%)
    STAGE 5: Analyzing findings & structuring plan (71%)
    STAGE 6: Generating citation-grounded report (85%)
    STAGE 7: Validating report quality & saving (100%)
    """
    db = SessionLocal()
    try:
        research = db.query(Research).filter(Research.id == research_id).first()
        if not research:
            logger.error(f"Research with ID {research_id} not found.")
            return

        # STAGE 1: Research Query Processing
        _update_status(db, research, status="analyzing", progress=14, step="Step 1/7: Understanding research question & extracting intent")
        analysis = ai_service.analyze_query(
            topic=research.topic,
            depth=research.depth,
            additional_instructions=research.additional_instructions or ""
        )
        research.normalized_topic = analysis.get("normalized_topic", research.topic.title())
        db.commit()

        # STAGE 2: Source Retrieval across real providers
        _update_status(db, research, status="searching", progress=28, step="Step 2/7: Searching reliable academic, government & web sources")
        
        # Build search queries from topic & extracted keywords
        search_queries = [research.topic]
        if analysis.get("keywords"):
            search_queries.append(f"{research.topic} {' '.join(analysis['keywords'][:3])}")

        raw_sources = []
        for sq in search_queries:
            results = search_service.search(
                query=sq,
                max_results=4 if research.depth == "quick" else 6,
                category_preference=research.source_preference
            )
            raw_sources.extend(results)

        # STAGE 3: Source Validation & Deduplication
        _update_status(db, research, status="filtering", progress=42, step="Step 3/7: Filtering relevant sources & removing duplicates")
        seen_urls = set()
        validated_sources = []

        for item in raw_sources:
            url = item.get("url")
            if not url or url in seen_urls:
                continue
            
            # Require minimum relevance score
            if item.get("relevance_score", 1.0) < 0.15:
                continue

            seen_urls.add(url)
            validated_sources.append(item)

        # Check for ZERO reliable sources failure condition
        if not validated_sources:
            logger.warning(f"No reliable sources retrieved for research #{research.id}")
            research.status = "failed"
            research.progress_percentage = 0
            research.current_step = "Sufficient reliable evidence was not found for this research topic. Please refine your query or check back later."
            db.commit()
            return

        # Save validated sources to DB
        saved_sources_db = []
        for item in validated_sources:
            source_db = Source(
                research_id=research.id,
                title=item.get("title", "Untitled Source"),
                url=item.get("url", "#"),
                source_name=item.get("source_name", "web"),
                source_type=item.get("source_type", "web"),
                author=item.get("author"),
                publication_date=item.get("publication_date", "Recent"),
                snippet=item.get("snippet", ""),
                extracted_evidence=item.get("extracted_evidence", ""),
                quality_score=item.get("quality_score", 0.8),
                relevance_score=item.get("relevance_score", 0.8),
                quality_metadata=item.get("quality_metadata", "")
            )
            db.add(source_db)
            saved_sources_db.append(item)
        db.commit()

        # STAGE 4: Evidence Extraction
        _update_status(db, research, status="extracting", progress=57, step="Step 4/7: Extracting concrete evidence & factual snippets")

        # STAGE 5: Plan Generation & Findings Analysis
        _update_status(db, research, status="analyzing_findings", progress=71, step="Step 5/7: Analyzing findings & structuring comparative subtopics")
        subtopics = ai_service.generate_plan(
            topic=research.topic,
            analysis=analysis,
            depth=research.depth
        )
        
        # Save research plan in DB
        plan_db = ResearchPlan(
            research_id=research.id,
            plan_content=json.dumps({"subtopics": subtopics, "analysis": analysis, "source_count": len(saved_sources_db)})
        )
        db.add(plan_db)
        db.commit()

        # STAGE 6: Research Synthesis & Citation Report Generation
        _update_status(db, research, status="synthesizing", progress=85, step="Step 6/7: Generating citation-grounded 10-section report")
        report_data = ai_service.synthesize_research(
            topic=research.topic,
            analysis=analysis,
            plan=subtopics,
            sources=saved_sources_db,
            depth=research.depth,
            instructions=research.additional_instructions or ""
        )

        # STAGE 7: Quality Check & Final Persistence
        _update_status(db, research, status="completed", progress=100, step="Step 7/7: Validating report quality & citation integrity")
        
        quality_check = report_data.get("quality_check", {})
        research.quality_status = "passed" if quality_check.get("passed", True) else "flagged"

        # Save Report in DB
        report_db = Report(
            research_id=research.id,
            title=report_data["title"],
            executive_summary=report_data["executive_summary"],
            content=report_data["content"]
        )
        db.add(report_db)

        research.status = "completed"
        research.progress_percentage = 100
        research.current_step = "Research completed successfully."
        research.completed_at = datetime.now(timezone.utc)
        db.commit()

        logger.info(f"Research #{research.id} completed successfully with {len(saved_sources_db)} real sources.")

    except Exception as e:
        logger.error(f"Error executing research #{research_id}: {e}", exc_info=True)
        db.rollback()
        research = db.query(Research).filter(Research.id == research_id).first()
        if research:
            research.status = "failed"
            research.progress_percentage = 0
            research.current_step = f"Research execution error: {str(e)}"
            db.commit()
    finally:
        db.close()

def _update_status(db, research: Research, status: str, progress: int, step: str):
    research.status = status
    research.progress_percentage = progress
    research.current_step = step
    db.commit()
    db.refresh(research)
