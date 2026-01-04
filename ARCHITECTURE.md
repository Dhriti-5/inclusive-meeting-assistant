# 🏗️ Ora AI Meeting Assistant - Technical Architecture

## System Overview

Ora is a full-stack AI-powered meeting assistant that automates meeting participation, recording, transcription, and post-meeting analysis. Built with modern technologies for scalability and performance.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    (React + Tailwind CSS)                        │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Dashboard │  │  Inbox   │  │ Meeting  │  │  Profile │       │
│  │          │  │          │  │ Details  │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP/REST API (JWT Auth)
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                      BACKEND API LAYER                           │
│                      (FastAPI + Python)                          │
│                                                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Auth      │ │   Inbox     │ │  Meetings   │              │
│  │   Service   │ │   Service   │ │   Service   │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │    Bot      │ │    Email    │ │     PDF     │              │
│  │  Manager    │ │   Service   │ │  Generator  │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└───────┬─────────────┬─────────────┬────────────────────────────┘
        │             │             │
        │             │             ▼
        │             │      ┌─────────────┐
        │             │      │  MongoDB    │
        │             │      │  Database   │
        │             │      └─────────────┘
        │             │
        │             ▼
        │      ┌─────────────┐
        │      │Gmail IMAP   │
        │      │Email Inbox  │
        │      └─────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BOT ENGINE LAYER                           │
│                    (Node.js + Puppeteer)                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Headless Chrome Browser                                 │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  Google Meet Session                              │   │   │
│  │  │  • Auto-join via authenticated cookies            │   │   │
│  │  │  • Audio stream capture                           │   │   │
│  │  │  • Persistent connection management               │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│                   ┌─────────────────┐                           │
│                   │  Audio Stream   │                           │
│                   │  (WAV/WebM)     │                           │
│                   └─────────────────┘                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AI/ML PROCESSING LAYER                       │
│                                                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Whisper   │ │  PyAnnote   │ │Transformers │              │
│  │Transcription│ │ Diarization │ │Summarization│              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │  FLAN-T5    │ │   NLP       │ │Translation  │              │
│  │Action Items │ │  Pipeline   │ │   Engine    │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next-generation build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **FastAPI** - High-performance async Python framework
- **Motor** - Async MongoDB driver
- **PyJWT** - JWT token authentication
- **Python-Jose** - Cryptographic signing
- **Passlib** - Password hashing (bcrypt)
- **IMAP/SMTP** - Email integration
- **Uvicorn** - ASGI server

### Bot Engine
- **Node.js** - JavaScript runtime
- **Puppeteer** - Headless browser automation
- **Puppeteer-Extra** - Stealth plugins
- **Puppeteer-Stream** - Audio capture
- **Chrome/Chromium** - Browser engine

### AI/ML
- **OpenAI Whisper** - Speech-to-text (large-v2)
- **PyAnnote.audio** - Speaker diarization
- **Hugging Face Transformers** - NLP models
  - distilbart-cnn-12-6 (summarization)
  - google/flan-t5-base (action items)
- **Torch** - Deep learning framework

### Database & Storage
- **MongoDB** - NoSQL document database
- **GridFS** - File storage (audio recordings)

## Key Features & Implementation

### 1. Email Integration (IMAP)
```
Gmail IMAP → Parse Emails → Extract Meet Links → Display in Inbox UI
```
- Polls Gmail inbox every few seconds
- Regex pattern matching for Google Meet URLs
- Marks emails as read after joining
- Extracts meeting metadata (subject, sender, time)

### 2. Authenticated Bot
```
User Cookies → Puppeteer → Google Meet → Audio Capture → Storage
```
- Uses exported Google account cookies
- Puppeteer stealth mode to avoid detection
- Navigates through "Ask to Join" flows
- Captures audio stream via puppeteer-stream
- Saves as WAV/WebM files

### 3. Transcription Pipeline
```
Audio File → Whisper Model → Text Chunks → Speaker Diarization → Tagged Transcript
```
- Whisper large-v2 model (high accuracy)
- Segments audio into manageable chunks
- PyAnnote identifies speakers (SPEAKER_00, SPEAKER_01, etc.)
- Aligns transcript with speaker timestamps

### 4. AI Summarization
```
Transcript → BART Model → Extractive Summary → Bullet Points
```
- distilbart-cnn-12-6 (efficient summarization)
- Multiple summary lengths (brief, detailed)
- Key points extraction
- Multilingual support

### 5. Action Items Extraction
```
Transcript → FLAN-T5 → Task Detection → Structured Output
```
- google/flan-t5-base model
- Identifies action verbs (will do, should, need to)
- Extracts assignees and deadlines
- Bullet-point format

### 6. PDF Generation
```
Meeting Data → Template → FPDF → PDF Report
```
- Professional report layout
- Includes all sections (summary, transcript, actions)
- Downloadable from UI

