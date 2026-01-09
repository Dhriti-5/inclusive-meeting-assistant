from pydantic import BaseModel, EmailStr
import uuid
import shutil
import sys
import os
import smtplib
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import asyncio
import subprocess
import json

# Append project root to sys.path **before** importing from utils or other root modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Now safe to import project modules
# Optional speaker diarization (may fail on Windows due to TorchAudio)
SPEAKER_DIARIZATION_AVAILABLE = False
diarize_audio = None
preload_pipeline = None
align_transcript_with_diarization = None
naive_align_text_to_diarization = None
build_speaker_tagged_text = None

try:
    from speaker_diarization import diarize_audio, preload_pipeline
    from utils.diarization_utils import (
        align_transcript_with_diarization,
        naive_align_text_to_diarization,
        build_speaker_tagged_text
    )
    SPEAKER_DIARIZATION_AVAILABLE = True
    print("✅ Speaker diarization loaded successfully")
except Exception as e:
    print(f"⚠️  Speaker diarization disabled: {str(e)[:100]}")
    print("   Other features will work normally")

from utils.pdf_generator import generate_pdf
from utils.email_utils import send_email_with_attachment
from pipeline_runner import run_pipeline_from_audio, run_pipeline_from_transcript
from nlp_Module.nlp_pipeline import nlp_pipeline  # Preload models

# Import authentication and database modules
from database import Database, get_users_collection, get_meetings_collection
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user_email,
    Token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from models import (
    UserRegister,
    UserLogin,
    UserResponse,
    MeetingCreate,
    MeetingResponse,
    MeetingReport,
    MeetingHistory,
    TranscriptSegment,
    ChatMessage,
    ChatResponse
)
from websocket_manager import manager
from bot_audio_processor import bot_manager
import logging

# Setup logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection events
@app.on_event("startup")
async def startup_event():
    """Connect to MongoDB on startup"""
    await Database.connect_db()
    print("✅ Application started")

@app.on_event("shutdown")
async def shutdown_event():
    """Close MongoDB connection on shutdown"""
    await Database.close_db()
    print("✅ Application shutdown")

# This dictionary will hold our models once loaded
ml_models = {}

# DEPRECATED: In-memory storage (kept for backward compatibility with old endpoints)
# Use MongoDB for new implementations
meetings_db: Dict[str, dict] = {}
meeting_history: List[dict] = []

@app.get("/")
def read_root():
    return {"message": "Inclusive Meeting Assistant Backend is running."}

# ====== AUTHENTICATION ENDPOINTS ======

@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserRegister):
    """
    Register a new user with email and password.
    Password is hashed before storing in database.
    """
    users_collection = get_users_collection()
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user document
    user_doc = {
        "email": user.email,
        "password_hash": get_password_hash(user.password),
        "name": user.name,
        "created_at": datetime.utcnow()
    }
    
    # Insert into database
    result = await users_collection.insert_one(user_doc)
    
    return UserResponse(
        id=str(result.inserted_id),
        email=user.email,
        name=user.name,
        created_at=user_doc["created_at"]
    )

