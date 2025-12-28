# **Inclusive Meeting Assistant** 🎙🤝

An AI-powered, full-stack web application that makes meetings more **accessible and inclusive** for all participants. Built with **React**, **FastAPI**, **MongoDB**, and cutting-edge AI models, this system provides real-time transcription, sign language recognition, intelligent summarization, and comprehensive meeting analytics.

**🌟 Key Highlights:**
- 🔐 **Full User Authentication** with JWT tokens and MongoDB persistence
- ⚡ **Real-Time Communication** via WebSockets (no polling)
- 🤖 **Automated Meeting Bot** for Google Meet integration
- 🖐 **Dual Sign Language Support** - ML-based and browser-based detection
- 🎯 **Production-Ready** with responsive React UI and RESTful API
- 📊 **Complete Meeting Analytics** with speaker diarization and action items

---

## **✨ Core Features**

### **🔐 1. User Authentication & Authorization**
- **MongoDB Database** with Motor async driver
- **JWT Token-Based Authentication** with secure password hashing (bcrypt)
- **Protected API Endpoints** with OAuth2 password flow
- **User Registration & Login** with email validation
- **Profile Management** with user preferences
- **Meeting History** per user with full CRUD operations

### **🎤 2. Speech Recognition & Transcription**
- **OpenAI Whisper** integration for high-accuracy transcription
- **Real-time audio streaming** from meeting bot
- **Multiple language support** (English, Hindi, French, etc.)
- **Live transcript updates** via WebSocket
- **Speaker-attributed transcription** output

### **🖐 3. Dual Sign Language Recognition**

#### **ML-Based Recognition (Server-Side)**
- **TensorFlow LSTM model** with 6 basic meeting gestures
- Gestures: hello, yes, no, question, thanks, idle
- **>80% confidence threshold** for accuracy
- **Real-time WebSocket broadcasting** to all participants
- **Integrated with meeting chat** - signs appear in transcript feed
- Camera overlay with confidence display

#### **Browser-Based Detection (Client-Side)**
- **Google MediaPipe** hand landmark detection
- Recognizes **10 ASL letters** (A, B, C, D, F, I, L, O, V, Y) and **5 numbers** (1-5)
- **Client-side processing** - privacy-focused (no video upload)
- GPU-accelerated with 25-30 FPS performance
- Text accumulation, history, and export features

### **📝 4. Meeting Summarization**
- **HuggingFace Transformers** (`distilbart-cnn-12-6`)
- Condenses lengthy transcripts into concise summaries
- Multiple summary lengths: brief, detailed, executive
- Speaker-aware summaries with diarization integration

### **✅ 5. Action Item Extraction**
- **Google FLAN-T5** model for intelligent task extraction
- Automatically identifies decisions, todos, and next steps
- Structured bullet-point format
- Assignee detection and deadline extraction

### **🌍 6. Multilingual Translation**
- **Helsinki-NLP MarianMT** models
- Translates transcripts and summaries to multiple languages
- Supported: English ↔ Hindi, French, Spanish, German, and more
- Real-time translation option for live meetings

### **🔊 7. Text-to-Speech (TTS)**
- **pyttsx3** offline TTS engine
- Converts summaries and action items to audio
- Multiple voice options and speed control
- Generates meeting recap audio files

### **📧 8. Email & PDF Export**
- **SMTP integration** for automated email delivery
- **PDF generation** with fpdf2 library
- Includes transcripts, summaries, action items, and speaker breakdown
- Custom branding and formatting options

### **🧑‍🤝‍🧑 9. Speaker Diarization**
- **pyannote.audio** diarization pipeline
- Identifies "who spoke when" with timestamps
- Speaker labeling (SPEAKER_00, SPEAKER_01, etc.)
- Transcript-diarization alignment for speaker-attributed output
- Speaker time analysis and participation metrics

### **⚡ 10. Real-Time WebSocket Communication**
- **Eliminated polling** (97% reduction in network requests)
- **Sub-100ms latency** for live updates
- **Auto-reconnection** with exponential backoff
- **Connection status indicators** in UI
- **Event-driven architecture** for processing status updates
- Supports multiple concurrent meetings

