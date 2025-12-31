/**
 * Meeting Monitor Module
 * Monitors meeting health, detects disconnections, and handles recovery
 */
import { config } from './config.js';
import { logger } from './utils/logger.js';

export class MeetingMonitor {
  constructor(navigator, audioHandler, wsManager) {
    this.navigator = navigator;
    this.audioHandler = audioHandler;
    this.wsManager = wsManager;
    
    this.isMonitoring = false;
    this.healthCheckInterval = null;
    this.lastHealthCheck = null;
    
    this.metrics = {
      healthChecks: 0,
      warnings: 0,
      errors: 0,
      reconnections: 0,
    };
    
    this.alertThreshold = 3; // Number of failed checks before alert
    this.failedChecks = 0;
  }

  /**
   * Start monitoring the meeting
   */
  start() {
    if (this.isMonitoring) {
      logger.warn('⚠️  Monitor already running');
      return;
    }

    logger.info('🔍 Starting meeting monitor...');
    this.isMonitoring = true;
    
    // Start periodic health checks
    this.healthCheckInterval = setInterval(
      () => this._performHealthCheck(),
      config.monitoring.healthCheckInterval
    );
    
    logger.success('✅ Meeting monitor started');
    logger.info(`   Check interval: ${config.monitoring.healthCheckInterval}ms`);
  }

  /**
   * Perform comprehensive health check
   */
  async _performHealthCheck() {
    if (!this.isMonitoring) return;

    this.metrics.healthChecks++;
    this.lastHealthCheck = Date.now();

    try {
      const status = {
        inMeeting: await this._checkMeetingStatus(),
        audioStreaming: this._checkAudioStatus(),
        websocketConnected: this._checkWebSocketStatus(),
        timestamp: new Date().toISOString(),
      };

      // Evaluate overall health
      const isHealthy = status.inMeeting && status.audioStreaming && status.websocketConnected;

      if (isHealthy) {
        this.failedChecks = 0;
        logger.debug('💚 Health check passed');
      } else {
        this.failedChecks++;
        this.metrics.warnings++;
        
        logger.warn(`⚠️  Health check failed (${this.failedChecks}/${this.alertThreshold})`);
        logger.warn(`   Status: ${JSON.stringify(status, null, 2)}`);

        // Take action if threshold exceeded
        if (this.failedChecks >= this.alertThreshold) {
          await this._handleUnhealthyState(status);
        }
      }

      // Report status to backend
      this._reportStatus(status);

    } catch (error) {
      this.metrics.errors++;
      logger.error('❌ Error during health check:', error);
    }
  }

  /**
   * Check if still in meeting
   */
  async _checkMeetingStatus() {
    try {
      const isInMeeting = await this.navigator.isStillInMeeting();
      
      if (!isInMeeting) {
        logger.error('❌ Not in meeting anymore!');
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error checking meeting status:', error);
      return false;
    }
  }

  /**
   * Check audio streaming status
   */
  _checkAudioStatus() {
    const isHealthy = this.audioHandler.isHealthy();
    
    if (!isHealthy) {
      logger.warn('⚠️  Audio stream is not healthy');
      
      const status = this.audioHandler.getStatus();
      logger.warn(`   Audio status: ${JSON.stringify(status, null, 2)}`);
    }
    
    return isHealthy;
  }

  /**
   * Check WebSocket connection status
   */
  _checkWebSocketStatus() {
    const isConnected = this.wsManager.isConnected();
    
    if (!isConnected) {
      logger.warn('⚠️  WebSocket not fully connected');
    }
    
    return isConnected;
  }

  /**
   * Handle unhealthy state
   */
  async _handleUnhealthyState(status) {
    logger.error('🚨 Critical: Meeting is unhealthy!');
    logger.error(`   Status: ${JSON.stringify(status, null, 2)}`);

    // Notify backend
    this.wsManager.sendAudioMessage({
      type: 'bot_health_critical',
      status,
      metrics: this.metrics,
      timestamp: new Date().toISOString(),
    });

    // Determine action based on status
    if (!status.inMeeting) {
      logger.error('🚨 Left the meeting - initiating shutdown');
      await this._initiateShutdown('left_meeting');
    } else if (!status.websocketConnected) {
      logger.warn('🔄 WebSocket disconnected - attempting reconnection');
      this.metrics.reconnections++;
      // WebSocketManager handles reconnection automatically
    } else if (!status.audioStreaming) {
      logger.error('🚨 Audio stream failed - initiating shutdown');
      await this._initiateShutdown('audio_failure');
    }
  }

  /**
   * Report status to backend
   */
  _reportStatus(status) {
    if (this.metrics.healthChecks % 10 === 0) { // Report every 10 checks
      this.wsManager.sendAudioMessage({
        type: 'bot_health_report',
        status,
        metrics: this.metrics,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Initiate graceful shutdown
   */
  async _initiateShutdown(reason) {
    logger.error(`🛑 Initiating shutdown: ${reason}`);
    
    this.isMonitoring = false;
    
    // Notify backend
    this.wsManager.sendAudioMessage({
      type: 'bot_shutdown',
      reason,
      metrics: this.metrics,
      timestamp: new Date().toISOString(),
    });

    // Trigger shutdown callback if registered
    if (this.onShutdown) {
      this.onShutdown(reason);
    }
  }

  /**
   * Register shutdown callback
   */
  onShutdownCallback(callback) {
    this.onShutdown = callback;
  }

  /**
   * Get monitoring metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      isMonitoring: this.isMonitoring,
      lastHealthCheck: this.lastHealthCheck,
      uptime: this._getUptime(),
    };
  }

  /**
   * Get uptime in milliseconds
   */
  _getUptime() {
    return this.startTime ? Date.now() - this.startTime : 0;
  }

  /**
   * Stop monitoring
   */
  stop() {
    logger.info('🛑 Stopping meeting monitor...');
    
    this.isMonitoring = false;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    logger.success('✅ Meeting monitor stopped');
    logger.info(`   Final metrics: ${JSON.stringify(this.metrics, null, 2)}`);
  }
}

export default MeetingMonitor;