@app.post("/api/auth/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login user and return JWT access token.
    Use email as username field.
    """
    users_collection = get_users_collection()
    
    # Find user by email
    user = await users_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user(email: str = Depends(get_current_user_email)):
    """
    Get current authenticated user information.
    Requires valid JWT token.
    """
    users_collection = get_users_collection()
    
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user.get("name"),
        created_at=user["created_at"]
    )

# ====== WEBSOCKET ENDPOINT FOR REAL-TIME UPDATES ======

@app.websocket("/ws/meeting/{meeting_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    meeting_id: str,
    token: str = Query(...)
):
    """
    WebSocket endpoint for real-time meeting updates.
    Clients connect with their JWT token and receive:
    - Real-time transcript segments
    - Processing status updates
    - Summary and action items when complete
    - Error notifications
    
    Usage:
        ws://localhost:8000/ws/meeting/{meeting_id}?token=<jwt_token>
    """
    # Validate JWT token (with demo bypass for testing)
    user_email = None
    
    # Allow demo tokens for testing/development
    if token.startswith("demo"):
        user_email = f"demo_user_{meeting_id}"
        print(f"🧪 Demo token accepted for meeting: {meeting_id}")
    else:
        try:
            from jose import jwt, JWTError
            from auth import SECRET_KEY, ALGORITHM
            
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_email = payload.get("sub")
            if user_email is None:
                await websocket.close(code=1008, reason="Invalid token")
                return
        except JWTError:
            await websocket.close(code=1008, reason="Invalid token")
            return
    
    # Verify meeting exists and user has access
    # Skip meeting verification for demo sessions
    if not meeting_id.startswith("session_demo"):
        meetings_collection = get_meetings_collection()
        from bson import ObjectId
        try:
            meeting = await meetings_collection.find_one({"_id": ObjectId(meeting_id)})
        except:
            meeting = None
        
        if not meeting:
            # Also check in-memory for backward compatibility
            if meeting_id not in meetings_db:
                await websocket.close(code=1008, reason="Meeting not found")
                return
    
    # Connect the WebSocket
    await manager.connect(websocket, meeting_id, user_email)
    
    # Send initial connection confirmation
    await manager.send_personal_message(websocket, {
        "type": "connected",
        "meeting_id": meeting_id,
        "message": "Connected to real-time meeting updates",
        "timestamp": datetime.utcnow().isoformat()
    })
    
    try:
        # Keep connection alive and handle incoming messages
        while True:
            # Wait for messages from client (ping/pong, etc.)
            data = await websocket.receive_json()
            
            # Determine Event Type (The "Contracts")
            event_type = data.get("type")
            
            if event_type == "ping":
                await websocket.send_json({"type": "pong"})
                
            elif event_type == "transcript":
                # Audio transcript received - broadcast to all participants
                print(f"🎤 Transcript in {meeting_id}: {data.get('text', '')[:50]}...")
                await manager.broadcast_to_meeting(meeting_id, {
                    "type": "transcript_update",
                    "text": data.get("text", ""),
                    "speaker": data.get("speaker", "Unknown"),
                    "timestamp": datetime.utcnow().isoformat()
                })
                
            elif event_type == "bot_action":
                # Bot status or action update
                print(f"🤖 Bot action in {meeting_id}: {data.get('action', 'Unknown')}")
                await manager.broadcast_to_meeting(meeting_id, {
                    "type": "bot_status",
                    "action": data.get("action", ""),
                    "status": data.get("status", ""),
                    "timestamp": datetime.utcnow().isoformat()
                })
            
    except WebSocketDisconnect:
        await manager.disconnect(websocket, meeting_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await manager.disconnect(websocket, meeting_id)


# ====== BOT AUDIO WEBSOCKET ENDPOINT ======

@app.websocket("/ws/bot-audio")
async def bot_audio_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for meeting bot audio streaming.
    The bot connects here and streams audio chunks for real-time transcription.
    
    Flow:
    1. Bot connects and sends initial metadata (meeting_id, sample_rate)
    2. Bot streams audio chunks (binary data)
    3. Backend processes audio through Whisper in streaming mode
    4. Transcriptions are broadcast to clients via /ws/meeting/{meeting_id}
    
    Usage:
        ws://localhost:8000/ws/bot-audio
    """
    meeting_id = None
    
    try:
        await websocket.accept()
        print("🤖 Bot audio connection accepted, waiting for metadata...")
        
        # First message should contain metadata
        metadata = await websocket.receive_json()
        
        if metadata.get("type") != "bot_connected":
            await websocket.close(code=1008, reason="Expected bot_connected message")
            return
        
        meeting_id = metadata.get("meeting_id", "default")
        sample_rate = metadata.get("sampleRate", 16000)
        
        print(f"🤖 Bot connected for meeting: {meeting_id}, sample rate: {sample_rate}")
        
        # Register bot connection
        await bot_manager.connect_bot(websocket, meeting_id)
        
        # Send acknowledgment
        await websocket.send_json({
            "type": "acknowledged",
            "meeting_id": meeting_id,
            "status": "ready"
        })
        
        # Process incoming audio chunks
        while True:
            try:
                # Receive audio chunk (binary)
                audio_data = await websocket.receive_bytes()
                
                # Process the audio chunk
                await bot_manager.process_audio_chunk(meeting_id, audio_data)
                
            except Exception as e:
                # Check if it's a disconnect or error
                if "disconnect" in str(e).lower():
                    break
                print(f"⚠️  Error processing audio chunk: {e}")
                
    except WebSocketDisconnect:
        print(f"🤖 Bot disconnected from meeting: {meeting_id}")
    except Exception as e:
        print(f"❌ Bot audio WebSocket error: {e}")
    finally:
        if meeting_id:
            await bot_manager.disconnect_bot(meeting_id)


# ====== HELPER FUNCTIONS ======

async def trigger_bot_join(meeting_id: str, meeting_url: str):
    """
    Trigger the Ora authenticated bot to join a meeting automatically
    """
    try:
        bot_engine_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "bot_engine")
        
        # Create environment variables for the bot
        bot_env = os.environ.copy()
        bot_env["MEETING_ID"] = meeting_id
        bot_env["BACKEND_URL"] = "ws://localhost:8000"
        
        logger.info(f"🤖 Launching Ora authenticated bot for meeting: {meeting_url}")
        
        # Start authenticated bot as a background process
        # auth_bot.js takes the meeting URL as a command line argument
        subprocess.Popen(
            ["node", "auth_bot.js", meeting_url],
            cwd=bot_engine_path,
            env=bot_env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NEW_CONSOLE if sys.platform == "win32" else 0
        )
        
        logger.info(f"✅ Ora authenticated bot triggered for meeting {meeting_id}")
        logger.info(f"⚠️  IMPORTANT: You must click 'Admit' when 'Ora AI wants to join' appears in the meeting!")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to trigger authenticated bot: {str(e)}")
        raise


# ====== NEW API ENDPOINTS FOR FRONTEND ======

# Pydantic models for request/response
class MeetingJoinRequest(BaseModel):
    url: Optional[str] = None
    name: str = "Untitled Meeting"
    
class MeetingUploadRequest(BaseModel):
    meeting_id: str
    
# POST /api/meetings/join - Create a new meeting session (PROTECTED)
@app.post("/api/meetings/join")
async def join_meeting(
    request: MeetingJoinRequest,
    current_user: str = Depends(get_current_user_email)
):
    """
    Create a new meeting session for authenticated user.
    Stores meeting in MongoDB.
    """
    meetings_collection = get_meetings_collection()
    users_collection = get_users_collection()
    
    # Get user document
    user_doc = await users_collection.find_one({"email": current_user})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    meeting_id = str(uuid.uuid4())[:8]
    
    # Create meeting document with new schema
    meeting_doc = {
        "_id": meeting_id,
        "user_id": str(user_doc["_id"]),
        "title": request.name or "Untitled Meeting",
        "participant_name": request.name,  # Legacy field
        "meeting_url": request.url,  # Store the meeting URL
        "status": "waiting",  # waiting, processing, completed, failed
        "transcript": [],
        "summary": None,
        "action_items": [],
        "duration_seconds": None,
        "speaker_stats": {},
        "created_at": datetime.utcnow(),
        "started_at": None,
        "ended_at": None,
        "rag_indexed": False,
        "audio_url": None
    }
    
    # Insert into MongoDB
    await meetings_collection.insert_one(meeting_doc)
    
    # Also keep in memory for backward compatibility
    meetings_db[meeting_id] = {
        "id": meeting_id,
        "name": request.name,
        "url": request.url,
        "status": "waiting",
        "created_at": datetime.now().isoformat(),
        "started_at": None,
        "ended_at": None,
        "transcript": [],
        "diarization": [],
        "speaker_aligned": [],
        "summary": None,
        "action_items": None,
        "participants": []
    }
    
    # Trigger bot to join meeting automatically
    try:
        logger.info(f"🤖 Triggering bot to join meeting {meeting_id}")
        await trigger_bot_join(meeting_id, request.url)
        meeting_doc["status"] = "connecting"
        await meetings_collection.update_one(
            {"_id": meeting_id},
            {"$set": {"status": "connecting", "started_at": datetime.utcnow()}}
        )
        meetings_db[meeting_id]["status"] = "connecting"
    except Exception as e:
        logger.error(f"❌ Failed to trigger bot: {str(e)}")
        # Don't fail the request, just log the error
    
    return {
        "success": True,
        "meeting_id": meeting_id,
        "meeting": meetings_db[meeting_id]
    }

