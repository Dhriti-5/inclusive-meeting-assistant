# 🎯 Synapse AI - Bot Engine API Documentation

## Architecture Overview

The Bot Engine follows a **modular, event-driven architecture** designed for scalability and maintainability.

```
┌──────────────────────────────────────────────────────────────┐
│                      SynapseBot (Main)                        │
│  - Orchestrates all components                               │
│  - Manages lifecycle                                         │
│  - Handles graceful shutdown                                 │
└──────────────────────────────────────────────────────────────┘
                              │
      ┌───────────────────────┼───────────────────────┐
      ▼                       ▼                       ▼
┌──────────┐          ┌──────────────┐        ┌──────────────┐
│ Meeting  │◄────────►│   WebSocket  │◄──────►│    Audio     │
│Navigator │          │   Manager    │        │   Handler    │
└──────────┘          └──────────────┘        └──────────────┘
      ▲                       ▲                       ▲
      │                       │                       │
      └───────────────────────┴───────────────────────┘
                              │
                      ┌───────────────┐
                      │    Meeting    │
                      │    Monitor    │
                      └───────────────┘
```

## Core Components

### 1. SynapseBot (Main Orchestrator)

**File**: `index.js`

The main class that orchestrates all bot components.

#### Methods

##### `constructor()`
Initializes the bot with default state.

##### `async initialize()`
Sets up browser, page, and all components.

**Returns**: `Promise<void>`

**Throws**: Error if validation or initialization fails

##### `async run()`
Executes the complete bot lifecycle:
1. Authenticate
2. Join meeting
3. Connect WebSocket
4. Start audio capture
5. Start monitoring

**Returns**: `Promise<void>`

##### `async shutdown(reason: string)`
Gracefully shuts down all components.

**Parameters**:
- `reason` - Reason for shutdown (e.g., 'user_interrupt', 'error')

**Returns**: `Promise<void>`

---

### 2. Config Module

**File**: `src/config.js`

Centralized configuration management.

#### Exported Objects

##### `config`
Main configuration object with all settings.

```javascript
{
  google: { email, password },
  meeting: { url, defaultDisplayName },
  audio: { sampleRate, channels, bitDepth, ... },
  backend: { audioWsUrl, meetingWsUrl, apiUrl, ... },
  browser: { headless, viewport, userAgent, args },
  monitoring: { healthCheckInterval, maxIdleTime, ... },
  logging: { level, enableTimestamps, enableColors },
  errorHandling: { retryAttempts, retryDelay, ... }
}
```

#### Functions

##### `validateConfig()`
Validates required configuration fields.

**Throws**: Error with list of missing fields

##### `extractMeetingId(url: string): string`
Extracts meeting ID from Google Meet URL.

**Parameters**:
- `url` - Full Google Meet URL

**Returns**: Meeting ID string

**Example**:
```javascript
extractMeetingId('https://meet.google.com/abc-defg-hij')
// Returns: 'abc-defg-hij'
```

---

### 3. WebSocketManager

**File**: `src/websocketManager.js`

Manages dual WebSocket connections (audio + meeting events) with automatic reconnection.

#### Constructor

```javascript
new WebSocketManager(meetingUrl: string)
```

#### Methods

##### `async connect()`
Establishes both audio and meeting WebSocket connections.

**Returns**: `Promise<boolean>`

##### `sendAudio(audioData: Buffer)`
Sends raw audio data to backend.

**Parameters**:
- `audioData` - Binary audio chunk

##### `sendAudioMessage(message: Object)`
Sends JSON message to audio WebSocket.

**Parameters**:
- `message` - JSON object

##### `sendMeetingMessage(message: Object)`
Sends JSON message to meeting WebSocket.

**Parameters**:
- `message` - JSON object

##### `isConnected(): boolean`
Checks if both WebSockets are connected.

**Returns**: `true` if both connected

##### `on(event: string, handler: Function)`
Registers event handler.

