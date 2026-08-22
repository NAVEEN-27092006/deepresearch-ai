from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    researches = relationship("Research", back_populates="user", cascade="all, delete-orphan")

class Research(Base):
    __tablename__ = "researches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    topic = Column(Text, nullable=False)
    normalized_topic = Column(Text, nullable=True)
    additional_instructions = Column(Text, nullable=True)
    depth = Column(String(50), default="standard")  # quick, standard, deep
    source_preference = Column(String(100), default="all")  # all, academic, government, official, news
    status = Column(String(50), default="pending")  # pending, analyzing, searching, filtering, extracting, synthesizing, completed, failed
    progress_percentage = Column(Integer, default=0)
    current_step = Column(String(255), default="Initialized")
    quality_status = Column(String(100), nullable=True, default="passed")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="researches")
    plan = relationship("ResearchPlan", back_populates="research", uselist=False, cascade="all, delete-orphan")
    sources = relationship("Source", back_populates="research", cascade="all, delete-orphan")
    report = relationship("Report", back_populates="research", uselist=False, cascade="all, delete-orphan")
    followup_messages = relationship("FollowUpMessage", back_populates="research", cascade="all, delete-orphan")

class ResearchPlan(Base):
    __tablename__ = "research_plans"

    id = Column(Integer, primary_key=True, index=True)
    research_id = Column(Integer, ForeignKey("researches.id"), nullable=False, index=True)
    plan_content = Column(Text, nullable=False)  # JSON or formatted text
    created_at = Column(DateTime(timezone=True), default=utc_now)

    research = relationship("Research", back_populates="plan")

class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    research_id = Column(Integer, ForeignKey("researches.id"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    url = Column(Text, nullable=False)
    source_name = Column(String(255), nullable=True)
    source_type = Column(String(100), default="web")  # academic, government, official, news, web
    author = Column(String(255), nullable=True)
    publication_date = Column(String(100), nullable=True)
    snippet = Column(Text, nullable=True)
    extracted_evidence = Column(Text, nullable=True)
    quality_score = Column(Float, default=0.8)
    relevance_score = Column(Float, default=0.8)
    quality_metadata = Column(Text, nullable=True)  # JSON string with evaluation details

    research = relationship("Research", back_populates="sources")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    research_id = Column(Integer, ForeignKey("researches.id"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    executive_summary = Column(Text, nullable=True)
    content = Column(Text, nullable=False)  # Markdown content with citations
    created_at = Column(DateTime(timezone=True), default=utc_now)

    research = relationship("Research", back_populates="report")

class FollowUpMessage(Base):
    __tablename__ = "followup_messages"

    id = Column(Integer, primary_key=True, index=True)
    research_id = Column(Integer, ForeignKey("researches.id"), nullable=False, index=True)
    user_message = Column(Text, nullable=False)
    assistant_message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    research = relationship("Research", back_populates="followup_messages")
