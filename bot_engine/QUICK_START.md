# 🚀 Quick Start Guide - Synapse AI Bot Engine

## Prerequisites

- Node.js >= 18.0.0
- Google Account with App Password
- Backend running (Python FastAPI)

## Installation (5 minutes)

### Step 1: Install Dependencies
```bash
cd bot_engine
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
GOOGLE_EMAIL=your-email@gmail.com
GOOGLE_PASSWORD=your-app-password
MEETING_URL=https://meet.google.com/xxx-yyyy-zzz
BACKEND_WS_URL=ws://localhost:8000/ws/bot-audio
HEADLESS=false
```

### Step 3: Get Google App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate password for "Mail"
5. Copy to `.env` as `GOOGLE_PASSWORD`

### Step 4: Start Backend

```bash
cd ../backend
uvicorn main:app --reload
```

### Step 5: Start Bot

```bash
cd ../bot_engine
npm start
```

## Expected Output

```
==================================================
 SYNAPSE AI - BOT ENGINE INITIALIZATION
==================================================
[10:00:00.000] INFO: 🔍 Validating configuration...
[10:00:00.100] SUCCESS: ✅ Configuration valid
[10:00:00.200] INFO: 📋 Meeting ID: abc-defg-hij
[10:00:01.000] INFO: 🚀 Launching Chrome with stealth mode...
[10:00:03.000] SUCCESS: ✅ Browser initialized with anti-detection measures
[10:00:03.100] SUCCESS: ✅ All components initialized

--------------------------------------------------
[10:00:04.000] INFO: 🔐 Starting Google authentication...
[10:00:05.000] INFO:    📧 Entering email address...
[10:00:08.000] INFO:    🔑 Entering password...
[10:00:12.000] SUCCESS: ✅ Authentication successful

--------------------------------------------------
[10:00:12.500] INFO: 📞 Navigating to Google Meet...
[10:00:15.000] INFO:    🎥 Disabling camera and microphone...
[10:00:16.000] INFO:    🚪 Looking for join button...
[10:00:17.000] SUCCESS:    ✅ Clicked join button
[10:00:22.000] SUCCESS: ✅ Successfully joined the meeting

--------------------------------------------------
[10:00:22.500] INFO: 🔌 Connecting to backend WebSockets...
[10:00:23.000] SUCCESS:    ✅ Audio WebSocket connected
[10:00:23.100] SUCCESS:    ✅ Meeting WebSocket connected
[10:00:23.200] SUCCESS: ✅ All WebSocket connections established

--------------------------------------------------
[10:00:23.500] INFO: 🎤 Initializing audio capture...
[10:00:24.000] SUCCESS: ✅ Audio capture initialized
[10:00:24.100] INFO:    Sample Rate: 16000Hz
[10:00:24.200] INFO:    Channels: 1 (Mono)
[10:00:24.300] INFO:    Bit Depth: 16-bit PCM

--------------------------------------------------
[10:00:24.500] INFO: 🔍 Starting meeting monitor...
[10:00:24.600] SUCCESS: ✅ Meeting monitor started

==================================================
 BOT ENGINE FULLY OPERATIONAL
==================================================
[10:00:25.000] SUCCESS: 🎉 All systems online!
[10:00:25.100] INFO:    ✅ Authentication
[10:00:25.200] INFO:    ✅ Meeting joined
[10:00:25.300] INFO:    ✅ Backend connected
[10:00:25.400] INFO:    ✅ Audio streaming
[10:00:25.500] INFO:    ✅ Health monitoring
--------------------------------------------------
[10:00:25.600] INFO: 📡 Bot is now autonomously capturing and streaming audio
[10:00:25.700] INFO: 🛑 Press Ctrl+C to stop
```

## Verification Checklist

- [ ] Browser window opens (if `HEADLESS=false`)
- [ ] Bot logs into Google
- [ ] Bot joins the meeting
- [ ] Console shows "Bot is now autonomously capturing and streaming audio"
- [ ] Backend logs show audio data being received
- [ ] No error messages in console

## Common First-Time Issues

### Issue: "Authentication failed"
**Solution**: 
- Use App Password, not regular password
- Check email is correct
- Enable 2FA first

### Issue: "WebSocket connection timeout"
**Solution**:
- Verify backend is running: `http://localhost:8000/docs`
- Check firewall settings
- Test WebSocket: `wscat -c ws://localhost:8000/ws/bot-audio`

### Issue: "Could not find join button"
**Solution**:
- Normal - Google Meet UI changes often
- Bot will prompt for manual click
- Click "Join now" manually when prompted

### Issue: "No audio being captured"
**Solution**:
- Check browser console (if visible)
- Verify puppeteer-stream is installed: `npm list puppeteer-stream`
- Test with different meeting

## Quick Commands

```bash
# Development (visible browser)
HEADLESS=false npm start

# Production (headless)
HEADLESS=true npm start

# Debug mode (verbose logs)
LOG_LEVEL=debug npm start

# View logs
tail -f bot.log

# Stop bot
Ctrl+C

# Check if running
ps aux | grep node
```

## Next Steps

1. **Test for 5 minutes** - Let it run and verify audio streaming
2. **Read documentation** - `BOT_ENGINE_V2_README.md`
3. **Deploy to production** - Use PM2 or Docker
4. **Monitor performance** - Check CPU/memory usage

## Need Help?

1. Check `BOT_ENGINE_V2_README.md` - User guide
2. Check `API_DOCUMENTATION.md` - Developer docs
3. Set `HEADLESS=false` - Visual debugging
4. Set `LOG_LEVEL=debug` - Verbose logs

## Production Checklist

Before deploying to production:

- [ ] Set `HEADLESS=true`
- [ ] Use dedicated Google account
- [ ] Configure backend URL (not localhost)
- [ ] Set up process manager (PM2)
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Test reconnection logic
- [ ] Test graceful shutdown

## Success!

If you see "Bot is now autonomously capturing and streaming audio", you're done! 🎉

The bot will now:
- ✅ Capture audio from the meeting
- ✅ Stream to backend for AI processing
- ✅ Monitor its own health
- ✅ Auto-recover from issues
- ✅ Shutdown gracefully when meeting ends

---

**Total setup time: ~5 minutes**

**Happy bot-ing! 🤖**
