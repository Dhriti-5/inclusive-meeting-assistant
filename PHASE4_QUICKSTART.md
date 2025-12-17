# 🚀 Phase 4 Quick Start Guide

## What You Need

1. ✅ Node.js installed (v14+)
2. ✅ Backend running (FastAPI)
3. ✅ A Google account for the bot (NOT your personal account!)
4. ✅ A Google Meet URL to join

## 5-Minute Setup

### Step 1: Install Bot Dependencies
```bash
cd bot_engine
npm install
```

### Step 2: Create Configuration
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

### Step 3: Edit Configuration
Open `bot_engine/.env` and update:

```env
GOOGLE_EMAIL=your-bot-account@gmail.com
GOOGLE_PASSWORD=your-bot-password
MEETING_URL=https://meet.google.com/abc-defg-hij
HEADLESS=false
```

⚠️ **Important**: Use a dedicated test Google account, not your personal account!

### Step 4: Start Backend
```bash
cd backend
python main.py
```

Wait for: `✅ Application started`

### Step 5: Run the Bot
```bash
cd bot_engine
npm start
```

## What to Expect

You'll see:
```
🤖 Initializing Google Meet Bot...
🚀 Launching Chrome...
✅ Browser launched successfully
🔐 Logging into Google Account...
✅ Login successful
📞 Joining Google Meet...
✅ Successfully joined the meeting
🔌 Connecting to backend WebSocket...
✅ WebSocket connected to backend
🎤 Starting audio capture...
✅ Audio capture started
🎙️ Bot is now recording audio from the meeting...
```

Backend will show:
```
🤖 Bot connected for meeting: abc-defg-hij
🎤 Transcribed: Hello everyone, welcome to the meeting...
```

## Stopping the Bot

Press `Ctrl+C` in the bot terminal:
```
👋 Received SIGINT, shutting down...
🛑 Stopping bot...
✅ Bot stopped successfully
```

## Troubleshooting

### Bot Won't Login
**Problem**: Google blocks automated login

**Solution**:
1. Use a dedicated test account
2. In Google Account settings:
   - Security → Less secure app access → Enable
   - Or use an App Password
3. Try `HEADLESS=false` to see what's happening

### Can't Find Join Button
**Problem**: Bot says "Could not find join button"

**Solution**:
1. Make sure the meeting URL is correct
2. Run with `HEADLESS=false` to see the screen
3. The meeting might require approval - join manually first

### WebSocket Connection Failed
**Problem**: "WebSocket connection timeout"

**Solution**:
1. Make sure backend is running: `python backend/main.py`
2. Check backend is on port 8000
3. Verify `BACKEND_WS_URL=ws://localhost:8000/ws/bot-audio`

### No Audio or Transcription
**Problem**: Bot joins but no transcription appears

**Solution**:
1. Check backend console for errors
2. Verify Whisper model is loaded
3. Try increasing `AUDIO_SAMPLE_RATE=44100` in `.env`
4. Check backend logs for "Transcribed:" messages

## Using the Setup Scripts

### Windows
```cmd
setup_bot.bat    # One-time setup
start_bot.bat    # Run bot
```

### Linux/Mac
```bash
chmod +x *.sh
./setup_bot.sh   # One-time setup
./start_bot.sh   # Run bot
```

## Testing Without a Real Meeting

1. Create a test meeting in Google Meet
2. Join from your personal account
3. Start the bot
4. Speak into your microphone
5. Check backend logs for transcriptions

## Configuration Options

### Basic Settings
```env
GOOGLE_EMAIL=bot@gmail.com          # Required
GOOGLE_PASSWORD=password            # Required
MEETING_URL=https://meet.google.com/xxx  # Required
```

### Advanced Settings
```env
HEADLESS=false                      # Show browser (good for debugging)
AUDIO_SAMPLE_RATE=16000            # Audio quality (16000 or 44100)
BACKEND_WS_URL=ws://localhost:8000/ws/bot-audio  # Backend URL
```

## Next Steps

1. ✅ Test with a real meeting
2. ✅ Check frontend for transcriptions
3. ✅ Integrate with your React app
4. ✅ Read full documentation: `bot_engine/README.md`

## Frontend Integration

Your React app will receive messages like:

```javascript
{
  "type": "bot_transcription",
  "text": "Hello everyone, welcome to the meeting...",
  "source": "meeting_bot",
  "timestamp": "2025-12-17T10:30:00.000Z"
}
```

Update your WebSocket handler to display these messages!

## Security Reminder

🔒 **Never commit your `.env` file!**

It's already in `.gitignore`, but double-check:
```bash
git status
# Should NOT show bot_engine/.env
```

## Need Help?

1. 📖 Read: `bot_engine/README.md` (comprehensive guide)
2. 📖 Read: `PHASE4_SUMMARY.md` (technical details)
3. 🐛 Check console logs (both bot and backend)
4. 💡 Try `HEADLESS=false` to see what's happening

## Common Commands

```bash
# Install dependencies
cd bot_engine && npm install

# Start backend
cd backend && python main.py

# Run bot
cd bot_engine && npm start

# Stop bot
Ctrl+C in bot terminal

# Update bot
cd bot_engine && npm install
```

## That's It! 🎉

Your meeting bot should now be:
- ✅ Joining Google Meet automatically
- ✅ Capturing audio in real-time
- ✅ Providing live transcription
- ✅ Streaming to your React frontend

Enjoy your automated meeting assistant! 🤖🎙️

---

**Quick Reference:**

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm start` | Run the bot |
| `Ctrl+C` | Stop the bot |
| `HEADLESS=false` | Debug mode |

**Important Files:**

| File | Purpose |
|------|---------|
| `bot_engine/.env` | Configuration (secrets) |
| `bot_engine/bot_engine.js` | Main bot code |
| `backend/bot_audio_processor.py` | Audio processing |
| `bot_engine/README.md` | Full documentation |