### **🤖 11. Automated Meeting Bot**
- **Puppeteer-based automation** for Google Meet
- **Automated meeting joining** with URL parsing
- **Real-time audio capture** using puppeteer-stream
- **Live transcription streaming** to backend
- **Headless/visible modes** for debugging
- **Intelligent join detection** and error handling

### **💻 12. Modern React Frontend**
- **React 18** with Vite build system
- **Tailwind CSS** for responsive design
- **React Router** for navigation
- **Dark/Light theme** support
- **Real-time dashboard** with live metrics
- **Meeting session pages** with transcript viewer
- **Profile & settings** management
- **Mobile-responsive** design


---

## **🏗 System Architecture**

### **Technology Stack**

**Frontend:**
- React 18.2 with Vite 5.0
- Tailwind CSS 3.3 for styling
- React Router 6.21 for navigation
- Axios for HTTP requests
- WebSocket client for real-time updates
- MediaPipe Tasks Vision for sign language
- Lucide React for icons

**Backend:**
- FastAPI 0.116 (Python web framework)
- Motor 3.4 (MongoDB async driver)
- PyJWT for authentication
- Uvicorn ASGI server
- WebSocket support
- Passlib with bcrypt for password hashing

**AI/ML Models:**
- OpenAI Whisper (speech-to-text)
- Pyannote.audio (speaker diarization)
- DistilBART (summarization)
- FLAN-T5 (action item extraction)
- MarianMT (translation)
- TensorFlow/Keras LSTM (sign language)
- MediaPipe (hand landmark detection)

**Database:**
- MongoDB 7.0+ with async operations
- Collections: users, meetings, transcripts

**Bot Automation:**
- Puppeteer 24.15 (browser automation)
- puppeteer-stream 3.0 (audio capture)
- Node.js 18+ with ES modules
- WebSocket client for streaming

### **Project Structure**

```
inclusive-meeting-assistant/
├── backend/
│   ├── main.py                     # FastAPI app with all endpoints
│   ├── auth.py                     # JWT authentication logic
│   ├── database.py                 # MongoDB connection & helpers
│   ├── models.py                   # Pydantic data models
│   ├── websocket_manager.py        # WebSocket connection manager
│   ├── pipeline_runner.py          # NLP pipeline orchestration
│   ├── speaker_diarization.py      # Pyannote diarization
│   ├── bot_audio_processor.py      # Bot audio processing & Whisper
│   └── start_server.py             # Server startup script
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main app component & routing
│   │   ├── main.jsx                # React entry point
│   │   ├── index.css               # Global styles
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # User dashboard
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   ├── Profile.jsx         # User profile
│   │   │   ├── LiveMeeting.jsx     # Live meeting page (bot)
│   │   │   ├── MeetingSession.jsx  # Real-time meeting dashboard
│   │   │   ├── MeetingReport.jsx   # Meeting summary & report
│   │   │   └── SignLanguage.jsx    # Browser-based sign language
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx  # Authentication wrapper
│   │   │   ├── layout/             # Header, Sidebar components
│   │   │   ├── dashboard/          # Dashboard widgets
│   │   │   ├── live-session/       # Live meeting components
│   │   │   │   ├── TranscriptFeed.jsx
│   │   │   │   ├── SignLanguageCam.jsx
│   │   │   │   └── ControlPanel.jsx
│   │   │   └── shared/             # Reusable UI components
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx     # Authentication state
│   │   │   └── ThemeContext.jsx    # Theme management
│   │   ├── hooks/
│   │   │   └── useWebSocket.jsx    # WebSocket custom hook
│   │   ├── services/
│   │   │   └── api.js              # API client & interceptors
│   │   └── utils/
│   │       ├── gestureRecognition.js  # MediaPipe sign detection
│   │       ├── helpers.js
│   │       └── mockData.js
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── bot_engine/
│   ├── bot_engine.js               # Puppeteer automation + audio capture
│   ├── package.json
│   ├── .env.example                # Configuration template
│   ├── README.md                   # Bot documentation
│   ├── SETUP_GUIDE.md
│   └── TROUBLESHOOTING.md
│
├── sign_language/
│   ├── inference.py                # ML-based real-time detection
│   ├── train_model.py              # Model training script
│   ├── data_collection.py          # Training data collection
│   ├── meeting_actions.h5          # Trained LSTM model
│   └── MP_Data/                    # Training dataset (6 gestures)
│
├── nlp_Module/
│   └── nlp_pipeline.py             # Summarization, action items, translation
│
├── speech_Module/
│   ├── transcribe_audio.py         # Whisper transcription
│   └── whisper_loader.py           # Model loader
│
├── tts_module/
│   ├── text_to_speech.py           # pyttsx3 TTS
│   └── text_to_speech_local.py
│
├── utils/
│   ├── diarization_utils.py        # Transcript-diarization alignment
│   ├── pdf_generator.py            # PDF report generation
│   ├── email_utils.py              # SMTP email sender
│   └── fonts/                      # PDF fonts
│
├── output/                         # Generated files (transcripts, summaries)
├── app.py                          # Streamlit UI (legacy/alternative)
├── run_pipeline.py                 # Standalone pipeline runner
├── requirements.txt                # Python dependencies
├── start_unified_system.ps1        # All-in-one launcher (Windows)
├── start.ps1                       # Alternative launcher
├── UNIFIED_SYSTEM_GUIDE.md         # Complete setup guide
├── SIGN_LANGUAGE_INTEGRATION.md    # Sign language docs
└── README.md                       # This file
```