**Events**:
- `message` - Incoming message (audio or meeting)
- `error` - Connection error
- `close` - Connection closed
- `reconnect` - Reconnection successful

**Example**:
```javascript
wsManager.on('message', ({ type, data }) => {
  if (type === 'meeting') {
    console.log('Meeting event:', data);
  }
});
```

##### `async disconnect()`
Closes all WebSocket connections gracefully.

**Returns**: `Promise<void>`

---

### 4. AudioStreamHandler

**File**: `src/audioStreamHandler.js`

Captures and streams audio from Google Meet.

#### Constructor

```javascript
new AudioStreamHandler(websocketManager: WebSocketManager)
```

#### Methods

##### `async startCapture(page: Page)`
Starts capturing audio from Puppeteer page.

**Parameters**:
- `page` - Puppeteer page object

**Returns**: `Promise<boolean>`

##### `getStatus(): Object`
Returns current streaming status.

**Returns**:
```javascript
{
  isStreaming: boolean,
  bytesStreamed: number,
  chunksProcessed: number,
  duration: number,  // milliseconds
  lastChunkTime: number
}
```

##### `isHealthy(): boolean`
Checks if audio stream is healthy (received data recently).

**Returns**: `true` if healthy

##### `async stop()`
Stops audio capture and logs final statistics.

**Returns**: `Promise<void>`

---

### 5. MeetingNavigator

**File**: `src/meetingNavigator.js`

Handles Google Meet authentication and navigation.

#### Constructor

```javascript
new MeetingNavigator(page: Page)
```

#### Methods

##### `async authenticate()`
Logs into Google Account.

**Returns**: `Promise<boolean>`

**Throws**: Error if authentication fails

##### `async joinMeeting(meetingUrl: string)`
Navigates to meeting and joins.

**Parameters**:
- `meetingUrl` - Full Google Meet URL

**Returns**: `Promise<boolean>`

**Throws**: Error if join fails

##### `async isStillInMeeting(): boolean`
Checks if still in the meeting.

**Returns**: `true` if still in meeting

##### `async leaveMeeting()`
Leaves the meeting gracefully.

**Returns**: `Promise<boolean>`

---

### 6. MeetingMonitor

**File**: `src/meetingMonitor.js`

Monitors meeting health and detects issues.

#### Constructor

```javascript
new MeetingMonitor(
  navigator: MeetingNavigator,
  audioHandler: AudioStreamHandler,
  wsManager: WebSocketManager
)
```

#### Methods

##### `start()`
Starts periodic health monitoring.

##### `getMetrics(): Object`
Returns monitoring metrics.

**Returns**:
```javascript
{
  healthChecks: number,
  warnings: number,
  errors: number,
  reconnections: number,
  isMonitoring: boolean,
  lastHealthCheck: number,
  uptime: number
}
```

##### `onShutdownCallback(callback: Function)`
Registers callback for critical failures.

**Parameters**:
- `callback(reason: string)` - Called when shutdown is needed

##### `stop()`
Stops monitoring and logs final metrics.

---

### 7. Logger

**File**: `src/utils/logger.js`

Colored logging utility with timestamps.

#### Methods

##### `logger.debug(...args)`
Logs debug messages (cyan).

##### `logger.info(...args)`
Logs info messages (blue).

##### `logger.success(...args)`
Logs success messages (green).

##### `logger.warn(...args)`
Logs warnings (yellow).

##### `logger.error(...args)`
Logs errors (red).

##### `logger.section(title: string)`
Logs a section header.

##### `logger.divider()`
Logs a divider line.

**Example**:
```javascript
logger.section('INITIALIZATION');
logger.info('Starting bot...');
logger.success('Bot started successfully');
logger.divider();
```

---

## WebSocket Protocol

### Audio WebSocket (`/ws/bot-audio`)

#### Client → Server Messages

