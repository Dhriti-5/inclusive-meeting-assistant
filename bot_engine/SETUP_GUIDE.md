# 🤖 Bot Engine Setup (No GCP Required!)

## Quick Setup

The bot engine joins Google Meet meetings using a **regular Gmail account** - no Google Cloud Platform needed!

### 1. Edit `bot_engine/.env`

Open `bot_engine/.env` and update with your Gmail credentials:

```env
# Your REGULAR Gmail account (not GCP!)
GOOGLE_EMAIL=youremail@gmail.com
GOOGLE_PASSWORD=your-app-password

# Backend connection (keep as-is)
BACKEND_WS_URL=ws://localhost:8000/ws/bot-audio
BACKEND_API_URL=http://localhost:8000

# Your Google Meet link
MEETING_URL=https://meet.google.com/abc-defg-hij

# Bot behavior
HEADLESS=false
AUDIO_SAMPLE_RATE=16000
SIGN_POLLING_INTERVAL=1000
```

### 2. Get Gmail App Password (Recommended)

For security, use a Gmail App Password instead of your regular password:

1. Go to https://myaccount.google.com/apppasswords
2. Sign in to your Google account
3. Click "Select app" → Choose "Other (Custom name)"
4. Type "Meeting Bot" and click "Generate"
5. Copy the 16-character password (remove spaces)
6. Use this as your `GOOGLE_PASSWORD` in `.env`

### 3. Install Dependencies (if not already done)

```powershell
cd bot_engine
npm install
cd ..
```

### 4. Run the Bot

**Important:** Make sure backend is running first!

```powershell
# Terminal 1: Start backend first
uvicorn backend.main:app --reload

# Terminal 2: Start bot engine
cd bot_engine
node bot_engine.js
```

The bot will:
1. Open Chrome
2. Login to your Gmail account
3. Join the meeting
4. Capture audio and send to backend

## 🔧 Troubleshooting

### "Google credentials not configured"
- Make sure you edited `bot_engine/.env` with real values
- Don't leave placeholder text like "your-bot-email@gmail.com"

### Bot can't login
- **Use App Password** (see step 2 above)
- Try with `HEADLESS=false` to see the browser
- Some accounts need "Less secure app access" enabled
- Consider creating a dedicated Gmail for the bot

### "Error: Invalid meeting URL"
- Format must be: `https://meet.google.com/xxx-xxxx-xxx`
- You can get this from the Meet "Join info" section

### Browser closes immediately
- Check that backend is running
- Make sure WebSocket URL is correct (`ws://localhost:8000/ws/bot-audio`)

## 💡 Pro Tips

1. **Create a dedicated Gmail** just for the bot (safer than using your main account)
2. **Use headless=false** first time to see what's happening
3. **Keep the browser window visible** when debugging
4. The bot only joins when you run `node bot_engine.js` - it doesn't run automatically

## ✅ Success Indicators

When working correctly, you'll see:
```
🤖 Initializing Google Meet Bot...
🚀 Launching Chrome...
✅ Browser launched successfully
🔐 Logging into Google Account...
   Entering email...
   Entering password...
✅ Login successful
📞 Joining Google Meet...
✅ Joined meeting successfully
🔗 Connected to backend WebSocket
🎤 Started audio capture
```

---

**No cloud costs, no GCP project needed!** This is 100% free using regular Gmail.
