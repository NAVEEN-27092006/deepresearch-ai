from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None

# --- Research Schemas ---
class ResearchCreate(BaseModel):
    topic: str = Field(..., min_length=3, description="Research topic or question")
    depth: str = Field("standard", description="quick, standard, deep")
    source_preference: str = Field("all", description="all, academic, government, official, news")
    additional_instructions: Optional[str] = None

class ResearchPlanSchema(BaseModel):
    id: int
    research_id: int
    plan_content: str
    created_at: datetime

    class Config:
        from_attributes = True

class SourceResponse(BaseModel):
    id: int
    research_id: int
    title: str
    url: str
    source_name: Optional[str] = None
    source_type: Optional[str] = "web"
    author: Optional[str] = None
    publication_date: Optional[str] = None
    snippet: Optional[str] = None
    extracted_evidence: Optional[str] = None
    quality_score: Optional[float] = 0.8
    relevance_score: Optional[float] = 0.8
    quality_metadata: Optional[str] = None

    class Config:
        from_attributes = True

class ReportResponse(BaseModel):
    id: int
    research_id: int
    title: str
    executive_summary: Optional[str] = None
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class FollowUpMessageResponse(BaseModel):
    id: int
    research_id: int
    user_message: str
    assistant_message: str
    created_at: datetime

    class Config:
        from_attributes = True

class FollowUpCreate(BaseModel):
    message: str = Field(..., min_length=1, description="Follow-up question")

class ResearchResponse(BaseModel):
    id: int
    user_id: int
    topic: str
    normalized_topic: Optional[str] = None
    additional_instructions: Optional[str] = None
    depth: str
    source_preference: str
    status: str
    progress_percentage: int
    current_step: str
    quality_status: Optional[str] = "passed"
    created_at: datetime
    completed_at: Optional[datetime] = None
    source_count: Optional[int] = 0

    class Config:
        from_attributes = True

class ResearchDetailResponse(ResearchResponse):
    plan: Optional[ResearchPlanSchema] = None
    sources: List[SourceResponse] = []
    report: Optional[ReportResponse] = None
    followup_messages: List[FollowUpMessageResponse] = []

    class Config:
        from_attributes = True

class ProgressResponse(BaseModel):
    research_id: int
    status: str
    progress_percentage: int
    current_step: str
    completed: bool
    error: Optional[str] = None

class DashboardStatsResponse(BaseModel):
    total_research: int
    completed_research: int
    in_progress: int
    saved_reports: int
    recent_researches: List[ResearchResponse]