### **Data Flow Architecture**

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │  HTTP   │   FastAPI   │ MongoDB │   Database  │
│   (React)   │◄───────►│   Backend   │◄───────►│   (Motor)   │
│  Port 3000  │  +WS    │  Port 8000  │  Async  │  Port 27017 │
└──────┬──────┘         └──────┬──────┘         └─────────────┘
       │                       │
       │ WebSocket             │ WebSocket
       │ /ws/meeting/{id}      │ /ws/bot-audio
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│  Live Feed  │         │  Bot Engine │
│  Updates    │         │  (Node.js)  │
│  Real-time  │         │  Puppeteer  │
└─────────────┘         └─────────────┘
       ▲                       │
       │                       │ Audio Stream
       │                       ▼
       │                ┌─────────────┐
       │                │   Whisper   │
       └────────────────┤   Model     │
         Transcription  │  (Python)   │
                        └─────────────┘
```

---

## **⚙️ Installation & Setup**

### **Prerequisites**
- Python 3.10+
- Node.js 18+
- MongoDB 7.0+
- Git
- CUDA-compatible GPU (optional, for faster processing)

### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/inclusive-meeting-assistant.git
cd inclusive-meeting-assistant
```

### **2. Backend Setup**

#### **Create Virtual Environment**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### **Install Python Dependencies**
```bash
pip install -r requirements.txt
```

#### **Configure Environment Variables**
Create a `.env` file in the project root:
```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=inclusive_meeting_assistant

# JWT Authentication
SECRET_KEY=your-super-secret-jwt-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# HuggingFace (for diarization)
HUGGINGFACE_TOKEN=hf_your_token_here

# Email Configuration (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password
```

#### **Set HuggingFace Token (Required for Diarization)**
```bash
# Windows
setx HUGGINGFACE_TOKEN "hf_xxx..."

# Linux/Mac
export HUGGINGFACE_TOKEN="hf_xxx..."
```

Get your token from: https://huggingface.co/settings/tokens

### **3. Frontend Setup**

```bash
cd frontend
npm install
```

### **4. Bot Engine Setup (Optional)**

```bash
cd bot_engine
npm install

# Configure bot settings
cp .env.example .env
# Edit .env with your meeting preferences
```

### **5. Start MongoDB**

```bash
# Windows (as service)
net start MongoDB

# Or manually
mongod --dbpath C:\data\db

# Linux/Mac
sudo systemctl start mongod
# Or
mongod --dbpath /data/db
```

---

## **🚀 Running the Application**

### **Option 1: Unified Launcher (Recommended)**

```powershell
# Windows
.\start_unified_system.ps1

# This automatically:
# 1. Checks MongoDB connection
# 2. Clears ports 3000 and 8000
# 3. Starts backend on port 8000
# 4. Starts frontend on port 3000
# 5. Opens browser to http://localhost:3000
```

### **Option 2: Manual Launch**