# GET /api/meetings/{meeting_id}/status - Get meeting status (PROTECTED)
@app.get("/api/meetings/{meeting_id}/status")
async def get_meeting_status(
    meeting_id: str,
    current_user: str = Depends(get_current_user_email)
):
    """Get current meeting status from MongoDB"""
    meetings_collection = get_meetings_collection()
    
    from bson import ObjectId
    try:
        meeting = await meetings_collection.find_one({"_id": ObjectId(meeting_id)})
    except:
        meeting = None
    
    # Fallback to in-memory for backward compatibility
    if not meeting:
        meeting = meetings_db.get(meeting_id)
        if not meeting:
            return JSONResponse(status_code=404, content={"error": "Meeting not found"})
        return {
            "id": meeting["id"],
            "name": meeting["name"],
            "status": meeting["status"],
            "created_at": meeting["created_at"],
            "started_at": meeting["started_at"],
            "ended_at": meeting["ended_at"],
            "participants": meeting["participants"]
        }
    
    return {
        "id": meeting["_id"],
        "name": meeting["participant_name"],
        "status": meeting["status"],
        "created_at": meeting["created_at"].isoformat(),
        "started_at": meeting["started_at"].isoformat() if meeting["started_at"] else None,
        "ended_at": meeting["ended_at"].isoformat() if meeting["ended_at"] else None,
        "participants": []
    }

# GET /api/meetings/history - Get all meetings (PROTECTED)
@app.get("/api/meetings/history")
async def get_meeting_history(current_user: str = Depends(get_current_user_email)):
    """Get all completed/processing meetings for authenticated user from MongoDB"""
    meetings_collection = get_meetings_collection()
    users_collection = get_users_collection()
    
    # Get user document
    user_doc = await users_collection.find_one({"email": current_user})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get only completed, processing, manual_join, or recording meetings (not "pending")
    cursor = meetings_collection.find({
        "user_id": str(user_doc["_id"]),
        "status": {"$in": ["completed", "processing", "manual_join", "recording"]}
    })
    meetings = await cursor.to_list(length=100)
    
    history = []
    for meeting in meetings:
        history.append({
            "id": str(meeting["_id"]),
            "title": meeting.get("title", meeting.get("participant_name", "Untitled Meeting")),
            "name": meeting.get("participant_name", "Unknown"),
            "date": meeting.get("created_at", meeting.get("started_at", datetime.utcnow())).isoformat() if isinstance(meeting.get("created_at"), datetime) else meeting.get("created_at", str(datetime.utcnow())),
            "duration": meeting.get("duration", "N/A"),
            "status": meeting["status"],
            "participants": meeting.get("participants", ["Unknown"]),
            "summary": meeting.get("summary", "")
        })
    
    # Sort by date descending
    history.sort(key=lambda x: x["date"], reverse=True)
    return {"meetings": history}

# GET /api/meetings/{meeting_id}/transcript - Get live transcript (PROTECTED)
@app.get("/api/meetings/{meeting_id}/transcript")
async def get_live_transcript(
    meeting_id: str,
    current_user: str = Depends(get_current_user_email)
):
    """Get current transcript for a meeting from MongoDB"""
    meetings_collection = get_meetings_collection()
    
    from bson import ObjectId
    try:
        meeting = await meetings_collection.find_one({"_id": ObjectId(meeting_id)})
    except:
        meeting = None
    
    # Fallback to in-memory
    if not meeting:
        meeting = meetings_db.get(meeting_id)
        if not meeting:
            return JSONResponse(status_code=404, content={"error": "Meeting not found"})
        return {
            "meeting_id": meeting_id,
            "transcript": meeting["speaker_aligned"] if meeting["speaker_aligned"] else meeting["transcript"],
            "status": meeting["status"]
        }
    
    return {
        "meeting_id": meeting_id,
        "transcript": meeting.get("transcript", []),
        "status": meeting["status"]
    }

