# Phase 4: Meeting Bot - Setup Guide

## Overview
Phase 4 implements the "killer feature" - an automated bot that joins Google Meet meetings, captures audio, and provides real-time transcription.

## Architecture

```
Google Meet → Bot (Puppeteer) → Audio Capture (puppeteer-stream) 
→ WebSocket → FastAPI Backend → Whisper → React Frontend
```

## Features
- ✅ Automated Google Meet joining
- ✅ Real-time audio capture from meetings
- ✅ Streaming transcription with Whisper
- ✅ WebSocket-based communication
- ✅ Integration with existing Phase 3 WebSocket infrastructure

## Setup Instructions

### 1. Install Bot Dependencies

Navigate to the bot_engine directory and install Node.js packages:

```bash
cd bot_engine
npm install
```

This will install:
- **puppeteer**: Browser automation
- **puppeteer-stream**: Audio/video capture from browser
- **ws**: WebSocket client
- **dotenv**: Environment variable management

### 2. Configure Bot Credentials

Create a `.env` file in the `bot_engine` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Google Account Credentials for the Bot
GOOGLE_EMAIL=your-bot-email@gmail.com
GOOGLE_PASSWORD=your-bot-password

# Backend WebSocket URL
BACKEND_WS_URL=ws://localhost:8000/ws/bot-audio

# Meeting Configuration
MEETING_URL=https://meet.google.com/xxx-xxxx-xxx

# Bot Settings
HEADLESS=false
AUDIO_SAMPLE_RATE=16000
```

**Important Security Notes:**
- Create a dedicated Google account for the bot (don't use your personal account)
- Enable "Less secure app access" for the bot account (required for automated login)
- Never commit your `.env` file to version control

### 3. Backend Setup

The backend has been updated with bot audio processing. No additional configuration needed, but ensure:

```bash
# Make sure backend dependencies are installed
pip install -r requirements.txt

# Start the backend
cd backend
python main.py
```

The backend now includes:
- `/ws/bot-audio`: WebSocket endpoint for bot audio streaming
- `bot_audio_processor.py`: Audio processing and Whisper integration
- Automatic broadcasting to connected clients

## Usage

### Running the Bot

1. **Start the Backend** (if not already running):
```bash
cd backend
python main.py
```

2. **Configure Meeting URL** in `bot_engine/.env`:
```env
MEETING_URL=https://meet.google.com/abc-defg-hij
```

3. **Run the Bot**:
```bash
cd bot_engine
npm start
```

### Bot Workflow

The bot will:
1. 🚀 Launch Chrome browser
2. 🔐 Login to Google account
3. 📞 Navigate to the meeting URL
4. 🎥 Turn off camera (microphone stays on for audio capture)
5. ✅ Click "Join now"
6. 🎤 Start capturing audio
7. 📡 Stream audio to backend via WebSocket
8. 🔄 Backend processes with Whisper and broadcasts transcriptions

### Monitoring

The bot provides real-time console output:
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

### Stopping the Bot

Press `Ctrl+C` to gracefully shut down the bot:
```
👋 Received SIGINT, shutting down...
🛑 Stopping bot...
✅ Bot stopped successfully
```

## Frontend Integration

The frontend automatically receives bot transcriptions through the existing WebSocket connection:

```javascript
// Frontend receives messages like:
{
  "type": "bot_transcription",
  "text": "Hello everyone, welcome to the meeting...",
  "source": "meeting_bot",
  "timestamp": "2025-12-17T10:30:00.000Z"
}
```

Update your React components to handle `bot_transcription` messages.

## Troubleshooting

### Bot Can't Login
- **Issue**: Google blocks automated login
- **Solution**: 
  - Use a dedicated test account
  - Enable "Less secure app access" in Google account settings
  - Try with `HEADLESS=false` to see what's happening
  - May need to manually verify the account first

### Audio Not Capturing
- **Issue**: No audio stream from puppeteer-stream
- **Solution**:
  - Check browser flags in `bot_engine.js`
  - Ensure `--use-fake-ui-for-media-stream` is enabled
  - Try running in non-headless mode first
  - Check if microphone permissions are granted

### WebSocket Connection Failed
- **Issue**: Can't connect to backend
- **Solution**:
  - Verify backend is running on `localhost:8000`
  - Check `BACKEND_WS_URL` in `.env`
  - Review backend logs for errors
  - Test WebSocket endpoint with a client tool

### Join Button Not Found
- **Issue**: Bot can't find the join button
- **Solution**:
  - Google Meet UI may have changed
  - Update selectors in `joinMeeting()` method
  - Run with `HEADLESS=false` to see the UI
  - Check console for selector errors

### Transcription Quality Issues
- **Issue**: Poor or no transcription
- **Solution**:
  - Increase `AUDIO_SAMPLE_RATE` (try 44100)
  - Adjust `chunk_duration_seconds` in `bot_audio_processor.py`
  - Check Whisper model performance
  - Ensure audio chunks are properly formatted

## Configuration Options

### Bot Settings (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_EMAIL` | Bot's Google account email | Required |
| `GOOGLE_PASSWORD` | Bot's Google account password | Required |
| `MEETING_URL` | Google Meet URL to join | Required |
| `BACKEND_WS_URL` | Backend WebSocket endpoint | `ws://localhost:8000/ws/bot-audio` |
| `HEADLESS` | Run browser in headless mode | `false` |
| `AUDIO_SAMPLE_RATE` | Audio sample rate in Hz | `16000` |