#### **Terminal 1 - Backend**
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Output:
# ✅ Connected to MongoDB
# ✅ Diarization pipeline preloaded
# INFO: Uvicorn running on http://0.0.0.0:8000
```

#### **Terminal 2 - Frontend**
```bash
cd frontend
npm run dev

# Output:
# VITE v5.0.8  ready in 1234 ms
# ➜  Local:   http://localhost:3000/
```

#### **Terminal 3 - Bot Engine (Optional)**
```bash
cd bot_engine
npm start

# Or with specific meeting:
node bot_engine.js --meeting-url "https://meet.google.com/abc-defg-hij"
```

#### **Terminal 4 - Sign Language (Optional)**
```bash
python sign_language/inference.py --meeting-id session_demo_1
```

### **Access Points**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main web application |
| **Backend API** | http://localhost:8000 | REST API endpoints |
| **API Documentation** | http://localhost:8000/docs | Interactive Swagger docs |
| **Alternative Docs** | http://localhost:8000/redoc | ReDoc documentation |
| **WebSocket** | ws://localhost:8000/ws/meeting/{id} | Real-time updates |
| **Bot WebSocket** | ws://localhost:8000/ws/bot-audio | Bot audio streaming |

---

## **📖 Usage Guide**

### **1. User Registration**
1. Navigate to http://localhost:3000
2. Click "Register" or go to `/register`
3. Fill in: Email, Full Name, Password
4. Submit to create account

### **2. Login**
1. Go to `/login`
2. Enter email and password
3. Receive JWT token (stored in localStorage)
4. Redirect to Dashboard

### **3. Start a Live Meeting (Manual Recording)**
1. From Dashboard, click "New Meeting"
2. Enter meeting title and description
3. Click "Start Recording"
4. Upload audio file or use live microphone
5. View real-time transcript in meeting session page

### **4. Automated Bot Meeting**
1. Go to "Live Meeting" page
2. Enter Google Meet URL
3. Click "Start Bot"
4. Bot joins meeting automatically
5. Real-time transcription appears in dashboard
6. All participants see live updates via WebSocket

### **5. Sign Language Detection**

**ML-Based (Server-Side):**
1. Start sign language detector: `python sign_language/inference.py --meeting-id <id>`
2. Show gestures to webcam (hello, yes, no, question, thanks, idle)
3. Detected signs appear in meeting transcript feed automatically

**Browser-Based (Client-Side):**
1. Go to "Sign Language" page (`/sign-language`)
2. Allow camera access
3. Show hand signs (letters A-Y, numbers 1-5)
4. Text accumulates in real-time
5. Copy or download result

### **6. View Meeting Report**
1. Go to Dashboard → Meeting History
2. Click on any completed meeting
3. View:
   - Full transcript
   - Summary
   - Action items
   - Speaker breakdown
   - Participation metrics
4. Download PDF or send via email

### **7. Export Options**
- **PDF Download**: Click "Download PDF" on report page
- **Email Report**: Enter recipient email and click "Send"
- **Copy Transcript**: Click "Copy" button in transcript viewer

---
uvicorn main:app --reload
```

### **6. Run Test Script**
```bash
python test_all_features.py
```

---

## **� Quick Start (All Components)**

### **Option 1: Launch Everything at Once (Recommended)**
```powershell
# Windows
.\start_complete_system.ps1

# This starts: Backend + Frontend + Sign Language Recognition
```

### **Option 2: Manual Launch**
```powershell
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Sign Language (optional)
.\start_sign_language.ps1
```

### **Option 3: Test Integration**
```powershell
# Test sign language integration without camera
python test_sign_language_integration.py
```

**📚 For detailed sign language setup, see [SIGN_LANGUAGE_INTEGRATION.md](SIGN_LANGUAGE_INTEGRATION.md)**  
**📝 Quick reference: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)**

---

## **🗺 Roadmap & Completed Phases**

