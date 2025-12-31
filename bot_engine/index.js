/**
 * Synapse AI - Autonomous Meeting Agent (Bot Engine)
 * 
 * Feature 1: The "Ear" - Autonomous Meeting Bot
 * Joins Google Meet, captures audio, streams to backend for AI processing
 * 
 * Architecture: Microservices-lite - Service A (Bot Engine)
 * Technology: Node.js + Puppeteer + puppeteer-stream
 * Communication: WebSocket (audio + meeting events)
 * 
 * @version 2.0.0
 * @author Synapse AI Team
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { config, validateConfig, extractMeetingId } from './src/config.js';
import { WebSocketManager } from './src/websocketManager.js';
import { AudioStreamHandler } from './src/audioStreamHandler.js';
import { MeetingNavigator } from './src/meetingNavigator.js';
import { MeetingMonitor } from './src/meetingMonitor.js';
import { logger } from './src/utils/logger.js';

// Add stealth plugin to avoid bot detection
puppeteer.use(StealthPlugin());

/**
 * Main Bot Engine Class
 * Orchestrates all bot components
 */
class SynapseBot {
  constructor() {
    this.browser = null;
    this.page = null;
    
    // Core components
    this.wsManager = null;
    this.audioHandler = null;
    this.navigator = null;
    this.monitor = null;
    
    // State
    this.isRunning = false;
    this.isShuttingDown = false;
    this.startTime = null;
    this.meetingId = null;
    
    // Error handling
    this.shutdownCallbacks = [];
  }

