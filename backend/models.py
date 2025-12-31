"""
Pydantic models for database schemas and API requests/responses.
"""
from datetime import datetime
from typing import List, Optional
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
    """Model for a single transcript segment"""
    speaker: str
    text: str
    timestamp: float

class MeetingCreate(BaseModel):
    """Request model for creating/joining a meeting"""
    name: str = Field(..., description="Participant name")

class MeetingInDB(BaseModel):
    """Internal model for meeting stored in database"""
    id: str = Field(alias="_id")
    user_id: str
    participant_name: str
    status: str  # "waiting", "processing", "completed"
    transcript: List[TranscriptSegment] = []
    summary: Optional[str] = None
    action_items: List[str] = []
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    
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
    participant_name: str
    status: str
    transcript: List[TranscriptSegment]
    summary: Optional[str] = None
    action_items: List[str] = []
    created_at: datetime
    ended_at: Optional[datetime] = None

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