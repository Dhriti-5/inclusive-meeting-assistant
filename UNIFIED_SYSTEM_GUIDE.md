# 🚀 Inclusive Meeting Assistant - Unified System Quick Start

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   INCLUSIVE MEETING ASSISTANT                │
│                        Unified System                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │◄────────┤   Backend    │◄────────┤   MongoDB    │
│  React + Vite│  HTTP   │   FastAPI    │  Driver │   Database   │
│  Port: 3000  │  +WS    │  Port: 8000  │         │   Port:27017 │
└──────────────┘         └──────────────┘         └──────────────┘
       ▲                        ▲
       │                        │
       │                        ├──────────────────────┐
       │                        │                      │
       │                  WebSocket              WebSocket
       │                        │                      │
┌──────┴──────┐         ┌───────┴──────┐      ┌──────┴──────┐
│  Dashboard  │         │ Sign Language│      │ Bot Engine  │
│   Browser   │         │   Detector   │      │  Puppeteer  │
│   Client    │         │  MediaPipe   │      │  Node.js    │
└─────────────┘         └──────────────┘      └─────────────┘
```

## 🎯 Quick Start (One Command)

```powershell
./start_unified_system.ps1
```

This script will:
1. ✅ Check and clear ports 3000 and 8000
2. ✅ Verify MongoDB is running
3. ✅ Start Backend on port 8000
4. ✅ Start Frontend on port 3000
5. ✅ Display access URLs

## 📍 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main dashboard UI |
| **Backend API** | http://localhost:8000 | REST API endpoints |
| **API Docs** | http://localhost:8000/docs | Swagger documentation |
| **WebSocket** | ws://localhost:8000/ws/meeting/{id} | Real-time communication |

## 🔧 Manual Startup (Step by Step)

### 1. Start MongoDB
```powershell
# Start MongoDB service
mongod --dbpath <your-db-path>
```

### 2. Start Backend
```powershell
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start Frontend
```powershell
cd frontend
npm run dev
```

### 4. (Optional) Start Sign Language Detection
```powershell
python sign_language/inference.py --meeting-id session_demo_1
```

### 5. (Optional) Start Bot Engine
```powershell
cd bot_engine
node bot_engine.js
```

## 🧪 Testing the System

### 1. Test WebSocket Connection
```powershell
python test_websocket_simple.py
```
Expected: `✅ CONNECTED!`

### 2. Test Dashboard
1. Open browser: http://localhost:3000
2. Register/Login
3. Navigate to meeting session
4. Should see real-time updates

### 3. Test Sign Language Detection
1. Run: `python sign_language/inference.py --meeting-id session_demo_1`
2. Show signs to webcam (hello, thanks, yes, no, question, check)
3. Check console for: `🚀 SENT TO MEETING: <gesture>`
4. Dashboard should display detected gestures in real-time

### 4. Test Audio Transcription
1. Upload audio file via dashboard
2. Check backend terminal for processing logs
3. View transcript in dashboard

## 🔍 Troubleshooting

### Frontend Can't Connect to Backend

**Problem:** CORS errors or connection refused

**Solution:**
```powershell
# Check backend is running
curl http://localhost:8000/docs

# Check frontend Vite config
# Ensure: target: 'http://localhost:8000' in vite.config.js
```

### WebSocket Connection Fails

**Problem:** `HTTP 403` or connection rejected

**Solution:**
- For demo/testing: Use demo token (starts with "demo")
- For production: Obtain JWT token via login
```javascript
ws://localhost:8000/ws/meeting/session_demo_1?token=demo_token
```

### Sign Language Not Detecting

**Problem:** Webcam not opening or no detections

**Solution:**
1. Check webcam permissions
2. Verify model file exists: `sign_language/meeting_actions.h5`
3. Check MediaPipe installation: `pip install mediapipe`

### Port Already in Use

**Problem:** `Address already in use` error

**Solution:**
```powershell
# Kill process on port 8000 (Backend)
Get-NetTCPConnection -LocalPort 8000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force

# Kill process on port 3000 (Frontend)
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
```

## 📦 System Components

