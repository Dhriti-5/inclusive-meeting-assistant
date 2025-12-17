
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
- Detects ASL signs using **MediaPipe + TensorFlow Lite**
- Recognizes key signs and converts them to text in real time
- Integrated with transcript flow for inclusivity

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
│   ├── sign_Module/             # Sign language detection
│   ├── tts_Module/
│   │   ├── text_to_speech.py
│   ├── speaker_diarization.py   # Pyannote diarization pipeline
│   └── output/                  # Transcripts, summaries, etc.
│
├── bot_engine/                  # Meeting Bot (Phase 4)
│   ├── bot_engine.js            # Puppeteer automation + audio capture
│   ├── package.json             # Node.js dependencies
│   ├── .env.example             # Configuration template
│   └── README.md                # Bot setup guide
│
├── frontend/                    # React.js (UI for meetings)
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

## **🗺 Roadmap & Completed Phases**

### **✅ Completed**
- **Phase 1:** Core NLP features (summarization, action items, translation, TTS)
- **Phase 2:** MongoDB + JWT Authentication ([docs](PHASE2_SUMMARY.md))
- **Phase 3:** WebSocket real-time updates ([docs](PHASE3_SUMMARY.md))
- **Phase 4:** Automated Meeting Bot ([docs](PHASE4_SUMMARY.md)) 🎉

### **🔜 Upcoming**
- **Phase 5:** Full frontend integration with authentication
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
