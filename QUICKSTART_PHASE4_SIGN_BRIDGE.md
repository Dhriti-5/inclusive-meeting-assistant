# 🚀 Quick Start: Sign Language Bridge Testing

## Prerequisites

✅ Python 3.8+ installed  
✅ Node.js 16+ installed  
✅ MongoDB running (for backend)  
✅ Webcam available  
✅ Google Account with meeting access

---

## Step-by-Step Testing Guide

### 1️⃣ Install Dependencies

```bash
# Backend dependencies (if not already installed)
cd backend
pip install -r ../requirements.txt
pip install requests

# Bot engine dependencies
cd ../bot_engine
npm install

# Sign language dependencies already installed from training
cd ../sign_language
# requests should be installed already
pip install requests
```

---

### 2️⃣ Start Backend Server

**Terminal 1:**
```bash
cd backend
python start_server.py
```

**Wait for:**
```
✅ Application started
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

### 3️⃣ Test Backend is Ready

**Terminal 2:**
```bash
# Test health endpoint
curl http://localhost:8000/

# Should return:
# {"message":"Inclusive Meeting Assistant Backend is running."}

# Test sign language queue status
curl http://localhost:8000/api/sign-queue-status

# Should return:
# {"queue_length":0,"pending_messages":[]}
```

---

### 4️⃣ Start Sign Language Inference

**Terminal 3:**
```bash
cd sign_language
python inference.py
```

**Wait for:**
```
✅ Model loaded successfully!
✅ Webcam opened successfully!
🔗 Connected to backend at: http://localhost:8000
🎥 Starting inference... Press 'q' to quit.
```

**You should see:**
- OpenCV window showing your webcam feed
- Hand skeleton tracking (green lines)
- Probability bars on the left showing detected gestures

---

### 5️⃣ Test Sign Detection (Without Bot)

1. **Make a "question" sign** in front of webcam:
   - Raise your hand with index finger pointing up
   - Hold for 1-2 seconds

2. **Check Terminal 3 output:**
   ```
   🚀 SENT TO BOT: question (confidence: 0.87)
      Message: [Sign Language] 🙋 Participant has a question
   ```

3. **Verify backend received it:**
   ```bash
   # In Terminal 2
   curl http://localhost:8000/api/sign-queue-status
   
   # Should show:
   # {"queue_length":1,"pending_messages":["[Sign Language] 🙋 Participant has a question"]}
   ```

✅ **If you see this, the sign language → backend connection works!**

---

### 6️⃣ Start Google Meet Bot

**Terminal 4:**
```bash
cd bot_engine
npm start
```

**Wait for:**
```
🤖 Initializing Google Meet Bot...
🚀 Launching Chrome...
✅ Browser launched successfully
🔐 Logging into Google Account...
✅ Logged in successfully
🎯 Joining meeting...
✅ Joined meeting successfully
🔌 Connecting to backend WebSocket...
✅ WebSocket connected
🎤 Starting audio capture...
✅ Audio capture started
🤟 Starting Sign Language Command Poller...
   Polling interval: 1000ms
🎉 Bot is fully operational!
   - Audio transcription: ✅
   - Sign language bridge: ✅
```

**You should see:**
- Chrome browser window (if not headless)
- Bot joining your Google Meet
- Bot in the participant list

---

### 7️⃣ End-to-End Test

1. **Join the same Google Meet** (from your regular browser)

2. **Position yourself** in front of the webcam running inference

3. **Make a "hello" sign:**
   - Wave your hand
   - Or make a fist and extend thumb (ASL hello)

4. **Watch the magic happen:**

   **Terminal 3 (Inference):**
   ```
   🚀 SENT TO BOT: hello (confidence: 0.92)
      Message: [Sign Language] 👋 Participant says Hello!
   ```

   **Terminal 4 (Bot):**
   ```
   ✍️ Sign Language Command: [Sign Language] 👋 Participant says Hello!
      📂 Opened chat panel
      ✅ Message sent to chat: "[Sign Language] 👋 Participant says Hello!"
   ```

   **Google Meet Chat:**
   ```
   Bot: [Sign Language] 👋 Participant says Hello!
   ```

🎉 **SUCCESS! The full pipeline is working!**

---

## 8️⃣ Test All Gestures

Try each of these signs and verify they appear in chat:

| Gesture | Expected Chat Message |
|---------|----------------------|
| 🙋 Question | [Sign Language] 🙋 Participant has a question |
| 👋 Hello | [Sign Language] 👋 Participant says Hello! |
| ✅ Yes | [Sign Language] ✅ Participant agrees |
| ❌ No | [Sign Language] ❌ Participant disagrees |
| 🙏 Thanks | [Sign Language] 🙏 Participant says Thank You |

---

## 🐛 Troubleshooting

### Issue: Inference can't connect to backend

**Error:** `⚠️ Backend not reachable at http://localhost:8000`