# POST /api/meetings/{meeting_id}/upload-audio - Upload audio for processing (PROTECTED)
@app.post("/api/meetings/{meeting_id}/upload-audio")
async def upload_meeting_audio(
    meeting_id: str,
    audio: UploadFile = File(...),
    lang: str = Form("en"),
    current_user: str = Depends(get_current_user_email)
):
    """Upload and process audio for a meeting (requires authentication)"""
    meetings_collection = get_meetings_collection()
    
    # Try MongoDB first - convert string to ObjectId
    from bson import ObjectId
    try:
        meeting_doc = await meetings_collection.find_one({"_id": ObjectId(meeting_id)})
    except:
        meeting_doc = None
    
    # Fallback to in-memory
    meeting = meetings_db.get(meeting_id)
    if not meeting and not meeting_doc:
        return JSONResponse(status_code=404, content={"error": "Meeting not found"})
    
    try:
        # Send WebSocket status update: Processing started
        await manager.send_status_update(meeting_id, "processing", {
            "message": "Audio upload received, starting processing...",
            "stage": "upload_complete"
        })
        
        # Update meeting status
        if meeting:
            meeting["status"] = "processing"
            meeting["started_at"] = datetime.now().isoformat()
        
        # Save audio file - use absolute path
        temp_id = meeting_id
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        speech_module_dir = os.path.join(project_root, "speech_Module")
        os.makedirs(speech_module_dir, exist_ok=True)
        audio_path = os.path.join(speech_module_dir, f"temp_{temp_id}.wav")
        
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        # Send WebSocket update: Diarization starting (if available)
        if SPEAKER_DIARIZATION_AVAILABLE:
            await manager.send_status_update(meeting_id, "processing", {
                "message": "Starting speaker diarization...",
                "stage": "diarization"
            })

        # Diarization (optional feature)
        diarization_result = []
        if SPEAKER_DIARIZATION_AVAILABLE and diarize_audio:
            try:
                diarization_result = diarize_audio(audio_path) or []
                if meeting:
                    meeting["diarization"] = diarization_result
            except Exception as e:
                print("Diarization failed:", e)
        else:
            print("⚠️  Speaker diarization skipped (not available)")
            diarization_result = []

        # Send WebSocket update: Transcription starting
        await manager.send_status_update(meeting_id, "processing", {
            "message": "Transcribing audio...",
            "stage": "transcription"
        })

        # Run pipeline
        result = run_pipeline_from_audio(audio_path, lang)

        # Get transcript segments
        transcript_segments = result.get("transcript_segments")
        full_transcript = result.get("transcript") or result.get("full_transcript") or result.get("summary_audio")

        # Send WebSocket update: Alignment starting
        await manager.send_status_update(meeting_id, "processing", {
            "message": "Aligning transcript with speakers...",
            "stage": "alignment"
        })

        # Align with diarization
        speaker_aligned = []
        if transcript_segments and diarization_result:
            speaker_aligned = align_transcript_with_diarization(transcript_segments, diarization_result)
        elif full_transcript and diarization_result:
            speaker_aligned = naive_align_text_to_diarization(full_transcript, diarization_result)
        
        # Send transcript segments in real-time via WebSocket
        if speaker_aligned:
            for segment in speaker_aligned:
                await manager.send_transcript_segment(meeting_id, segment)

        # Update meeting data in memory
        if meeting:
            meeting["speaker_aligned"] = speaker_aligned
            meeting["transcript"] = transcript_segments or []
            meeting["summary"] = result.get("summary", "")
            meeting["action_items"] = result.get("action_items", "")
            meeting["summary_hi"] = result.get("translated", "")
            meeting["status"] = "completed"
            meeting["ended_at"] = datetime.now().isoformat()
            
            # Extract unique speakers
            if speaker_aligned:
                speakers = set()
                for seg in speaker_aligned:
                    speakers.add(seg.get("speaker", "UNKNOWN"))
                meeting["participants"] = [{"name": s, "avatar": s[0] if s != "UNKNOWN" else "?"} for s in speakers]
        
        # Update MongoDB
        if meeting_doc:
            transcript_objs = []
            if speaker_aligned:
                for seg in speaker_aligned:
                    transcript_objs.append({
                        "speaker": seg.get("speaker", "UNKNOWN"),
                        "text": seg.get("text", ""),
                        "timestamp": seg.get("start", 0.0)
                    })
            
            action_items_list = []
            action_items_str = result.get("action_items", "")
            if action_items_str:
                action_items_list = [item.strip() for item in action_items_str.split("\n") if item.strip()]
            
            await meetings_collection.update_one(
                {"_id": ObjectId(meeting_id)},
                {
                    "$set": {
                        "status": "completed",
                        "transcript": transcript_objs,
                        "summary": result.get("summary", ""),
                        "action_items": action_items_list,
                        "started_at": datetime.utcnow(),
                        "ended_at": datetime.utcnow()
                    }
                }
            )
        
        # Send WebSocket update: Summary and action items
        await manager.send_summary(
            meeting_id,
            result.get("summary", ""),
            action_items_list if meeting_doc else result.get("action_items", "").split("\n")
        )
        
        # Send WebSocket update: Processing completed
        await manager.send_status_update(meeting_id, "completed", {
            "message": "Meeting processing completed successfully!",
            "stage": "done"
        })
        
        # Index meeting for RAG/Chat (async - don't block response)
        try:
            from backend.rag_engine import get_rag_engine
            rag_engine = get_rag_engine()
            
            # Prepare transcript text for indexing
            if speaker_aligned:
                transcript_text = "\n".join([f"{seg.get('speaker', 'UNKNOWN')}: {seg.get('text', '')}" for seg in speaker_aligned])
            else:
                transcript_text = full_transcript or result.get("summary", "")
            
            # Index the meeting
            rag_engine.index_meeting(
                meeting_id=meeting_id,
                transcript=transcript_text,
                summary=result.get("summary", ""),
                action_items=result.get("action_items", "")
            )
            print(f"✅ Meeting {meeting_id} indexed for chat")
        except Exception as rag_error:
            print(f"⚠️  RAG indexing failed (chat will be unavailable): {rag_error}")

        return {
            "success": True,
            "meeting_id": meeting_id,
            "status": "completed",
            "summary": result.get("summary", ""),
            "action_items": result.get("action_items", "")
        }

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"❌ Audio processing failed for meeting {meeting_id}:")
        logger.error(error_details)
        
        if meeting:
            meeting["status"] = "error"
        
        # Send WebSocket error
        await manager.send_error(meeting_id, str(e))
        
        return JSONResponse(status_code=500, content={"error": str(e), "details": error_details})

# POST /api/meetings/{meeting_id}/end - End a meeting (PROTECTED)
@app.post("/api/meetings/{meeting_id}/end")
async def end_meeting(
    meeting_id: str,
    current_user: str = Depends(get_current_user_email)
):
    """End a meeting session"""
    meetings_collection = get_meetings_collection()
    
    # Try MongoDB first
    from bson import ObjectId
    try:
        meeting_doc = await meetings_collection.find_one({"_id": ObjectId(meeting_id)})
    except:
        meeting_doc = None
        
    if meeting_doc:
        await meetings_collection.update_one(
            {"_id": ObjectId(meeting_id)},
            {"$set": {"status": "completed", "ended_at": datetime.utcnow()}}
        )
    
    # Fallback to in-memory
    meeting = meetings_db.get(meeting_id)
    if not meeting and not meeting_doc:
        return JSONResponse(status_code=404, content={"error": "Meeting not found"})
    
    if meeting and meeting["status"] == "live":
        meeting["status"] = "completed"
        meeting["ended_at"] = datetime.now().isoformat()
    
    return {
        "success": True,
        "meeting_id": meeting_id,
        "status": meeting["status"]
    }

# GET /api/meetings/{meeting_id}/report - Get full meeting report (PROTECTED)
@app.get("/api/meetings/{meeting_id}/report")
async def get_meeting_report(
    meeting_id: str,
    current_user: str = Depends(get_current_user_email)
):
    """Get complete meeting report from MongoDB"""
    from bson import ObjectId
    meetings_collection = get_meetings_collection()
    
    try:
        meeting_doc = await meetings_collection.find_one({"_id": ObjectId(meeting_id)})
    except:
        meeting_doc = None
    
    # Fallback to in-memory
    if not meeting_doc:
        meeting = meetings_db.get(meeting_id)
        if not meeting:
            return JSONResponse(status_code=404, content={"error": "Meeting not found"})
        return {
            "id": meeting["id"],
            "name": meeting["name"],
            "date": meeting["created_at"],
            "duration": "N/A",
            "summary": meeting.get("summary", ""),
            "summary_hi": meeting.get("summary_hi", ""),
            "action_items": meeting.get("action_items", ""),
            "participants": meeting["participants"],
            "transcript": meeting["speaker_aligned"] if meeting["speaker_aligned"] else meeting["transcript"],
            "status": meeting["status"]
        }
    
    # Return from MongoDB with new schema
    return {
        "id": str(meeting_doc["_id"]),
        "title": meeting_doc.get("title", meeting_doc.get("participant_name", "Untitled Meeting")),
        "name": meeting_doc.get("participant_name"),
        "date": meeting_doc["created_at"].isoformat() if meeting_doc.get("created_at") else None,
        "duration": meeting_doc.get("duration_seconds"),
        "summary": meeting_doc.get("summary", ""),
        "action_items": meeting_doc.get("action_items", []),
        "participants": list(meeting_doc.get("speaker_stats", {}).keys()) if meeting_doc.get("speaker_stats") else [],
        "transcript": meeting_doc.get("transcript", []),
        "speaker_stats": meeting_doc.get("speaker_stats", {}),
        "status": meeting_doc["status"],
        "audio_url": meeting_doc.get("audio_url"),
        "started_at": meeting_doc.get("started_at").isoformat() if meeting_doc.get("started_at") else None,
        "ended_at": meeting_doc.get("ended_at").isoformat() if meeting_doc.get("ended_at") else None
    }

