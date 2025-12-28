
# **Inclusive Meeting Assistant** 🎙🤝

An AI-powered assistant that makes meetings more **accessible and inclusive**, inspired by [Read.ai](https://read.ai), with added **sign language support** for differentially abled participants.  
This project integrates **speech recognition, sign language translation, summarization, action item extraction, translation, text-to-speech, email export, and speaker diarization** into a unified pipeline.

---

## **✨ Features Implemented**

### **1. 🎤 Speech to Text (ASR)**
- Converts meeting audio into text using **OpenAI Whisper** or ASR pipeline.
- **Input:** Recorded audio from `speech_Module`  
- **Output:** `output/transcript.txt`

### **2. 🖐 Sign Language Detection**

#### **Phase 4: ML-Based Recognition (INTEGRATED)**
- **Real-time sign language recognition** with **TensorFlow LSTM model**
- Detects **6 basic meeting gestures**: hello, yes, no, question, thanks, idle
- **>80% confidence threshold** for accurate detection
- **Fully integrated with live meeting chat** - signs automatically appear in transcript feed
- **WebSocket broadcasting** - all participants see sign language messages in real-time
- Special UI styling with gradient backgrounds and emojis
- Camera overlay shows detected signs with confidence levels
- See [SIGN_LANGUAGE_INTEGRATION.md](SIGN_LANGUAGE_INTEGRATION.md) for complete guide

#### **Phase 5: Client-Side Browser Detection**
- **Browser-based ASL detection** using **Google MediaPipe**
- Detects hand landmarks and recognizes gestures using geometry-based algorithms
- Supports **10 letters** (A, B, C, D, F, I, L, O, V, Y) and **5 numbers** (1-5)
- **Client-side processing** - no video sent to server
- Live webcam feed with hand landmark visualization
- Text accumulation, copy, download, and history tracking
- **GPU accelerated** with 25-30 FPS performance
- See [PHASE5_SUMMARY.md](PHASE5_SUMMARY.md) for details

### **3. 📝 Meeting Summarization**
- Summarizes long transcripts into concise notes
- Powered by **HuggingFace Transformers** (`distilbart-cnn-12-6`)
- Example: 10-minute transcript → 4–5 sentence summary

### **4. ✅ Action Items Extraction**
- Extracts decisions, todos, and next steps from meeting notes
- Powered by **Google FLAN-T5**
- Returns **bullet-point action items**

### **5. 🌍 Multilingual Translation**
- Translates transcripts or summaries into multiple languages
- Uses **Helsinki-NLP MarianMT models**
- Example: `en → hi`, `en → fr`, etc.

### **6. 🔊 Text to Speech (TTS)**
- Converts meeting summaries or action items into speech audio
- Uses **pyttsx3** for offline TTS
- **Output:** `.wav` audio file for recap

### **7. 📧 Email Export**
- Exports meeting notes & action items to email
- SMTP integration (tested; DNS issues pending fix)
- Sends summaries directly to participants

### **8. 🧑‍🤝‍🧑 Speaker Diarization**
- Identifies **who spoke when** during the meeting
- Implemented with **pyannote.audio** diarization pipeline
- **Output:** Timestamps with speaker labels (`SPEAKER_00`, `SPEAKER_01`, …)
- **Next:** Merge diarization with transcripts → speaker-attributed summaries

### **9. ⚡ Real-Time WebSocket Updates (Phase 3)**
- **Problem:** Eliminated inefficient polling (60 requests/minute)
- **Solution:** WebSocket connections for instant updates
- **Benefits:**
  - 97% reduction in network requests
  - 20x faster updates (<100ms vs 0-2000ms)
  - Real-time processing status (diarization, transcription, alignment)
  - Auto-reconnection with exponential backoff
- **Implementation:**
  - Backend: WebSocket manager + broadcasting during audio processing
  - Frontend: Custom `useWebSocket` React hook
  - Connection status indicator in UI
- **See:** `PHASE3_SUMMARY.md`, `PHASE3_QUICKSTART.md` for details

### **10. 🤖 Automated Meeting Bot (Phase 4) - THE KILLER FEATURE**
- **Problem:** Manual meeting joining and transcription setup
- **Solution:** Automated bot that joins Google Meet and captures audio
- **Features:**
  - ✅ Automated Google Meet joining (Puppeteer)
  - ✅ Real-time audio capture (puppeteer-stream)
  - ✅ Live transcription streaming (Whisper + WebSocket)
  - ✅ Browser automation with intelligent join detection
  - ✅ Headless/visible mode for debugging
- **Architecture:**
  - Bot Engine (Node.js) → Audio Capture → WebSocket → Backend (Python)
  - Backend processes audio with Whisper → Broadcasts to Frontend
  - Seamless integration with Phase 3 WebSocket infrastructure
- **Usage:**
  ```bash
  cd bot_engine
  npm install
  npm start
  ```
- **See:** `PHASE4_QUICKSTART.md`, `bot_engine/README.md` for complete guide

---

## **🏗 Project Structure**

```
inclusive-meeting-assistant/
├── backend/
│   ├── main.py                  # FastAPI entrypoint + WebSocket endpoints
│   ├── bot_audio_processor.py   # Bot audio processing & Whisper integration
│   ├── websocket_manager.py     # WebSocket connection management
│   ├── pipeline_runner.py       # Orchestrates NLP pipeline
│   ├── nlp_module/
│   │   ├── nlp_pipeline.py      # Summarization, Action items, Translation
│   │   ├── translate_text.py
│   ├── speech_Module/           # Whisper / ASR integration
│   ├── tts_Module/
│   │   ├── text_to_speech.py
│   ├── speaker_diarization.py   # Pyannote diarization pipeline
│   └── output/                  # Transcripts, summaries, etc.
│
├── sign_language/               # Sign Language Recognition (Phase 4)
│   ├── inference.py             # Real-time sign detection with ML model
│   ├── meeting_actions.h5       # Trained LSTM model
│   ├── train_model.py           # Model training script
│   └── MP_Data/                 # Training data for 6 gestures
│
├── bot_engine/                  # Meeting Bot (Phase 4)
│   ├── bot_engine.js            # Puppeteer automation + audio capture
│   ├── package.json             # Node.js dependencies
│   ├── .env.example             # Configuration template
│   └── README.md                # Bot setup guide
│
├── frontend/                    # React.js (UI for meetings)
│   ├── src/
│   │   ├── hooks/
│   │   │   └── useWebSocket.jsx # WebSocket client with sign language support
│   │   ├── pages/
│   │   │   └── LiveMeeting.jsx  # Live meeting with integrated sign language
│   │   └── components/live-session/
│   │       ├── TranscriptFeed.jsx    # Shows sign language messages
│   │       └── SignLanguageCam.jsx   # Camera feed with overlay
│
├── start_sign_language.ps1      # Sign language launcher (Windows)
├── start_sign_language.sh       # Sign language launcher (Linux/Mac)
├── start_complete_system.ps1    # Launch everything at once
├── test_sign_language_integration.py  # Integration test
├── SIGN_LANGUAGE_INTEGRATION.md # Complete sign language guide
├── QUICK_REFERENCE.md           # Quick start guide
├── DATA_FLOW_DIAGRAM.md         # Architecture diagrams
├── test_all_features.py         # Test script to verify all features
├── test_bot_audio.py            # Bot audio processing tests
├── setup_bot.bat / .sh          # Bot setup scripts
├── start_bot.bat / .sh          # Bot start scripts
└── README.md
```

---

## **⚙️ Installation & Setup**

### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/inclusive-meeting-assistant.git
cd inclusive-meeting-assistant
```

### **2. Create Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate    # Linux/Mac
venv\Scripts\activate       # Windows
```

### **3. Install Dependencies**
```bash
pip install -r requirements.txt
```

**Required Libraries:**
- `transformers`
- `torch`
- `pyttsx3`
- `speechbrain`
- `pyannote.audio`
- `openai-whisper`
- `fastapi`, `uvicorn`
- `mediapipe`, `opencv-python`
- `tensorflow` / `tflite-runtime`

### **4. Set HuggingFace Token**
```bash
setx HUGGINGFACE_TOKEN "hf_xxx..."
```

### **5. Run Backend**
```bash
cd backend
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