**Fix:**
1. Check backend is running (Terminal 1)
2. Test: `curl http://localhost:8000/`
3. Check firewall settings

---

### Issue: Bot not typing in chat

**Check:**
1. Is bot still in meeting? (check participant list)
2. Is chat enabled in meeting settings?
3. Check bot terminal for errors

**Debug:**
```bash
# Check if commands are queuing
curl http://localhost:8000/api/sign-queue-status

# If queue is stuck, clear it
curl -X POST http://localhost:8000/api/clear-sign-queue
```

---

### Issue: Detection not stable

**Problem:** Flickering between different gestures

**Solutions:**
1. Ensure good lighting
2. Clear background
3. Hold gesture steady for 2-3 seconds
4. Check confidence threshold in inference.py:
   ```python
   threshold = 0.8  # Try 0.9 for stricter detection
   ```

---

### Issue: Too many duplicate messages

**Problem:** Same message sent multiple times

**Fix:** Increase cooldown in inference.py:
```python
SEND_COOLDOWN = 5  # Wait 5 seconds between same word
```

---

## 📊 Performance Check

Good performance indicators:

✅ **Inference FPS:** 25-30 FPS  
✅ **Detection Latency:** < 2 seconds  
✅ **API Response:** < 100ms  
✅ **Bot Polling:** Every 1 second  
✅ **End-to-end:** 1-3 seconds from gesture to chat

---

## 🧪 Advanced Testing

### Test with Multiple Signs in Sequence

1. Make "hello" gesture → Wait for message in chat
2. Make "yes" gesture → Wait for message
3. Make "question" gesture → Wait for message

**Expected:** 3 separate messages in chat

---

### Test Cooldown Behavior

1. Make "hello" gesture
2. Immediately make "hello" again (within 3 seconds)

**Expected:** Only one message sent (cooldown prevents duplicate)

---

### Test Confidence Filtering

1. Make a half-gesture (unclear sign)
2. Check Terminal 3

**Expected:** 
```
ℹ️ Ignored: Low confidence or idle state
```

No message sent to bot.

---

## 📸 Screenshot Checklist

Document your successful test with screenshots of:

1. ✅ All 4 terminals running
2. ✅ OpenCV window showing hand tracking
3. ✅ Google Meet with bot in participant list
4. ✅ Chat messages from bot
5. ✅ Backend terminal showing "Sign Detected" logs

---

## 🎓 What You've Built

Congratulations! You now have:

✅ Real-time sign language detection  
✅ API integration between Python and Node.js  
✅ Automated chat bot for accessibility  
✅ End-to-end pipeline from webcam to chat  
✅ Production-ready error handling  
✅ Scalable architecture with queue system  

---

## 🚀 Next Steps

1. **Train more gestures** - Expand vocabulary
2. **Deploy to cloud** - Make it accessible remotely
3. **Add frontend UI** - Real-time gesture visualization
4. **Improve accuracy** - Collect more training data
5. **Add analytics** - Track gesture usage statistics

---

**Need Help?** Check [PHASE4_SIGN_LANGUAGE_BRIDGE.md](PHASE4_SIGN_LANGUAGE_BRIDGE.md) for detailed documentation.