### Core Services
- ✅ **MongoDB** - Data persistence
- ✅ **FastAPI Backend** - API + WebSocket server
- ✅ **React Frontend** - User interface
- ✅ **Sign Language Detector** - Real-time gesture recognition
- ⚙️ **Bot Engine** - Google Meet automation (optional)

### Key Features
1. **Real-time Communication** - WebSocket for instant updates
2. **Audio Transcription** - Whisper AI for speech-to-text
3. **Sign Language Detection** - LSTM + MediaPipe for gesture recognition
4. **NLP Processing** - Summary, action items, sentiment analysis
5. **Speaker Diarization** - Who said what
6. **Multi-language** - Translation support
7. **Email Reports** - Automated meeting summaries

## 🎛️ Configuration

### Frontend (vite.config.js)
```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
    '/ws': {
      target: 'ws://localhost:8000',
      ws: true,
    },
  },
}
```

### Backend (main.py)
```python
# CORS Configuration
allow_origins=[
    "http://localhost:3000",   # Vite dev server
    "http://localhost:5173",   # Alternative Vite port
]

# Server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Sign Language Detector (inference.py)
```python
# WebSocket URL
ws://localhost:8000/ws/meeting/{meeting_id}?token=demo_token_for_sign_language

# Demo meeting IDs
- session_demo_1
- session_demo_2
```

## 📊 Data Flow

### 1. Audio Processing Flow
```
Upload Audio → Backend API
    ↓
Whisper Transcription
    ↓
Speaker Diarization
    ↓
NLP Analysis
    ↓
Generate Summary
    ↓
Store in MongoDB
    ↓
Return Results to Dashboard
```

### 2. Sign Language Flow
```
Webcam → MediaPipe Detection
    ↓
LSTM Model Prediction
    ↓
WebSocket Message to Backend
    ↓
Broadcast to All Connected Clients
    ↓
Dashboard Updates in Real-time
```

### 3. Bot Automation Flow
```
Sign Language Gesture Detected
    ↓
WebSocket Event: "gesture_update"
    ↓
Bot Engine Receives Event
    ↓
Map Gesture to Action
    ↓
Puppeteer Types in Google Meet Chat
```

## 🔐 Authentication

### Demo Mode (Testing)
- **Token:** Any token starting with "demo"
- **Meeting ID:** Any ID starting with "session_demo"
- No authentication required

### Production Mode
1. Register: `POST /api/auth/register`
2. Login: `POST /api/auth/login`
3. Use JWT token in requests
4. WebSocket: `ws://...?token=<jwt_token>`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/me` - Get current user

### Meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings/history` - Get meeting history
- `GET /api/meetings/{id}` - Get meeting details
- `POST /api/meetings/upload-audio` - Upload audio file

### Sign Language
- `POST /api/sign-language/word` - Send detected word
- `GET /api/sign-language/commands` - Get command queue

### WebSocket
- `WS /ws/meeting/{meeting_id}` - Real-time meeting updates

## 🎨 Frontend Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Landing | Home page |
| `/login` | Login | User authentication |
| `/register` | Register | User registration |
| `/dashboard` | Dashboard | Main control panel |
| `/session/:id` | MeetingSession | Real-time meeting view |
| `/history` | History | Past meetings |

## 🚦 Status Indicators

### Backend Health Check
```bash
curl http://localhost:8000/
# Expected: {"message": "Welcome to Inclusive Meeting Assistant API"}
```

### Frontend Health Check
```bash
curl http://localhost:3000/
# Expected: React app HTML
```

### WebSocket Test
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/meeting/test?token=demo');
ws.onopen = () => console.log('✅ Connected');
```

## 📚 Additional Resources

- **Backend API Docs:** http://localhost:8000/docs
- **Project README:** [README.md](README.md)
- **Phase 3 Guide:** [PHASE3_COMPLETE_GUIDE.md](PHASE3_COMPLETE_GUIDE.md)
- **Sign Language Integration:** [SIGN_LANGUAGE_INTEGRATION.md](SIGN_LANGUAGE_INTEGRATION.md)

## 🆘 Support

If you encounter issues:
1. Check terminal logs for error messages
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check firewall/antivirus settings
5. Review troubleshooting section above

---

**Last Updated:** December 28, 2025
**System Version:** Unified Architecture v1.0
