# 🤟 Sign Language Integration Guide

## Overview

Your Inclusive Meeting Assistant now has **fully integrated sign language recognition** that automatically types recognized signs into the live meeting chat/transcript feed in real-time!

## ✨ What's Been Connected

### Components Integrated:
1. **Sign Language Recognition (inference.py)** - Detects 6 basic signs with >80% accuracy
2. **Backend API** - Receives and broadcasts sign detections via WebSocket
3. **Frontend Live Meeting** - Displays sign language messages in the transcript feed
4. **Real-time Updates** - All participants see sign language messages instantly

### Supported Signs:
- 👋 **hello** - Greeting
- ✅ **yes** - Agreement
- ❌ **no** - Disagreement  
- 🙋 **question** - Participant has a question
- 🙏 **thanks** - Thank you
- 💤 **idle** - No sign detected (filtered out)

## 🚀 Quick Start

### Step 1: Start the Backend
```powershell
cd backend
python main.py
```
Backend will run on `http://localhost:8000`

### Step 2: Start the Frontend
```powershell
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Step 3: Start Sign Language Recognition
```powershell
# Use default meeting ID (live-session-001)
.\start_sign_language.ps1

# Or specify a custom meeting ID
.\start_sign_language.ps1 -MeetingId "meeting-123"

# With custom backend URL
.\start_sign_language.ps1 -MeetingId "meeting-123" -BackendUrl "http://localhost:8000"
```

**Linux/Mac:**
```bash
# Use default meeting ID
./start_sign_language.sh

# Or specify custom meeting ID
./start_sign_language.sh meeting-123 http://localhost:8000
```

### Step 4: Join the Live Meeting
1. Open browser to `http://localhost:5173`
2. Navigate to Live Meeting page
3. The meeting ID should match what you used in Step 3 (default: `live-session-001`)

## 📋 How It Works

```
┌─────────────────────┐
│  Camera Feed        │
│  (Webcam)           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Sign Language      │
│  Recognition        │
│  (inference.py)     │
│  - MediaPipe        │
│  - TensorFlow       │
│  - >80% confidence  │
└──────────┬──────────┘
           │
           │ HTTP POST /api/sign-detected
           ▼
┌─────────────────────┐
│  Backend API        │
│  (FastAPI)          │
│  - Validates sign   │
│  - Maps to message  │
└──────────┬──────────┘
           │
           │ WebSocket Broadcast
           ▼
┌─────────────────────┐
│  All Connected      │
│  Clients            │
│  (Live Meeting UI)  │
│  - Transcript feed  │
│  - Special styling  │
└─────────────────────┘
```

## 🎨 UI Features

### Sign Language Messages Appear:
1. **In the Transcript Feed** - Left panel with special gradient background
2. **With Special Styling** - Primary color gradient with emoji and border
3. **Real-time** - Instant broadcast to all participants
4. **In Camera Overlay** - Shows detected sign with confidence for 3 seconds

### Visual Indicators:
- 🤟 Hand emoji icon
- Gradient background (primary colors)
- Border highlighting
- Speaker labeled as "Sign Language"
- Timestamp included

## 🔧 Configuration

### Meeting ID
The meeting ID connects the sign language recognition to a specific meeting:

```python
# In inference.py (or via command line)
MEETING_ID = "live-session-001"  # Must match frontend meeting ID
```

```powershell
# Via launcher script
.\start_sign_language.ps1 -MeetingId "your-meeting-id"
```

### Backend URL
If your backend runs on a different port/host:

```powershell
.\start_sign_language.ps1 -BackendUrl "http://192.168.1.100:8000"
```

### Confidence Threshold
Edit [inference.py](sign_language/inference.py):
```python
threshold = 0.8  # Change to 0.7 for more detections (but less accurate)
```

### Cooldown Period
Prevents spamming the same sign:
```python
SEND_COOLDOWN = 3  # seconds between same sign detections
```

## 🐛 Troubleshooting

### Sign language not appearing in chat:
1. **Check meeting ID matches**: Frontend and inference.py must use the same meeting ID
2. **Verify WebSocket connection**: Look for green "Live (WebSocket)" indicator
3. **Check backend console**: Should show `🤟 Sign Detected: <word>`
4. **Check browser console**: Should show `🤟 Sign detected: <word>`

### Camera not working:
1. Grant camera permissions in browser
2. Check if another application is using the camera
3. Restart inference.py

### Low detection accuracy:
1. Ensure good lighting
2. Position hands clearly in frame
3. Refer to [sign reference images](sign_language/MP_Data/)
4. Lower confidence threshold (not recommended below 0.7)