### **✅ Completed**
- **Phase 1:** Core NLP features (summarization, action items, translation, TTS)
- **Phase 2:** MongoDB + JWT Authentication ([docs](PHASE2_SUMMARY.md))
- **Phase 3:** WebSocket real-time updates ([docs](PHASE3_SUMMARY.md))
- **Phase 4:** Automated Meeting Bot + **Sign Language Integration** ([docs](PHASE4_SUMMARY.md)) 🎉
  - **NEW:** ML-based sign recognition fully integrated with live chat
  - 6 basic gestures: hello, yes, no, question, thanks
  - Real-time WebSocket broadcasting
  - Special UI styling in transcript feed
- **Phase 5:** Browser-based client-side sign language detection ([docs](PHASE5_SUMMARY.md))

### **🔜 Upcoming**
- **Phase 6:** Full frontend integration with authentication
- Enhanced sign language vocabulary
- Mobile device support
- **Phase 6:** Collaborative features (multi-user editing)
- **Phase 7:** Support for Zoom, Microsoft Teams
- Merge diarization output with transcript → **speaker-attributed summaries**
- Topic segmentation → break meetings into themes
- Export options (PDF, Notion, etc.)
- Browser extension (Zoom / Meet integration)
- Real-time dashboard with speaker labels & sign language overlay

## **📚 Documentation**

### Phase 2: Authentication & Database
- [PHASE2_SUMMARY.md](PHASE2_SUMMARY.md) - Complete overview
- [PHASE2_QUICKSTART.md](PHASE2_QUICKSTART.md) - Quick start guide
- [PHASE2_IMPLEMENTATION.md](PHASE2_IMPLEMENTATION.md) - Technical details
- [PHASE2_ARCHITECTURE.md](PHASE2_ARCHITECTURE.md) - Architecture diagram

### Phase 3: WebSocket Real-Time
- [PHASE3_SUMMARY.md](PHASE3_SUMMARY.md) - Complete overview
- [PHASE3_QUICKSTART.md](PHASE3_QUICKSTART.md) - Testing guide
- [PHASE3_COMPARISON.md](PHASE3_COMPARISON.md) - Before/after analysis
- [PHASE3_WEBSOCKET_INTEGRATION.md](PHASE3_WEBSOCKET_INTEGRATION.md) - Technical guide

### Phase 4: Meeting Bot 🤖
- [PHASE4_INDEX.md](PHASE4_INDEX.md) - **START HERE** - Complete documentation index
- [PHASE4_QUICKSTART.md](PHASE4_QUICKSTART.md) - 5-minute setup guide
- [bot_engine/README.md](bot_engine/README.md) - Comprehensive bot guide
- [PHASE4_SUMMARY.md](PHASE4_SUMMARY.md) - Technical architecture & implementation
- [PHASE4_CHECKLIST.md](PHASE4_CHECKLIST.md) - Development & deployment checklist

### Phase 5: Browser-Based Sign Language
- [PHASE5_SUMMARY.md](PHASE5_SUMMARY.md) - Complete overview

### Additional Resources
- [UNIFIED_SYSTEM_GUIDE.md](UNIFIED_SYSTEM_GUIDE.md) - Complete system guide
- [SIGN_LANGUAGE_INTEGRATION.md](SIGN_LANGUAGE_INTEGRATION.md) - Sign language integration guide
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick command reference
- [DATA_FLOW_DIAGRAM.md](DATA_FLOW_DIAGRAM.md) - Architecture diagrams

---

## **🔌 API Endpoints Reference**

### **Authentication Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login and get JWT token | ❌ |
| GET | `/api/auth/me` | Get current user info | ✅ |

### **Meeting Management Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/meetings/join` | Join/create a meeting | ✅ |
| GET | `/api/meetings/{meeting_id}/status` | Get meeting status | ✅ |
| GET | `/api/meetings/history` | Get user's meeting history | ✅ |
| POST | `/api/meetings/{meeting_id}/upload-audio` | Upload audio for processing | ✅ |
| POST | `/api/meetings/{meeting_id}/end` | End meeting and process | ✅ |
| GET | `/api/meetings/{meeting_id}/report` | Get meeting report | ✅ |
| GET | `/api/meetings/{meeting_id}/transcript` | Get live transcript | ✅ |
| GET | `/api/meetings/{meeting_id}/actions` | Get action items | ✅ |
| GET | `/api/meetings/{meeting_id}/pdf` | Download PDF report | ✅ |
| POST | `/api/meetings/{meeting_id}/email` | Email meeting report | ✅ |