# GET /api/meetings/{meeting_id}/actions - Get action items (PROTECTED)
@app.get("/api/meetings/{meeting_id}/actions")
async def get_action_items(
    meeting_id: str,
    current_user: str = Depends(get_current_user_email)
):
    """Get action items for a meeting"""
    from bson import ObjectId
    meetings_collection = get_meetings_collection()
    
    try:
        meeting_doc = await meetings_collection.find_one({"_id": ObjectId(meeting_id)})
    except:
        meeting_doc = None
    
    # Fallback to in-memory
    if not meeting_doc:
        meeting = meetings_db.get(meeting_id)
        if not meeting:
            return JSONResponse(status_code=404, content={"error": "Meeting not found"})
        
        # Parse action items if they exist
        action_items = []
        if meeting.get("action_items"):
            items = meeting["action_items"].split("\n")
            for item in items:
                if item.strip():
                    action_items.append({
                        "id": str(uuid.uuid4())[:8],
                        "text": item.strip(),
                        "completed": False,
                        "assignee": None
                    })
        return {"action_items": action_items}
    
    # Parse from MongoDB
    action_items = []
    for item in meeting_doc.get("action_items", []):
        action_items.append({
            "id": str(uuid.uuid4())[:8],
            "text": item,
            "completed": False,
            "assignee": None
        })
    
    return {"action_items": action_items}

# GET /api/meetings/{meeting_id}/pdf - Download PDF report (PROTECTED)
@app.get("/api/meetings/{meeting_id}/pdf")
async def download_meeting_pdf(
    meeting_id: str,
    current_user: str = Depends(get_current_user_email)
):
    """Download meeting report as PDF"""
    from bson import ObjectId
    meetings_collection = get_meetings_collection()
    
    # Try MongoDB first
    try:
        meeting_doc = await meetings_collection.find_one({"_id": ObjectId(meeting_id)})
    except:
        meeting_doc = None
    
    # Fallback to in-memory
    meeting = meetings_db.get(meeting_id)
    if not meeting and not meeting_doc:
        return JSONResponse(status_code=404, content={"error": "Meeting not found"})
    
    # Use MongoDB doc if available
    if meeting_doc:
        meeting = {
            "meeting_id": str(meeting_doc["_id"]),
            "name": meeting_doc.get("title", "Meeting"),
            "summary": meeting_doc.get("summary", ""),
            "action_items": meeting_doc.get("action_items", []),
            "transcript": meeting_doc.get("transcript", []),
            "speaker_aligned": [{"speaker": t.get("speaker"), "text": t.get("text")} for t in meeting_doc.get("transcript", [])],
            "summary_hi": meeting_doc.get("summary_hi", ""),
            "created_at": meeting_doc.get("created_at"),
            "status": meeting_doc.get("status")
        }
    
    try:
        # Build speaker-tagged text
        if meeting["speaker_aligned"]:
            speaker_tagged_text = build_speaker_tagged_text(meeting["speaker_aligned"])
        else:
            speaker_tagged_text = meeting.get("summary", "No content available")
        
        # Generate PDF
        pdf_path = f"output/meeting_{meeting_id}.pdf"
        generate_pdf(speaker_tagged_text, meeting.get("summary_hi", ""), pdf_path)
        
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"meeting_{meeting['name']}_{meeting_id}.pdf"
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# POST /api/meetings/{meeting_id}/email - Send meeting summary via email
class EmailRequest(BaseModel):
    email: EmailStr
    meeting_id: str