**1. Connection**
```json
{
  "type": "bot_connected",
  "meeting_id": "abc-defg-hij",
  "timestamp": "2025-12-31T10:00:00.000Z",
  "sampleRate": 16000,
  "channels": 1,
  "bitDepth": 16
}
```

**2. Health Report**
```json
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
  },
  "timestamp": "2025-12-31T10:05:00.000Z"
}
```

**3. Critical Alert**
```json
{
  "type": "bot_health_critical",
  "status": {
    "inMeeting": false,
    "audioStreaming": false,
    "websocketConnected": true
  },
  "metrics": { ... },
  "timestamp": "2025-12-31T10:30:00.000Z"
}
```

**4. Shutdown**
```json
{
  "type": "bot_shutdown",
  "reason": "left_meeting",
  "metrics": { ... },
  "timestamp": "2025-12-31T11:00:00.000Z"
}
```

**5. Disconnection**
```json
{
  "type": "bot_disconnected",
  "timestamp": "2025-12-31T11:00:00.000Z"
}
```

**6. Audio Data**
- Binary WebM audio chunks sent continuously
- Format: 16kHz, 16-bit PCM, Mono
- Chunk size: ~20ms frames

#### Server → Client Messages

Currently, the bot primarily sends data. The backend can send control messages:

```json
{
  "type": "control",
  "action": "pause" | "resume" | "stop",
  "timestamp": "2025-12-31T10:00:00.000Z"
}
```

---

### Meeting WebSocket (`/ws/meeting/{meeting_id}`)

#### Client → Server Messages

**1. Connection**
```json
{
  "type": "bot_action",
  "action": "connected",
  "status": "Bot joined meeting and ready to assist",
  "timestamp": "2025-12-31T10:00:00.000Z"
}
```

**2. Disconnection**
```json
{
  "type": "bot_action",
  "action": "disconnected",
  "status": "Bot leaving meeting",
  "timestamp": "2025-12-31T11:00:00.000Z"
}
```

#### Server → Client Messages

**1. Gesture Detection**
```json
{
  "type": "gesture_update",
  "word": "QUESTION",
  "confidence": 0.95,
  "timestamp": "2025-12-31T10:15:00.000Z"
}
```

**2. Transcript Update**
```json
{
  "type": "transcript_update",
  "speaker": "User 1",
  "text": "Hello everyone",
  "timestamp": "2025-12-31T10:16:00.000Z"
}
```

---

## Error Handling

### Error Recovery Strategies

| Error Type | Detection | Recovery |
|------------|-----------|----------|
| WebSocket Disconnect | Connection closed event | Auto-reconnect with exponential backoff |
| Audio Stream Failure | No chunks for 5 seconds | Trigger shutdown |
| Meeting Exit | DOM element detection | Graceful shutdown |
| Authentication Failure | Timeout or error | Fallback to manual login |
| Browser Crash | Process exit | Log and terminate |

### Custom Error Classes

```javascript
class BotError extends Error {
  constructor(message, type, recoverable = false) {
    super(message);
    this.type = type;
    this.recoverable = recoverable;
    this.timestamp = new Date().toISOString();
  }
}
```

---

## Configuration Best Practices

### Development
```env
HEADLESS=false          # See what's happening
LOG_LEVEL=debug         # Verbose logging
HEALTH_CHECK_INTERVAL=5000   # Frequent checks
```

### Production
```env
HEADLESS=true           # No UI needed
LOG_LEVEL=info          # Less verbose
HEALTH_CHECK_INTERVAL=30000  # Less frequent
ENABLE_METRICS=true     # Track performance
```

### Testing
```env
HEADLESS=false
LOG_LEVEL=debug
RETRY_ATTEMPTS=1        # Fail fast
WS_RECONNECT_DELAY=1000 # Quick reconnects
```

---

## Performance Optimization

### Memory Usage
- **Target**: < 300MB
- **Browser args**: `--disable-dev-shm-usage`, `--disable-gpu`
- **Audio buffering**: Minimal (direct streaming)