### **WebSocket Endpoints**

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `/ws/meeting/{meeting_id}` | Real-time meeting updates | `token` (query param) |
| `/ws/bot-audio` | Bot audio streaming | None |

---

## **🧪 Testing**

### **Test Scripts**
```bash
# Test complete system
python test_all_features.py

# Test sign language integration
python test_sign_language_integration.py

# Test bot audio processing
python test_bot_audio.py

# Test WebSocket connection
python test_websocket_simple.py
```

### **Manual Testing Checklist**
- ✅ User registration and login
- ✅ Create new meeting
- ✅ Upload and process audio
- ✅ WebSocket real-time updates
- ✅ Sign language detection
- ✅ Bot automation
- ✅ Download PDF report
- ✅ Email functionality

---

## **🔧 Configuration Reference**

### **Backend Environment (.env)**
```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=inclusive_meeting_assistant

# Security
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Models
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxx

# Email (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-specific-password
```

### **Bot Engine Configuration (bot_engine/.env)**
```env
MEETING_URL=https://meet.google.com/xxx-yyyy-zzz
WEBSOCKET_URL=ws://localhost:8000/ws/bot-audio
HEADLESS=false
BOT_NAME=Meeting Assistant Bot
```

---

## **🐛 Troubleshooting**

### **MongoDB Connection Error**
```bash
# Test connection
mongosh

# Start MongoDB
net start MongoDB  # Windows
sudo systemctl start mongod  # Linux/Mac
```

### **Port Already in Use**
```powershell
# Find process on port
netstat -ano | findstr :8000

# Kill process
taskkill /PID <PID> /F

# Or use unified launcher (auto-clears ports)
.\start_unified_system.ps1
```

### **HuggingFace Token Error**
```bash
# Set globally
setx HUGGINGFACE_TOKEN "hf_your_token"

# Or in .env file
HUGGINGFACE_TOKEN=hf_your_token

# Get token from: https://huggingface.co/settings/tokens
```

### **WebSocket Connection Failed**
- Verify backend is running on port 8000
- Check JWT token is valid
- Review CORS settings in [main.py](backend/main.py)
- Check browser console for errors

### **Bot Issues**
See [bot_engine/TROUBLESHOOTING.md](bot_engine/TROUBLESHOOTING.md) for detailed bot troubleshooting.

---

## **🤝 Contributing**

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Make** your changes
4. **Test** thoroughly
5. **Commit**: `git commit -m "Add your feature"`
6. **Push**: `git push origin feature/your-feature`
7. **Create** a Pull Request

### **Contribution Areas**
- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation
- 🎨 UI/UX improvements
- 🌍 Translations
- 🧪 Test coverage

---

## **📄 License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## **🙏 Acknowledgments**

**Core Technologies:**
- [OpenAI Whisper](https://github.com/openai/whisper) - Speech recognition
- [Pyannote.audio](https://github.com/pyannote/pyannote-audio) - Speaker diarization
- [HuggingFace Transformers](https://huggingface.co/transformers/) - NLP models
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [React](https://react.dev/) - Frontend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Puppeteer](https://pptr.dev/) - Browser automation
- [MediaPipe](https://mediapipe.dev/) - Hand tracking
- [TensorFlow](https://www.tensorflow.org/) - ML framework

**Inspiration:**
- [Read.ai](https://read.ai) - Meeting intelligence platform
- [Otter.ai](https://otter.ai) - Transcription service
- Accessibility initiatives for inclusive technology

---

## **📊 Project Statistics**

- **Languages:** Python, JavaScript, JSX
- **Frameworks:** FastAPI, React, TensorFlow
- **Database:** MongoDB
- **Total Files:** 150+
- **Lines of Code:** 15,000+
- **AI Models:** 6 (Whisper, Pyannote, BART, T5, MarianMT, LSTM)
- **Features:** 12 major modules
- **API Endpoints:** 15+
- **WebSocket Events:** 6+

---

## **🌟 Star This Project**

If you find this project helpful, please consider giving it a ⭐ on GitHub!

---

**Made with ❤️ for inclusive communication**

*Last Updated: December 2025 | Version 1.0.0*
