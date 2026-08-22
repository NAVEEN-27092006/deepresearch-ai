import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.session import Base, engine
from app.api import auth, research, report, followup, dashboard, user


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("deepresearch")


from sqlalchemy import text

# Create database tables
Base.metadata.create_all(bind=engine)

def _apply_sqlite_migrations():
    """Ensure new columns exist in SQLite database without losing existing data."""
    with engine.connect() as conn:
        columns_researches = [row[1] for row in conn.execute(text("PRAGMA table_info(researches);")).fetchall()]
        if "normalized_topic" not in columns_researches:
            conn.execute(text("ALTER TABLE researches ADD COLUMN normalized_topic TEXT;"))
        if "quality_status" not in columns_researches:
            conn.execute(text("ALTER TABLE researches ADD COLUMN quality_status VARCHAR(100) DEFAULT 'passed';"))

        columns_sources = [row[1] for row in conn.execute(text("PRAGMA table_info(sources);")).fetchall()]
        if "author" not in columns_sources:
            conn.execute(text("ALTER TABLE sources ADD COLUMN author VARCHAR(255);"))
        if "extracted_evidence" not in columns_sources:
            conn.execute(text("ALTER TABLE sources ADD COLUMN extracted_evidence TEXT;"))
        if "relevance_score" not in columns_sources:
            conn.execute(text("ALTER TABLE sources ADD COLUMN relevance_score FLOAT DEFAULT 0.8;"))
        conn.commit()

try:
    _apply_sqlite_migrations()
except Exception as err:
    logger.warning(f"DB Migration check info: {err}")



# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous AI Research Agent API Backend",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://deepresearchai.netlify.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(research.router, prefix=settings.API_V1_STR)
app.include_router(report.router, prefix=settings.API_V1_STR)
app.include_router(followup.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(user.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "status": "healthy",
        "application": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/api/docs"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )