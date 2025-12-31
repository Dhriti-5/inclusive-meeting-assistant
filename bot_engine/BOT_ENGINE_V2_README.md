# 🤖 Synapse AI - Bot Engine v2.0

## Feature 1: Autonomous Meeting Agent ("The Ear")

A production-ready, scalable Node.js bot that autonomously joins Google Meet, captures audio, and streams it to the backend for AI processing.

## 🏗️ Architecture

**Microservices-lite Architecture - Service A**

```
┌─────────────────────────────────────────────────────────┐
│                    Bot Engine (Node.js)                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Meeting    │  │    Audio     │  │   WebSocket  │  │
│  │  Navigator   │  │   Handler    │  │   Manager    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                         │                                │
│                  ┌──────────────┐                        │
│                  │   Meeting    │                        │
│                  │   Monitor    │                        │
│                  └──────────────┘                        │
│                                                           │
└─────────────────────────────────────────────────────────┘
                          │
                WebSocket (Audio + Events)
                          │
                          ▼
         ┌────────────────────────────────┐
         │   Backend (FastAPI - Python)   │
         └────────────────────────────────┘
```

## ✨ Key Features

### 1. **Anti-Detection Measures**
- Uses `puppeteer-extra-plugin-stealth` to bypass bot detection
- Mimics human behavior patterns
- Custom user agent rotation
- Realistic timing and interactions

### 2. **Robust Meeting Navigation**
- Multi-strategy selector approach (CSS + XPath)
- Automatic Google account authentication
- Handles "Ask to join" flows
- Automatic mic/camera disabling

### 3. **High-Quality Audio Streaming**
- 16kHz, 16-bit PCM, Mono (Whisper-optimized)
- Real-time streaming via WebSocket
- No local storage - direct streaming
- Minimal latency

### 4. **Automatic Reconnection**
- WebSocket auto-reconnect with exponential backoff
- Graceful degradation on connection loss
- Message queuing during disconnection
- Connection health monitoring

### 5. **Health Monitoring**
- Periodic meeting status checks
- Audio stream health verification
- WebSocket connection monitoring
- Automatic recovery mechanisms

### 6. **Graceful Shutdown**
- Proper cleanup of all resources
- Meeting exit notification
- Final statistics reporting
- Signal handling (SIGINT, SIGTERM)

## 📦 Installation

```bash
cd bot_engine
npm install
```

## ⚙️ Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your credentials:
```env
GOOGLE_EMAIL=your-email@gmail.com
GOOGLE_PASSWORD=your-app-password
MEETING_URL=https://meet.google.com/xxx-yyyy-zzz
BACKEND_WS_URL=ws://localhost:8000/ws/bot-audio
HEADLESS=false  # Set to true for production
```

### Important: Google Authentication

For automated login to work:
1. **Use an App Password** (recommended):
   - Go to Google Account → Security → 2-Step Verification
   - Generate an App Password for "Mail"
   - Use this instead of your regular password

2. **Or enable "Less secure app access"** (not recommended):
   - Not recommended for security reasons

3. **Or use manual login**:
   - Set `HEADLESS=false`
   - Bot will pause and wait for manual login

## 🚀 Usage

### Development Mode (Non-Headless)
```bash
npm run dev
```

### Production Mode (Headless)
```bash
# Set HEADLESS=true in .env first
npm start
```

### Quick Test
```bash
# Test with a public meeting
MEETING_URL=https://meet.google.com/abc-defg-hij npm start
```

## 📊 Monitoring

The bot provides real-time status updates:

```
==================================================
 STATUS UPDATE
==================================================
⏱️  Uptime: 15.3 minutes
🎤 Audio: 45.2 MB streamed
📊 Health checks: 92 (0 warnings)
🔌 WebSocket: Connected
```

## 🔧 Module Structure

```
bot_engine/
├── index.js                    # Main entry point
├── src/
│   ├── config.js              # Configuration management
│   ├── audioStreamHandler.js  # Audio capture & streaming
│   ├── meetingNavigator.js    # Google Meet navigation
│   ├── websocketManager.js    # Backend communication
│   ├── meetingMonitor.js      # Health monitoring
│   └── utils/
│       └── logger.js          # Logging utility
├── package.json
├── .env.example
└── README.md
```

## 🔌 WebSocket Communication

### Audio WebSocket (`/ws/bot-audio`)
- **Binary messages**: Raw audio chunks (WebM format)
- **JSON messages**: Control & status updates

```javascript
// Initial connection
{
  "type": "bot_connected",
  "meeting_id": "abc-defg-hij",
  "timestamp": "2025-12-31T10:00:00.000Z",
  "sampleRate": 16000,
  "channels": 1,
  "bitDepth": 16
}

// Health report (every 10 checks)
{
  "type": "bot_health_report",
  "status": {
    "inMeeting": true,
    "audioStreaming": true,
    "websocketConnected": true
  },
  "metrics": {
    "healthChecks": 100,
    "warnings": 0,
    "errors": 0
  }
}

// Disconnection
{
  "type": "bot_disconnected",
  "timestamp": "2025-12-31T11:00:00.000Z"
}
```

### Meeting WebSocket (`/ws/meeting/{meeting_id}`)
- Receives meeting events (transcripts, gestures)
- Sends bot actions and status

## 🛡️ Error Handling

### Automatic Recovery
- **WebSocket disconnection**: Auto-reconnect with backoff
- **Audio stream failure**: Triggers graceful shutdown
- **Meeting exit detected**: Notifies backend and shuts down
- **Browser crash**: Caught and logged

### Manual Intervention
If automation fails, the bot will:
1. Log clear instructions to console
2. Pause and wait for manual action
3. Continue once action is completed

## 🧪 Testing

### Unit Test (Manual)
1. Set `HEADLESS=false`
2. Start the bot
3. Verify each stage:
   - ✅ Browser launches
   - ✅ Google login succeeds
   - ✅ Meeting is joined
   - ✅ Audio capture starts
   - ✅ WebSocket connects
   - ✅ Health checks pass

### Integration Test
1. Start backend: `cd backend && uvicorn main:app`
2. Start bot: `cd bot_engine && npm start`
3. Check backend logs for audio data

## 📈 Performance

- **Latency**: ~200-500ms (network dependent)
- **Memory**: ~150-300MB (Chrome overhead)
- **CPU**: ~5-15% (idle), ~30-50% (during capture)
- **Network**: ~128kbps audio + ~10kbps control

## 🔒 Security Considerations

1. **Credentials**: Store in `.env`, never commit
2. **App Passwords**: Use instead of main password
3. **Network**: Use HTTPS/WSS in production
4. **Access Control**: Implement token-based auth
5. **Rate Limiting**: Prevent abuse on backend

## 🐛 Troubleshooting

### Bot can't login
- Use App Password instead of regular password
- Enable "Less secure app access"
- Try manual login (set `HEADLESS=false`)

### Can't find join button
- Google Meet UI changes frequently
- Bot will fallback to manual intervention
- Check console for instructions

### Audio not streaming
- Verify WebSocket connection to backend
- Check backend logs for errors
- Ensure backend is accepting audio WebSocket connections

### High CPU usage
- Normal for Puppeteer
- Consider increasing `HEALTH_CHECK_INTERVAL`
- Use headless mode in production

## 📝 Changelog

### Version 2.0.0 (Current)
- ✨ Complete modular architecture
- ✨ Anti-detection with stealth plugin
- ✨ Automatic reconnection logic
- ✨ Health monitoring system
- ✨ Graceful shutdown handling
- ✨ Comprehensive logging
- ✨ Production-ready error handling

### Version 1.0.0
- Initial implementation
- Basic meeting joining
- Simple audio streaming

## 🚀 Next Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Test locally**
   ```bash
   npm run dev
   ```

4. **Deploy to production**
   - Set `HEADLESS=true`
   - Use process manager (PM2, systemd)
   - Monitor with logging service

## 🤝 Integration with Backend

The backend should implement:
1. WebSocket endpoint `/ws/bot-audio` for audio streaming
2. WebSocket endpoint `/ws/meeting/{meeting_id}` for events
3. Audio buffer handling (see `backend/bot_audio_processor.py`)

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ by the Synapse AI Team**
