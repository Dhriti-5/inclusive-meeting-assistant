
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

---

## **🏗 Project Structure**

```
inclusive-meeting-assistant/
├── backend/
│   ├── main.py                  # FastAPI entrypoint
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
├── frontend/                    # React.js (UI for meetings)
├── test_all_features.py         # Test script to verify all features
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

## **🗺 Roadmap (Next Features)**

- Merge diarization output with transcript → **speaker-attributed summaries**
- Topic segmentation → break meetings into themes
- Export options (PDF, Notion, etc.)
- Browser extension (Zoom / Meet integration)
- Real-time dashboard with speaker labels & sign language overlay