@app.post("/api/meetings/{meeting_id}/email")
async def send_meeting_email(
    meeting_id: str,
    email: EmailStr,
    current_user: str = Depends(get_current_user_email)
):
    """Send meeting summary via email (requires authentication)"""
    from bson import ObjectId
    meetings_collection = get_meetings_collection()
    
    # Try MongoDB first
    try:
        meeting_doc = await meetings_collection.find_one({"_id": ObjectId(meeting_id)})
    except:
        meeting_doc = None
    
    meeting = meetings_db.get(meeting_id)
    
    if not meeting and not meeting_doc:
        return JSONResponse(status_code=404, content={"error": "Meeting not found"})
    
    # Use MongoDB doc if available
    if meeting_doc:
        meeting = {
            "meeting_id": str(meeting_doc["_id"]),
            "name": meeting_doc.get("title", "Meeting"),
            "summary": meeting_doc.get("summary", ""),
            "action_items": meeting_doc.get("action_items", []),
            "transcript": meeting_doc.get("transcript", []),
            "speaker_aligned": [{"speaker": t.get("speaker"), "text": t.get("text")} for t in meeting_doc.get("transcript", [])],
            "summary_hi": meeting_doc.get("summary_hi", ""),
            "created_at": meeting_doc.get("created_at"),
            "status": meeting_doc.get("status")
        }
    
    try:
        # Build speaker-tagged text for PDF
        if meeting["speaker_aligned"]:
            speaker_tagged_text = build_speaker_tagged_text(meeting["speaker_aligned"])
        else:
            speaker_tagged_text = meeting.get("summary", "No content available")
        
        # Generate PDF
        pdf_path = f"output/meeting_{meeting_id}.pdf"
        generate_pdf(speaker_tagged_text, meeting.get("summary_hi", ""), pdf_path)
        
        # Prepare email body
        action_items_text = ""
        if meeting.get("action_items"):
            action_items_text = f"\n\nAction Items:\n{meeting['action_items']}"
        
        email_body = f"""Hi,

Thank you for using Inclusive Meeting Assistant.

Meeting: {meeting['name']}
Date: {meeting['created_at']}
Status: {meeting['status']}

Please find attached the complete meeting summary with transcript and analysis.
{action_items_text}

Best regards,
Inclusive Meeting Assistant Team
"""
        
        # Send email
        send_email_with_attachment(
            receiver_email=str(email),
            subject=f"Meeting Summary: {meeting['name']}",
            body=email_body,
            attachment_path=pdf_path
        )
        
        return {
            "success": True,
            "message": f"Meeting summary sent to {email}",
            "meeting_id": meeting_id
        }
        
    except FileNotFoundError:
        return JSONResponse(status_code=404, content={"error": "PDF file not found. Please generate the report first."})
    except smtplib.SMTPException as e:
        return JSONResponse(status_code=500, content={"error": f"Failed to send email: {str(e)}"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Failed to send email: {str(e)}"})

# Legacy endpoint for backward compatibility
@app.post("/send-summary/")
async def send_summary_email(request: EmailRequest):
    """[DEPRECATED] Send meeting summary via email - Use /api/meetings/{id}/email instead"""
    return await send_meeting_email(request.meeting_id, request.email)

# ====== CHAT WITH MEETING (RAG) ENDPOINTS ======

@app.post("/api/meetings/{meeting_id}/chat", response_model=ChatResponse)
async def chat_with_meeting(
    meeting_id: str,
    message: ChatMessage,
    current_user: str = Depends(get_current_user_email)
):
    """
    Chat with meeting transcript using RAG (Retrieval-Augmented Generation)
    
    This endpoint allows users to ask questions about the meeting and get
    answers based on the transcript content with citations.
    
    Args:
        meeting_id: The meeting to query
        message: Chat message with question
        current_user: Authenticated user email
        
    Returns:
        ChatResponse with answer, sources, and citations
        
    Example:
        POST /api/meetings/123/chat
        {
            "meeting_id": "123",
            "question": "What did John say about the deadline?"
        }
    """
    try:
        # Verify meeting exists and user has access
        meetings_collection = get_meetings_collection()
        from bson import ObjectId
        try:
            meeting_doc = await meetings_collection.find_one({"_id": ObjectId(meeting_id)})
        except:
            meeting_doc = None
        
        if not meeting_doc:
            raise HTTPException(
                status_code=404,
                detail="Meeting not found"
            )
        
        # Check if meeting is completed (RAG only works on processed meetings)
        if meeting_doc.get("status") != "completed":
            raise HTTPException(
                status_code=400,
                detail="Meeting must be completed before using chat feature"
            )
        
        # Import RAG engine
        from backend.rag_engine import get_rag_engine
        rag_engine = get_rag_engine()
        
        # Query the meeting
        result = rag_engine.query_meeting(meeting_id, message.question, top_k=3)
        
        # Check for errors
        if "error" in result:
            raise HTTPException(
                status_code=400,
                detail=result.get("message", "Failed to query meeting")
            )
        
        # Return response
        return ChatResponse(
            question=result["question"],
            answer=result["answer"],
            sources=result["sources"],
            meeting_id=meeting_id,
            timestamp=datetime.utcnow()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Chat error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat query: {str(e)}"
        )

@app.get("/api/meetings/{meeting_id}/chat/health")
async def check_rag_health(
    meeting_id: str,
    current_user: str = Depends(get_current_user_email)
):
    """
    Check if RAG indexing is available for a meeting
    
    Returns:
        Status of RAG availability for the meeting
    """
    try:
        from backend.rag_engine import get_rag_engine
        rag_engine = get_rag_engine()
        
        collection_name = f"meeting_{meeting_id}"
        try:
            collection = rag_engine.client.get_collection(name=collection_name)
            count = collection.count()
            
            return {
                "indexed": True,
                "meeting_id": meeting_id,
                "chunk_count": count,
                "status": "ready"
            }
        except:
            return {
                "indexed": False,
                "meeting_id": meeting_id,
                "chunk_count": 0,
                "status": "not_indexed",
                "message": "This meeting has not been indexed for chat yet"
            }
            
    except Exception as e:
        return {
            "indexed": False,
            "meeting_id": meeting_id,
            "error": str(e),
            "status": "error"
        }

@app.put("/api/meetings/{meeting_id}/title")
async def update_meeting_title(
    meeting_id: str,
    title: str = Form(...),
    current_user_email: str = Depends(get_current_user_email)
):
    """
    Update meeting title
    
    Allows users to rename/edit meeting titles for better organization
    """
    try:
        from bson import ObjectId
        meetings_collection = get_meetings_collection()
        
        # Try to find meeting by ObjectId first
        try:
            result = await meetings_collection.update_one(
                {"_id": ObjectId(meeting_id), "user_email": current_user_email},
                {"$set": {"title": title}}
            )
        except:
            # Fallback to string meeting_id
            result = await meetings_collection.update_one(
                {"meeting_id": meeting_id, "user_email": current_user_email},
                {"$set": {"title": title}}
            )
        
        if result.modified_count > 0:
            return {
                "success": True,
                "message": "Meeting title updated successfully",
                "meeting_id": meeting_id,
                "new_title": title
            }
        else:
            # Check if meeting exists but no changes were made
            try:
                existing = await meetings_collection.find_one(
                    {"_id": ObjectId(meeting_id), "user_email": current_user_email}
                )
            except:
                existing = await meetings_collection.find_one(
                    {"meeting_id": meeting_id, "user_email": current_user_email}
                )
            
            if existing:
                return {
                    "success": True,
                    "message": "Title is already set to this value",
                    "meeting_id": meeting_id,
                    "new_title": title
                }
            else:
                raise HTTPException(
                    status_code=404,
                    detail="Meeting not found or you don't have permission to edit it"
                )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating meeting title: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update meeting title: {str(e)}"
        )

@app.delete("/api/meetings/{meeting_id}/chat")
async def delete_meeting_rag_index(
    meeting_id: str,
    current_user: str = Depends(get_current_user_email)
):
    """
    Delete RAG index for a meeting (cleanup)
    
    This endpoint removes the vector embeddings for a meeting
    """
    try:
        from backend.rag_engine import get_rag_engine
        rag_engine = get_rag_engine()
        rag_engine.delete_meeting_index(meeting_id)
        
        return {
            "success": True,
            "meeting_id": meeting_id,
            "message": "RAG index deleted successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete RAG index: {str(e)}"
        )

# ====== END RAG ENDPOINTS ======


# ====== END NEW API ENDPOINTS ======
# inside app startup:
@app.on_event("startup")
async def load_models():
    # Skip model loading if environment variable is set
    if os.getenv('SKIP_MODEL_PRELOAD') == '1':
        print("⚠️  Model preloading skipped. Models will load on first use.")
        print("✅ Server started successfully.")
        return
    
    # preload NLP pipeline
    try:
        _ = nlp_pipeline
        print("✅ NLP models loaded and ready.")
    except Exception as e:
        print("⚠️  Warning: failed to preload NLP pipeline:", e)
    
    # preload diarization pipeline (optional; safe to wrap in try)
    if SPEAKER_DIARIZATION_AVAILABLE and preload_pipeline:
        try:
            preload_pipeline()
            print("✅ Diarization pipeline loaded.")
        except Exception as e:
            print("⚠️  Warning: Diarization pipeline not available:")
            print(f"   {str(e)[:100]}")
            print("   Speaker diarization features will be disabled.")
    else:
        print("ℹ️  Diarization pipeline not loaded (feature disabled)")

# ====== MAIN ENDPOINTS ======

@app.post("/process-audio/")
async def process_audio(audio: UploadFile = File(...), lang: str = Form("en"), email: str = Form(...)):
    try:
        temp_id = str(uuid.uuid4())[:8]
        audio_path = f"speech_Module/temp_{temp_id}.wav"
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        # --- Step A: Diarization (safe) ---
        diarization_result = []
        if SPEAKER_DIARIZATION_AVAILABLE and diarize_audio:
            try:
                diarization_result = diarize_audio(audio_path) or []
            except Exception as e:
                print("Diarization failed, continuing without it:", e)
        else:
            print("⚠️  Speaker diarization skipped (not available)")

        # --- Step B: Run existing pipeline (ASR, summary, etc.) ---
        result = run_pipeline_from_audio(audio_path, lang)

        # Try to obtain transcript segments from result (your pipeline should supply these if possible)
        transcript_segments = result.get("transcript_segments")  # expected [{'start','end','text'}, ...]
        full_transcript = result.get("transcript") or result.get("full_transcript") or result.get("summary_audio")

        # --- Step C: Align transcripts with diarization ---
        speaker_aligned = []
        if transcript_segments and diarization_result:
            speaker_aligned = align_transcript_with_diarization(transcript_segments, diarization_result)
        elif full_transcript and diarization_result:
            # fallback: naive proportional split
            speaker_aligned = naive_align_text_to_diarization(full_transcript, diarization_result)
        else:
            # nothing to align; speaker_aligned stays empty
            speaker_aligned = []

        # Build speaker-tagged text for PDF (or fall back to summary if no transcript)
        if speaker_aligned:
            speaker_tagged_text = build_speaker_tagged_text(speaker_aligned)
        else:
            # fallback: tag the single summary with UNKNOWN speaker
            summary_text = result.get("summary", "")
            speaker_tagged_text = f"[UNKNOWN] 0.00s - 0.00s: {summary_text}"

        # --- Step D: Generate PDF using speaker-tagged text ---
        pdf_path = f"output/meeting_summary_{lang}.pdf"
        # If your generate_pdf expects (summary, translated), you might modify it or wrap it.
        # Here we call it with the speaker_tagged_text as the primary content.
        generate_pdf(speaker_tagged_text, result.get("translated", ""), pdf_path)

        # --- Step E: Emailing etc (same as before) ---
        action_items_text = f"\nAction Items:\n{result['action_items']}" if result.get("action_items") else ""
        email_body = f"""Hi,

Thank you for using Inclusive Meeting Assistant. 
Please find attached the meeting summary in {lang.upper()}.
{action_items_text}
Regards,
Team Inclusive AI
"""
        send_email_with_attachment(email, "Meeting Summary", email_body, pdf_path)

        # Response: include diarization + aligned transcript
        return {
            "summary_en": result.get("summary"),
            "summary_hi": result.get("translated"),
            "summary_audio": result.get("summary_audio"),
            "action_items": result.get("action_items"),
            "diarization": diarization_result,
            "speaker_aligned": speaker_aligned
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ====== EMAIL INBOX ENDPOINTS ======

from email_inbox_service import EmailInboxService
from ora_bot_manager import bot_manager

@app.get("/api/inbox/invites")
async def get_inbox_invites(
    include_read: bool = True,  # Changed default to True to show all invites
    email: str = Depends(get_current_user_email)
):
    """
    Get all meeting invites from Ora's email inbox
    Returns list of unread (or all) emails containing Google Meet links
    Filters out meetings that already exist in database (any status)
    """
    try:
        inbox_service = EmailInboxService()
        invites = inbox_service.get_all_meeting_invites(include_read=include_read)
        
        # Filter out invites that already have ANY meeting record in DB
        meetings_collection = get_meetings_collection()
        users_collection = get_users_collection()
        user_doc = await users_collection.find_one({"email": email})
        
        if user_doc:
            # Get ALL meetings (any status) with meet links
            all_meetings = await meetings_collection.find({
                "user_id": str(user_doc["_id"]),
                "meet_link": {"$exists": True}
            }).to_list(length=1000)
            
            completed_links = {m.get("meet_link", "").strip() for m in all_meetings if m.get("meet_link")}
            
            # Filter invites - hide any that have been joined before
            invites = [
                inv for inv in invites 
                if inv.get("meet_link", "").strip() not in completed_links
            ]
        
        return {
            "success": True,
            "count": len(invites),
            "invites": invites
        }
    except Exception as e:
        logger.error(f"Error fetching inbox invites: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch inbox: {str(e)}"
        )

@app.post("/api/inbox/mark-read/{email_id}")
async def mark_invite_read(
    email_id: str,
    email: str = Depends(get_current_user_email)
):
    """
    Mark an email invite as read
    """
    try:
        inbox_service = EmailInboxService()
        inbox_service.mark_as_read(email_id)
        
        return {"success": True, "message": "Email marked as read"}
    except Exception as e:
        logger.error(f"Error marking email as read: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark email as read: {str(e)}"
        )

@app.post("/api/bot/join-meeting")
async def join_meeting_from_invite(
    meet_link: str = Form(...),
    meeting_title: str = Form(...),
    email: str = Depends(get_current_user_email)
):
    """
    Join a Google Meet from an invite
    Starts the bot to join the meeting and begin recording
    """
    try:
        # Get user document to get user_id
        users_collection = get_users_collection()
        user_doc = await users_collection.find_one({"email": email})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create a meeting record with user_id
        meetings_collection = get_meetings_collection()
        
        meeting_doc = {
            "user_id": str(user_doc["_id"]),
            "user_email": email,
            "title": meeting_title,
            "participant_name": meeting_title,
            "meet_link": meet_link,
            "status": "joining",
            "created_at": datetime.utcnow(),
            "bot_status": "starting"
        }
        
        result = await meetings_collection.insert_one(meeting_doc)
        meeting_id = str(result.inserted_id)
        
        # Start the bot using bot manager
        bot_result = bot_manager.start_bot(meeting_id, meet_link)
        
        if bot_result["success"]:
            # Update meeting with bot process ID
            await meetings_collection.update_one(
                {"_id": result.inserted_id},
                {"$set": {"bot_pid": bot_result["pid"], "bot_status": "joining"}}
            )
            
            return {
                "success": True,
                "meeting_id": meeting_id,
                "message": "Ora is joining the meeting...",
                "status": "joining",
                "bot_pid": bot_result["pid"]
            }
        else:
            # Update meeting status to failed
            await meetings_collection.update_one(
                {"_id": result.inserted_id},
                {"$set": {"bot_status": "failed", "status": "failed"}}
            )
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=bot_result.get("message", "Failed to start bot")
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error joining meeting: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to join meeting: {str(e)}"
        )

@app.get("/api/bot/status/{meeting_id}")
async def get_bot_status(
    meeting_id: str,
    email: str = Depends(get_current_user_email)
):
    """Get bot status for a meeting"""
    try:
        status_info = bot_manager.get_bot_status(meeting_id)
        return {"success": True, **status_info}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/bot/stop/{meeting_id}")
async def stop_meeting_bot(
    meeting_id: str,
    email: str = Depends(get_current_user_email)
):
    """Stop bot for a meeting"""
    try:
        result = bot_manager.stop_bot(meeting_id)
        
        if result["success"]:
            # Update meeting status in database
            meetings_collection = get_meetings_collection()
            await meetings_collection.update_one(
                {"_id": meeting_id},
                {"$set": {"bot_status": "stopped", "status": "completed"}}
            )
        
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/meetings/log-manual")
async def log_manual_meeting(
    meet_link: str = Form(...),
    meeting_title: str = Form(...),
    email: str = Depends(get_current_user_email)
):
    """
    Log a meeting that was joined manually (from Gmail)
    This creates a meeting record without starting the bot
    """
    try:
        # Get user document to get user_id
        users_collection = get_users_collection()
        user_doc = await users_collection.find_one({"email": email})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if meeting already exists
        meetings_collection = get_meetings_collection()
        existing = await meetings_collection.find_one({
            "user_id": str(user_doc["_id"]),
            "meet_link": meet_link
        })
        
        if existing:
            return {
                "success": True, 
                "meeting_id": str(existing["_id"]),
                "message": "Meeting already logged"
            }
        
        # Create a meeting record for manual join
        meeting_doc = {
            "user_id": str(user_doc["_id"]),
            "user_email": email,
            "title": meeting_title,
            "participant_name": meeting_title,
            "meet_link": meet_link,
            "status": "manual_join",
            "created_at": datetime.utcnow(),
            "bot_status": "manual",
            "manual_join": True
        }
        
        result = await meetings_collection.insert_one(meeting_doc)
        meeting_id = str(result.inserted_id)
        
        return {
            "success": True,
            "meeting_id": meeting_id,
            "message": "Meeting logged successfully. You can upload recording later."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging manual meeting: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log meeting: {str(e)}"
        )

@app.post("/api/meetings/start-recording")
async def start_recording(
    meet_link: str = Form(...),
    meeting_title: str = Form(...),
    email: str = Depends(get_current_user_email)
):
    """
    Start recording for a meeting that user is joining manually from Gmail.
    Automatically launches audio capture script.
    """
    try:
        # Get user document to get user_id
        users_collection = get_users_collection()
        user_doc = await users_collection.find_one({"email": email})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if meeting already exists
        meetings_collection = get_meetings_collection()
        existing = await meetings_collection.find_one({
            "user_id": str(user_doc["_id"]),
            "meet_link": meet_link
        })
        
        if existing:
            # Update status to recording
            await meetings_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {"status": "recording", "bot_status": "recording_system_audio", "updated_at": datetime.utcnow()}}
            )
            meeting_id = str(existing["_id"])
        else:
            # Create a new meeting record
            meeting_doc = {
                "user_id": str(user_doc["_id"]),
                "user_email": email,
                "title": meeting_title,
                "participant_name": meeting_title,
                "meet_link": meet_link,
                "status": "recording",
                "created_at": datetime.utcnow(),
                "bot_status": "recording_system_audio",
                "manual_join": True,
                "instructions": "Audio capture running automatically"
            }
            
            result = await meetings_collection.insert_one(meeting_doc)
            meeting_id = str(result.inserted_id)
        
        logger.info(f"📹 Recording started for meeting: {meeting_id} - {meeting_title}")
        
        # Launch audio capture script automatically
        try:
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            capture_script = os.path.join(project_root, "capture_audio.py")
            
            # Get JWT token for the user (create a long-lived token)
            from auth import create_access_token
            token = create_access_token(data={"sub": email}, expires_delta=timedelta(hours=24))
            
            # Launch in new terminal window
            if sys.platform == "win32":
                # Windows: Launch in new PowerShell window
                subprocess.Popen(
                    ["powershell", "-NoExit", "-Command", 
                     f"cd '{project_root}'; python capture_audio.py {meeting_id} {token}"],
                    creationflags=subprocess.CREATE_NEW_CONSOLE
                )
            else:
                # Linux/Mac: Launch in background
                subprocess.Popen(
                    ["python3", capture_script, meeting_id, token],
                    cwd=project_root
                )
            
            logger.info(f"✅ Audio capture script launched automatically for meeting {meeting_id}")
            
            return {
                "success": True,
                "meeting_id": meeting_id,
                "message": "Recording started! Audio capture window opened automatically. Now click 'Open in Gmail' to join the meeting.",
                "auto_capture": True
            }
            
        except Exception as script_error:
            logger.error(f"⚠️ Failed to auto-launch capture script: {str(script_error)}")
            # Fallback: Return manual instructions
            return {
                "success": True,
                "meeting_id": meeting_id,
                "message": f"Recording ready! Run manually: python capture_audio.py {meeting_id}",
                "auto_capture": False
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting recording: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start recording: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