### Backend not receiving signs:
1. Check backend is running on correct port
2. Verify URL in inference.py: `http://localhost:8000`
3. Check firewall settings

## 📊 Message Format

### What the Backend Receives:
```json
{
  "word": "hello",
  "confidence": 0.95,
  "meeting_id": "live-session-001"
}
```

### What Gets Broadcasted via WebSocket:
```json
{
  "type": "sign_detected",
  "word": "hello",
  "message": "👋 Participant says Hello!",
  "confidence": 0.95,
  "timestamp": "2025-12-27T10:30:00.000Z"
}
```

### What Appears in Transcript:
```javascript
{
  speaker: "Sign Language",
  text: "👋 Participant says Hello!",
  timestamp: "2025-12-27T10:30:00.000Z",
  isSignLanguage: true  // For special styling
}
```

## 🎯 Testing the Integration

### Test Flow:
1. Start backend: `python backend/main.py`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser to live meeting page
4. Start sign language: `.\start_sign_language.ps1`
5. Make a "hello" sign in front of the camera
6. **Expected Result**: Message appears in transcript feed with special styling

### Quick Test Commands:
```powershell
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend  
cd frontend
npm run dev

# Terminal 3 - Sign Language
.\start_sign_language.ps1

# Terminal 4 - Check WebSocket (optional)
# Open browser DevTools > Console
# Should see WebSocket connection messages
```

## 🔐 Security Notes

- Meeting IDs should be unique and not easily guessable in production
- Consider adding authentication to the sign-detected endpoint
- Rate limiting recommended for production use
- Use HTTPS/WSS in production

## 🚀 Future Enhancements

### Potential Improvements:
- [ ] Add more sign vocabulary (currently 6 signs)
- [ ] User-specific sign language profiles
- [ ] Sign language translation to multiple languages
- [ ] Save sign language transcript separately
- [ ] Video recording with sign overlay
- [ ] Two-way communication (text-to-sign)
- [ ] Mobile device support
- [ ] Multiple participant sign language detection

## 📝 API Reference

### POST /api/sign-detected
Receives sign language detections from inference script.

**Request:**
```json
{
  "word": "question",
  "confidence": 0.87,
  "meeting_id": "meeting-123"
}
```

**Response (success):**
```json
{
  "status": "success",
  "message": "🙋 Participant has a question",
  "broadcasted": true
}
```

**Response (ignored):**
```json
{
  "status": "ignored",
  "reason": "Low confidence or idle state"
}
```

## 📚 File Structure

```
inclusive-meeting-assistant/
├── sign_language/
│   ├── inference.py              # Main recognition script
│   ├── meeting_actions.h5        # Trained model
│   └── MP_Data/                  # Training data
├── backend/
│   ├── main.py                   # API endpoint /api/sign-detected
│   └── websocket_manager.py      # WebSocket broadcasting
├── frontend/src/
│   ├── hooks/
│   │   └── useWebSocket.jsx      # WebSocket client with sign_detected handler
│   ├── pages/
│   │   └── LiveMeeting.jsx       # Integrates sign language with transcript
│   └── components/live-session/
│       ├── TranscriptFeed.jsx    # Shows sign language messages
│       └── SignLanguageCam.jsx   # Camera feed with overlay
├── start_sign_language.ps1       # Windows launcher
└── start_sign_language.sh        # Linux/Mac launcher
```

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Camera opens showing "Sign Language Bridge" window
- ✅ Backend console shows: `🤟 Sign Detected: <word>`
- ✅ Backend console shows: `✅ Sign language message broadcasted`
- ✅ Browser shows green "Live (WebSocket)" indicator
- ✅ Browser console shows: `🤟 Sign detected: <word>`
- ✅ Transcript feed shows sign message with special gradient styling
- ✅ Camera overlay briefly shows detected sign with confidence

## 💡 Tips

1. **Position hands clearly** in camera view for best detection
2. **Good lighting** improves recognition accuracy
3. **Hold signs for 1-2 seconds** to ensure detection
4. **Match meeting IDs** between inference.py and frontend
5. **Check all terminals** for error messages if not working

## 🆘 Support

If you encounter issues:
1. Check all components are running (backend, frontend, inference)
2. Verify meeting IDs match across all components
3. Check browser and terminal console logs
4. Ensure camera permissions are granted
5. Test WebSocket connection in browser DevTools

---

**You're all set! Your sign language recognition is now fully integrated with the live meeting system.** 🎉

Make a sign and watch it appear in the chat! 🤟