### 7. Email Delivery
```
PDF Report → SMTP → Recipient Inbox
```
- Gmail SMTP integration
- Attachment support
- HTML email templates

## Data Flow

### Meeting Join Flow
```
1. User creates Google Meet
2. Adds Ora's email as participant
3. Ora receives email invite
4. Email appears in Ora's inbox UI
5. User clicks "Join Call"
6. Backend creates meeting record in MongoDB
7. Bot manager spawns Puppeteer process
8. Bot navigates to Meet URL with cookies
9. Bot joins meeting and starts audio capture
10. Audio saved to temp directory
```

### Post-Meeting Processing Flow
```
1. Meeting ends, audio file saved
2. Whisper transcribes audio → text
3. PyAnnote identifies speakers
4. Transcript aligned with speakers
5. BART generates summary
6. FLAN-T5 extracts action items
7. All data saved to MongoDB
8. User views in UI
9. PDF generated on request
10. Email sent if requested
```

## Security Implementation

### Authentication
- JWT tokens with expiration
- bcrypt password hashing (salt rounds: 12)
- OAuth2 password flow
- Protected endpoints with dependency injection

### Secrets Management
- Environment variables (.env)
- Google App Passwords (not regular passwords)
- Cookie encryption for bot
- MongoDB connection string security

### API Security
- CORS middleware (whitelist origins)
- Input validation with Pydantic
- SQL injection prevention (NoSQL)
- Rate limiting (TODO in production)

## Database Schema

### Users Collection
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "password_hash": "bcrypt_hash",
  "name": "User Name",
  "created_at": ISODate
}
```

### Meetings Collection
```json
{
  "_id": ObjectId,
  "user_email": "user@example.com",
  "title": "Meeting Title",
  "meet_link": "https://meet.google.com/xxx-xxxx-xxx",
  "status": "completed",
  "created_at": ISODate,
  "duration": "45 minutes",
  "transcript": "Full transcript...",
  "summary": "AI summary...",
  "action_items": ["Item 1", "Item 2"],
  "audio_file_path": "/path/to/audio.wav",
  "bot_pid": 12345,
  "bot_status": "completed"
}
```

## Performance Optimizations

1. **Async/Await**: All I/O operations are async (FastAPI + Motor)
2. **Lazy Loading**: AI models loaded on first use
3. **Streaming**: Audio processed in chunks
4. **Caching**: (TODO) Redis for session data
5. **Background Tasks**: Bot runs in separate process
6. **WebSocket**: Real-time updates (TODO for live transcription)

## Scalability Considerations

### Current Architecture (Single Server)
- Supports ~10 concurrent meetings
- Local file storage
- Single MongoDB instance

### Production Architecture (Scaled)
- **Load Balancer**: Nginx/AWS ALB
- **Multiple Backend Instances**: Docker + Kubernetes
- **Bot Pool**: Multiple bot containers
- **Cloud Storage**: Azure Blob/S3 for audio files
- **MongoDB Atlas**: Managed database with replicas
- **Redis**: Session and cache management
- **Message Queue**: RabbitMQ/Kafka for job processing

## Deployment Strategy

### Development
```
Local Machine → Python + Node.js → MongoDB Local
```

### Production
```
GitHub → CI/CD Pipeline → Docker Containers → Azure/AWS
                                    ↓
                            Load Balancer
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
              Backend 1       Backend 2       Backend 3
                    ↓               ↓               ↓
              MongoDB Atlas (Replica Set)
```

## Monitoring & Logging

- **Backend Logs**: Python logging module
- **Bot Logs**: Console output + file
- **Error Tracking**: (TODO) Sentry integration
- **Analytics**: (TODO) Mixpanel/Amplitude
- **Uptime Monitoring**: (TODO) Pingdom/UptimeRobot

## Future Enhancements

1. **Real-time Transcription**: WebSocket for live updates
2. **Multi-platform Support**: Microsoft Teams, Zoom
3. **RAG Chat**: Ask questions about past meetings
4. **Mobile App**: React Native
5. **Calendar Integration**: Google Calendar API
6. **Analytics Dashboard**: Meeting insights & trends
7. **Team Features**: Shared meetings, collaboration
8. **Voice Commands**: Control bot via voice

## Resume Highlights

✅ **Full-Stack Development**: React frontend + FastAPI backend  
✅ **AI/ML Integration**: Whisper, Transformers, PyAnnote  
✅ **Browser Automation**: Puppeteer for complex workflows  
✅ **Email Automation**: IMAP/SMTP integration  
✅ **Database Design**: MongoDB schema design  
✅ **Authentication**: JWT + OAuth2 implementation  
✅ **Async Programming**: Python async/await patterns  
✅ **API Design**: RESTful endpoints with proper status codes  
✅ **Modern UI/UX**: Tailwind CSS + responsive design  
✅ **PDF Generation**: Dynamic report creation  

---

**Built with modern best practices for production-ready deployment**