  /**
   * Initialize the bot
   */
  async initialize() {
    try {
      logger.section('SYNAPSE AI - BOT ENGINE INITIALIZATION');
      
      // Validate configuration
      logger.info('🔍 Validating configuration...');
      validateConfig();
      logger.success('✅ Configuration valid');
      
      // Extract meeting info
      this.meetingId = extractMeetingId(config.meeting.url);
      logger.info(`📋 Meeting ID: ${this.meetingId}`);
      
      // Launch browser with stealth mode
      logger.info('🚀 Launching Chrome with stealth mode...');
      this.browser = await puppeteer.launch({
        headless: config.browser.headless,
        args: config.browser.args,
        defaultViewport: config.browser.viewport,
      });
      
      this.page = await this.browser.newPage();
      
      // Set user agent
      await this.page.setUserAgent(config.browser.userAgent);
      
      // Override permissions
      const context = this.browser.defaultBrowserContext();
      await context.overridePermissions(config.meeting.url, [
        'microphone',
        'camera',
        'notifications',
      ]);
      
      logger.success('✅ Browser initialized with anti-detection measures');
      
      // Initialize components
      this.wsManager = new WebSocketManager(config.meeting.url);
      this.audioHandler = new AudioStreamHandler(this.wsManager);
      this.navigator = new MeetingNavigator(this.page);
      this.monitor = new MeetingMonitor(this.navigator, this.audioHandler, this.wsManager);
      
      // Register shutdown handler
      this.monitor.onShutdownCallback((reason) => this._handleShutdown(reason));
      
      logger.success('✅ All components initialized');
      
    } catch (error) {
      logger.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Run the bot through its lifecycle
   */
  async run() {
    try {
      this.startTime = Date.now();
      this.isRunning = true;
      
      logger.section('STARTING BOT ENGINE');
      
      // Step 0: Check backend availability
      logger.divider();
      await this._checkBackendAvailability();
      
      // Step 1: Authenticate
      logger.divider();
      await this.navigator.authenticate();
      
      // Step 2: Join meeting
      logger.divider();
      await this.navigator.joinMeeting(config.meeting.url);
      
      // Step 3: Connect to backend
      logger.divider();
      await this.wsManager.connect();
      
      // Step 4: Start audio capture
      logger.divider();
      await this.audioHandler.startCapture(this.page);
      
      // Step 5: Start monitoring
      logger.divider();
      this.monitor.start();
      
      // Success!
      logger.section('BOT ENGINE FULLY OPERATIONAL');
      logger.success('🎉 All systems online!');
      logger.info('   ✅ Authentication');
      logger.info('   ✅ Meeting joined');
      logger.info('   ✅ Backend connected');
      logger.info('   ✅ Audio streaming');
      logger.info('   ✅ Health monitoring');
      logger.divider();
      logger.info('📡 Bot is now autonomously capturing and streaming audio');
      logger.info('🛑 Press Ctrl+C to stop');
      
      // Keep process alive
      this._setupSignalHandlers();
      
      // Periodic status updates
      setInterval(() => this._logStatus(), 60000); // Every minute
      
    } catch (error) {
      logger.error('❌ Bot execution failed:', error);
      await this.shutdown('error');
      process.exit(1);
    }
  }

  /**
   * Setup signal handlers for graceful shutdown
   */
  _setupSignalHandlers() {
    process.on('SIGINT', async () => {
      logger.info('\n👋 Received SIGINT - initiating graceful shutdown...');
      await this.shutdown('user_interrupt');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('\n👋 Received SIGTERM - initiating graceful shutdown...');
      await this.shutdown('termination');
      process.exit(0);
    });

    process.on('uncaughtException', async (error) => {
      logger.error('🚨 Uncaught exception:', error);
      await this.shutdown('uncaught_exception');
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      logger.error('🚨 Unhandled rejection:', reason);
      await this.shutdown('unhandled_rejection');
      process.exit(1);
    });
  }

  /**
   * Handle shutdown initiated by monitor
   */
  async _handleShutdown(reason) {
    logger.error(`🚨 Monitor initiated shutdown: ${reason}`);
    await this.shutdown(reason);
    process.exit(1);
  }

  /**
   * Log current status
   */
  _logStatus() {
    if (!this.isRunning) return;

    const uptime = ((Date.now() - this.startTime) / 1000 / 60).toFixed(1);
    const audioStatus = this.audioHandler.getStatus();
    const monitorMetrics = this.monitor.getMetrics();

    logger.section('STATUS UPDATE');
    logger.info(`⏱️  Uptime: ${uptime} minutes`);
    logger.info(`🎤 Audio: ${(audioStatus.bytesStreamed / (1024 * 1024)).toFixed(2)} MB streamed`);
    logger.info(`📊 Health checks: ${monitorMetrics.healthChecks} (${monitorMetrics.warnings} warnings)`);
    logger.info(`🔌 WebSocket: ${this.wsManager.isConnected() ? 'Connected' : 'Disconnected'}`);
  }

  /**
   * Check if backend is available
   */
  async _checkBackendAvailability() {
    try {
      logger.info('🔍 Checking backend availability...');
      
      const http = await import('http');
      const url = new URL(config.backend.apiUrl);
      
      // Force IPv4 by using 127.0.0.1 instead of localhost
      const hostname = url.hostname === 'localhost' ? '127.0.0.1' : url.hostname;
      const port = url.port || 8000;
      
      return new Promise((resolve, reject) => {
        const req = http.get(`http://${hostname}:${port}/`, (res) => {
          if (res.statusCode === 200 || res.statusCode === 404) {
            logger.success('✅ Backend is reachable');
            resolve(true);
          } else {
            reject(new Error(`Backend returned status ${res.statusCode}`));
          }
        });
        
        req.on('error', (error) => {
          logger.error('❌ Backend is not running!');
          logger.error('');
          logger.error('Please start the backend first:');
          logger.error('  cd ../backend');
          logger.error('  uvicorn main:app --reload');
          logger.error('');
          logger.info(`💡 Tip: If backend IS running, check that it's on port ${port}`);
          logger.info(`    Visit: http://127.0.0.1:${port}/docs to verify`);
          logger.error('');
          reject(new Error('Backend not available: ' + error.message));
        });
        
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error('Backend connection timeout'));
        });
      });
    } catch (error) {
      throw new Error('Backend check failed: ' + error.message);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(reason = 'unknown') {
    if (this.isShuttingDown) {
      logger.warn('⚠️  Shutdown already in progress');
      return;
    }

    this.isShuttingDown = true;
    this.isRunning = false;

    logger.section('SHUTTING DOWN BOT ENGINE');
    logger.info(`📋 Reason: ${reason}`);

    try {
      // Stop monitoring
      if (this.monitor) {
        this.monitor.stop();
      }

      // Stop audio capture
      if (this.audioHandler) {
        await this.audioHandler.stop();
      }

      // Leave meeting
      if (this.navigator) {
        await this.navigator.leaveMeeting();
      }

      // Disconnect WebSockets
      if (this.wsManager) {
        await this.wsManager.disconnect();
      }

      // Close browser
      if (this.browser) {
        await this.browser.close();
        logger.success('✅ Browser closed');
      }

      // Calculate final stats
      const uptime = ((Date.now() - this.startTime) / 1000 / 60).toFixed(1);
      logger.section('FINAL STATISTICS');
      logger.info(`⏱️  Total uptime: ${uptime} minutes`);
      
      const audioStatus = this.audioHandler.getStatus();
      logger.info(`🎤 Total audio streamed: ${(audioStatus.bytesStreamed / (1024 * 1024)).toFixed(2)} MB`);
      
      const monitorMetrics = this.monitor.getMetrics();
      logger.info(`📊 Health checks performed: ${monitorMetrics.healthChecks}`);
      logger.info(`⚠️  Warnings: ${monitorMetrics.warnings}`);
      logger.info(`❌ Errors: ${monitorMetrics.errors}`);

      logger.success('✅ Shutdown complete');

    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
    }
  }
}

/**
 * Main entry point
 */
async function main() {
  const bot = new SynapseBot();
  
  try {
    await bot.initialize();
    await bot.run();
  } catch (error) {
    logger.error('🚨 Fatal error:', error);
    await bot.shutdown('fatal_error');
    process.exit(1);
  }
}

// Run the bot
main();

export default SynapseBot;
