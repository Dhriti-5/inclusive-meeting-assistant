"""
Pydantic models for database schemas and API requests/responses.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# ===========================
# User Models
# ===========================

class UserRegister(BaseModel):
    """Request model for user registration"""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    name: Optional[str] = None

class UserLogin(BaseModel):
    """Request model for user login"""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """Response model for user data (without password)"""
    id: str
    email: str
    name: Optional[str] = None
    created_at: datetime

class UserInDB(BaseModel):
    """Internal model for user stored in database"""
    email: str
    password_hash: str
    name: Optional[str] = None
    created_at: datetime

# ===========================
# Meeting Models
# ===========================

class TranscriptSegment(BaseModel):
    """Model for a single transcript segment with timeline data"""
    speaker: str
    text: str
    start: float  # Start time in seconds
    end: float    # End time in seconds
    timestamp: Optional[float] = None  # Deprecated, kept for backward compatibility

class ActionItem(BaseModel):
    """Model for a structured action item"""
    task: str
    assignee: Optional[str] = None
    status: str = "pending"  # pending, completed, cancelled
    created_at: Optional[datetime] = None

class MeetingCreate(BaseModel):
    """Request model for creating/joining a meeting"""
    name: str = Field(..., description="Participant name")

class MeetingInDB(BaseModel):
    """Internal model for meeting stored in database"""
    id: str = Field(alias="_id")
    user_id: str
    title: str  # Meeting title
    participant_name: Optional[str] = None  # Legacy field
    status: str  # "waiting", "processing", "completed", "failed"
    
    # Transcript data
    transcript: List[TranscriptSegment] = []
    
    # AI outputs
    summary: Optional[str] = None
    action_items: List[ActionItem] = []  # Structured action items
    
    # Analytics
    duration_seconds: Optional[float] = None
    speaker_stats: Optional[Dict[str, float]] = None  # {speaker: seconds_spoken}
    
    # Metadata
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    rag_indexed: bool = False
    audio_url: Optional[str] = None
    
    class Config:
        populate_by_name = True

class MeetingResponse(BaseModel):
    """Response model for meeting data"""
    id: str
    participant_name: str
    status: str
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

class MeetingReport(BaseModel):
    """Response model for meeting report"""
    id: str
    title: str
    participant_name: Optional[str] = None
    status: str
    transcript: List[TranscriptSegment]
    summary: Optional[str] = None
    action_items: List[ActionItem] = []
    duration_seconds: Optional[float] = None
    speaker_stats: Optional[Dict[str, float]] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    audio_url: Optional[str] = None

class MeetingHistory(BaseModel):
    """Response model for meeting history"""
    meetings: List[MeetingResponse]
    total: int
# ===========================
# Chat/RAG Models
# ===========================

class ChatMessage(BaseModel):
    """Model for chat messages with meeting context"""
    meeting_id: str
    question: str
    
class ChatResponse(BaseModel):
    """Response model for chat queries"""
    question: str
    answer: str
    sources: List[Dict[str, Any]] = []
    meeting_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)