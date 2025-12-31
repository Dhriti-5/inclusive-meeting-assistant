/**
 * Bot Engine Configuration Module
 * Centralized configuration management for the Autonomous Meeting Agent
 */
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Google Account Credentials
  google: {
    email: process.env.GOOGLE_EMAIL || '',
    password: process.env.GOOGLE_PASSWORD || '',
  },

  // Meeting Configuration
  meeting: {
    url: process.env.MEETING_URL || '',
    defaultDisplayName: process.env.BOT_DISPLAY_NAME || 'Synapse AI Bot',
  },

  // Audio Configuration
  audio: {
    sampleRate: parseInt(process.env.AUDIO_SAMPLE_RATE) || 16000,
    channels: 1, // Mono
    bitDepth: 16, // 16-bit PCM
    mimeType: 'audio/webm',
    audioBitsPerSecond: 128000,
    chunkDuration: 20, // ms
  },

  // Backend Communication
  backend: {
    audioWsUrl: process.env.BACKEND_WS_URL || 'ws://localhost:8000/ws/bot-audio',
    meetingWsUrl: process.env.MEETING_WS_URL || 'ws://localhost:8000/ws/meeting',
    apiUrl: process.env.BACKEND_API_URL || 'http://localhost:8000',
    reconnectDelay: parseInt(process.env.WS_RECONNECT_DELAY) || 5000,
    maxReconnectAttempts: parseInt(process.env.WS_MAX_RECONNECT) || 10,
  },

  // Browser Configuration
  browser: {
    headless: process.env.HEADLESS === 'true',
    viewport: {
      width: parseInt(process.env.VIEWPORT_WIDTH) || 1280,
      height: parseInt(process.env.VIEWPORT_HEIGHT) || 720,
    },
    userAgent: process.env.USER_AGENT || 
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  },

  // Monitoring & Health Checks
  monitoring: {
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 10000,
    maxIdleTime: parseInt(process.env.MAX_IDLE_TIME) || 300000, // 5 minutes
    enableMetrics: process.env.ENABLE_METRICS === 'true',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableTimestamps: process.env.LOG_TIMESTAMPS !== 'false',
    enableColors: process.env.LOG_COLORS !== 'false',
  },

  // Error Handling
  errorHandling: {
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY) || 2000,
    gracefulShutdownTimeout: parseInt(process.env.SHUTDOWN_TIMEOUT) || 10000,
  },
};

/**
 * Validate required configuration
 */
export function validateConfig() {
  const errors = [];

  if (!config.google.email) {
    errors.push('GOOGLE_EMAIL is required');
  }

  if (!config.google.password) {
    errors.push('GOOGLE_PASSWORD is required');
  }

  if (!config.meeting.url) {
    errors.push('MEETING_URL is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Extract meeting ID from URL
 */
export function extractMeetingId(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    return pathParts[pathParts.length - 1] || 'unknown';
  } catch (error) {
    console.warn('Failed to extract meeting ID:', error.message);
    return 'unknown';
  }
}

export default config;