### Backend Settings (bot_audio_processor.py)

```python
self.chunk_duration_seconds = 3  # Process every N seconds
self.sample_rate = 16000         # Audio sample rate
self.channels = 1                # Mono audio
```

## Advanced Usage

### Multiple Meetings

To run multiple bots for different meetings:

1. Create separate configuration files:
```bash
cp .env .env.meeting1
cp .env .env.meeting2
```

2. Run bots with different configs:
```bash
node bot_engine.js --env-file .env.meeting1
node bot_engine.js --env-file .env.meeting2
```

### Custom Audio Processing

Modify `bot_audio_processor.py` to customize:
- Chunk size and overlap
- Whisper model parameters
- Language detection
- Post-processing filters

### Integration with Meeting Management

Connect the bot to the existing meeting management system:

```python
# In main.py, add bot control endpoints
@app.post("/api/meetings/{meeting_id}/start-bot")
async def start_bot(meeting_id: str):
    # Launch bot for specific meeting
    pass

@app.post("/api/meetings/{meeting_id}/stop-bot")
async def stop_bot(meeting_id: str):
    # Stop bot for specific meeting
    pass
```

## Security Considerations

1. **Credentials**: Never commit `.env` files
2. **Bot Account**: Use dedicated test accounts only
3. **Access Control**: Validate meeting permissions
4. **Data Privacy**: Handle audio data according to privacy policies
5. **Rate Limiting**: Implement rate limiting for bot operations

## Performance Optimization

1. **Audio Buffering**: Adjust chunk sizes for lower latency
2. **Whisper Model**: Use faster models for real-time performance
3. **WebSocket**: Implement backpressure handling
4. **Resource Management**: Monitor CPU/memory usage

## Next Steps

1. Add bot control API endpoints
2. Implement bot status monitoring
3. Add recording and playback features
4. Integrate with calendar for automatic joining
5. Add support for other meeting platforms (Zoom, Teams)

## Files Added in Phase 4

```
bot_engine/
├── package.json              # Node.js dependencies
├── bot_engine.js             # Main bot script
├── .env.example              # Example configuration
├── .gitignore                # Git ignore rules
└── README.md                 # This file

backend/
├── bot_audio_processor.py    # Audio processing module
└── main.py                   # Updated with bot WebSocket endpoint
```

## API Reference

### WebSocket Endpoints

#### `/ws/bot-audio`
Bot connects here to stream audio

**Messages from Bot:**
```json
// Initial connection
{
  "type": "bot_connected",
  "meeting_id": "abc-defg-hij",
  "timestamp": "2025-12-17T10:30:00.000Z",
  "sampleRate": 16000
}

// Disconnect
{
  "type": "bot_disconnected",
  "timestamp": "2025-12-17T11:30:00.000Z"
}

// Audio chunks (binary data)
<Buffer ...>
```

**Messages to Bot:**
```json
{
  "type": "acknowledged",
  "meeting_id": "abc-defg-hij",
  "status": "ready"
}
```

#### `/ws/meeting/{meeting_id}`
Clients receive transcriptions here

**Messages to Client:**
```json
{
  "type": "bot_transcription",
  "text": "Transcribed text here...",
  "source": "meeting_bot",
  "timestamp": "2025-12-17T10:30:15.000Z"
}
```

## Support

For issues and questions:
1. Check console logs (both bot and backend)
2. Review this documentation
3. Check existing issues in the repository
4. Create a new issue with logs and configuration

---

**Phase 4 Implementation Complete! 🎉**

The meeting bot is now fully functional and ready to automatically join Google Meet meetings and provide real-time transcription.