### CPU Usage
- **Target**: < 15% idle, < 50% active
- **Optimization**: Adjust `HEALTH_CHECK_INTERVAL`
- **Puppeteer**: Use headless mode in production

### Network Usage
- **Audio**: ~128kbps (constant)
- **Control**: ~1kbps (periodic)
- **Total**: ~130kbps

---

## Security Recommendations

1. **Environment Variables**
   - Never commit `.env` file
   - Use `.env.example` template
   - Rotate credentials regularly

2. **Google Account**
   - Use dedicated bot account
   - Enable 2FA + App Password
   - Limit permissions

3. **Network Security**
   - Use WSS (WebSocket Secure) in production
   - Implement token-based authentication
   - Rate limit connections

4. **Code Security**
   - Keep dependencies updated
   - Scan for vulnerabilities: `npm audit`
   - Use environment-specific configs

---

## Deployment

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start bot
pm2 start index.js --name synapse-bot

# Monitor
pm2 monit

# Logs
pm2 logs synapse-bot

# Restart
pm2 restart synapse-bot

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Using Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Install Chromium
RUN apk add --no-cache chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY . .

CMD ["node", "index.js"]
```

### Using systemd

```ini
[Unit]
Description=Synapse Bot Engine
After=network.target

[Service]
Type=simple
User=botuser
WorkingDirectory=/opt/synapse-bot
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

---

## Monitoring & Observability

### Metrics to Track

1. **Uptime**: How long bot has been running
2. **Audio Volume**: MB streamed
3. **Health Checks**: Pass/fail ratio
4. **Reconnections**: Frequency and success rate
5. **Memory Usage**: Track for leaks
6. **CPU Usage**: Detect performance issues

### Integration with Monitoring Tools

**Example: Prometheus**

```javascript
// Add to bot
const prom = require('prom-client');
const audioBytes = new prom.Counter({
  name: 'bot_audio_bytes_total',
  help: 'Total audio bytes streamed'
});

// In audioHandler
audioBytes.inc(chunk.length);
```

---

## Testing Guide

### Unit Tests (Manual Verification)

1. **Config Validation**
   ```bash
   # Missing credentials
   GOOGLE_EMAIL= npm start
   # Should fail with validation error
   ```

2. **Component Initialization**
   - Set breakpoints in `initialize()`
   - Verify each component is created

3. **Error Handling**
   - Disconnect internet during run
   - Verify reconnection logic

### Integration Tests

1. **Backend Communication**
   ```bash
   # Terminal 1: Backend
   cd backend && uvicorn main:app

   # Terminal 2: Bot
   cd bot_engine && npm start

   # Verify WebSocket handshake in backend logs
   ```

2. **End-to-End**
   - Join a test meeting
   - Let bot run for 5 minutes
   - Verify audio in backend
   - End meeting
   - Verify graceful shutdown

---

## Troubleshooting

### Common Issues

**Q: Bot crashes on startup**
```
A: Check Node.js version (need >= 18)
   Verify Chromium is installed
   Check .env configuration
```

**Q: Can't connect to backend**
```
A: Verify backend is running
   Check BACKEND_WS_URL
   Test with: wscat -c ws://localhost:8000/ws/bot-audio
```

**Q: No audio being captured**
```
A: Check browser console for media errors
   Verify puppeteer-stream installation
   Test with headless=false to see errors
```

**Q: High memory usage**
```
A: Normal for Chromium (~150-300MB)
   Check for memory leaks in monitor
   Restart bot periodically if needed
```

---

## Contributing

### Code Style

- Use ES6+ features
- Async/await over callbacks
- Descriptive variable names
- Comment complex logic
- JSDoc for public methods

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Test thoroughly
4. Update documentation
5. Submit PR with description

---

## License

MIT License - See LICENSE file

---

**For support or questions, contact the Synapse AI Team**
