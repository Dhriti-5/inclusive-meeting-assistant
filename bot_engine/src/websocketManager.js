/**
 * WebSocket Manager Module
 * Handles WebSocket connections to backend with automatic reconnection
 * Manages audio streaming and meeting event communication
 */
import WebSocket from 'ws';
import { config, extractMeetingId } from './config.js';
import { logger } from './utils/logger.js';

export class WebSocketManager {
  constructor(meetingUrl) {
    this.meetingUrl = meetingUrl;
    this.meetingId = extractMeetingId(meetingUrl);
    
    // Audio WebSocket
    this.audioWs = null;
    this.audioWsUrl = config.backend.audioWsUrl;
    this.isAudioConnected = false;
    
    // Meeting WebSocket
    this.meetingWs = null;
    this.meetingWsUrl = `${config.backend.meetingWsUrl}/${this.meetingId}`;
    this.isMeetingConnected = false;
    
    // Reconnection logic
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = config.backend.maxReconnectAttempts;
    this.reconnectDelay = config.backend.reconnectDelay;
    this.isShuttingDown = false;
    
    // Message queue for when connection is down
    this.messageQueue = [];
    this.maxQueueSize = 100;
    
    // Event handlers
    this.eventHandlers = {
      message: [],
      error: [],
      close: [],
      reconnect: [],
    };
  }

  /**
   * Initialize both WebSocket connections
   */
  async connect() {
    logger.info('🔌 Connecting to backend WebSockets...');
    
    try {
      await Promise.all([
        this.connectAudioWebSocket(),
        this.connectMeetingWebSocket(),
      ]);
      
      logger.success('✅ All WebSocket connections established');
      return true;
    } catch (error) {
      logger.error('❌ Failed to establish WebSocket connections:', error);
      throw error;
    }
  }

  /**
   * Connect to audio streaming WebSocket
   */
  async connectAudioWebSocket() {
    return new Promise((resolve, reject) => {
      logger.info(`   🎵 Connecting to audio WebSocket: ${this.audioWsUrl}`);
      
      this.audioWs = new WebSocket(this.audioWsUrl);

      const timeout = setTimeout(() => {
        if (!this.isAudioConnected) {
          reject(new Error('Audio WebSocket connection timeout'));
        }
      }, 10000);

      this.audioWs.on('open', () => {
        clearTimeout(timeout);
        this.isAudioConnected = true;
        this.reconnectAttempts = 0;
        
        logger.success('   ✅ Audio WebSocket connected');
        
        // Send initial connection message
        this.sendAudioMessage({
          type: 'bot_connected',
          meeting_id: this.meetingId,
          timestamp: new Date().toISOString(),
          sampleRate: config.audio.sampleRate,
          channels: config.audio.channels,
          bitDepth: config.audio.bitDepth,
        });
        
        // Process queued messages
        this._processMessageQueue();
        
        resolve();
      });

      this.audioWs.on('message', (data) => {
        this._handleAudioMessage(data);
      });

      this.audioWs.on('error', (error) => {
        logger.error('❌ Audio WebSocket error:', error.message);
        this._emitEvent('error', { type: 'audio', error });
      });

      this.audioWs.on('close', () => {
        this.isAudioConnected = false;
        logger.warn('🔌 Audio WebSocket closed');
        
        if (!this.isShuttingDown) {
          this._attemptReconnect('audio');
        }
      });
    });
  }

  /**
   * Connect to meeting events WebSocket
   */
  async connectMeetingWebSocket() {
    return new Promise((resolve, reject) => {
      logger.info(`   🧠 Connecting to meeting WebSocket: ${this.meetingWsUrl}`);
      
      this.meetingWs = new WebSocket(this.meetingWsUrl);

      const timeout = setTimeout(() => {
        if (!this.isMeetingConnected) {
          reject(new Error('Meeting WebSocket connection timeout'));
        }
      }, 10000);

      this.meetingWs.on('open', () => {
        clearTimeout(timeout);
        this.isMeetingConnected = true;
        
        logger.success('   ✅ Meeting WebSocket connected');
        
        // Send initial connection message
        this.sendMeetingMessage({
          type: 'bot_action',
          action: 'connected',
          status: 'Bot joined meeting and ready to assist',
          timestamp: new Date().toISOString(),
        });
        
        resolve();
      });

      this.meetingWs.on('message', (data) => {
        this._handleMeetingMessage(data);
      });

      this.meetingWs.on('error', (error) => {
        logger.error('❌ Meeting WebSocket error:', error.message);
        this._emitEvent('error', { type: 'meeting', error });
      });

      this.meetingWs.on('close', () => {
        this.isMeetingConnected = false;
        logger.warn('🔌 Meeting WebSocket closed');
        
        if (!this.isShuttingDown) {
          this._attemptReconnect('meeting');
        }
      });
    });
  }

  /**
   * Send audio data to backend
   */
  sendAudio(audioData) {
    if (this.isAudioConnected && this.audioWs.readyState === WebSocket.OPEN) {
      this.audioWs.send(audioData);
    } else {
      // Queue audio data is not practical for real-time streaming
      logger.warn('⚠️  Audio WebSocket not connected, data dropped');
    }
  }

  /**
   * Send JSON message to audio WebSocket
   */
  sendAudioMessage(message) {
    const data = JSON.stringify(message);
    
    if (this.isAudioConnected && this.audioWs.readyState === WebSocket.OPEN) {
      this.audioWs.send(data);
    } else {
      this._queueMessage('audio', data);
    }
  }

  /**
   * Send JSON message to meeting WebSocket
   */
  sendMeetingMessage(message) {
    const data = JSON.stringify(message);
    
    if (this.isMeetingConnected && this.meetingWs.readyState === WebSocket.OPEN) {
      this.meetingWs.send(data);
    } else {
      this._queueMessage('meeting', data);
    }
  }

  /**
   * Generic send method (uses audio WebSocket by default)
   */
  send(message) {
    this.sendAudioMessage(message);
  }

  /**
   * Check if connected to backend
   */
  isConnected() {
    return this.isAudioConnected && this.isMeetingConnected;
  }

  /**
   * Handle incoming audio WebSocket messages
   */
  _handleAudioMessage(data) {
    try {
      const message = JSON.parse(data.toString());
      logger.debug('📨 Audio message:', message);
      this._emitEvent('message', { type: 'audio', data: message });
    } catch (e) {
      // Binary data, ignore
    }
  }

  /**
   * Handle incoming meeting WebSocket messages
   */
  _handleMeetingMessage(data) {
    try {
      const message = JSON.parse(data.toString());
      logger.debug('📨 Meeting message:', message);
      this._emitEvent('message', { type: 'meeting', data: message });
    } catch (e) {
      logger.error('Failed to parse meeting message:', e);
    }
  }

  /**
   * Queue message for later delivery
   */
  _queueMessage(type, data) {
    if (this.messageQueue.length < this.maxQueueSize) {
      this.messageQueue.push({ type, data, timestamp: Date.now() });
      logger.debug(`📝 Message queued (${this.messageQueue.length}/${this.maxQueueSize})`);
    } else {
      logger.warn('⚠️  Message queue full, dropping oldest message');
      this.messageQueue.shift();
      this.messageQueue.push({ type, data, timestamp: Date.now() });
    }
  }

  /**
   * Process queued messages after reconnection
   */
  _processMessageQueue() {
    logger.info(`📤 Processing ${this.messageQueue.length} queued messages...`);
    
    while (this.messageQueue.length > 0) {
      const { type, data } = this.messageQueue.shift();
      
      if (type === 'audio' && this.isAudioConnected) {
        this.audioWs.send(data);
      } else if (type === 'meeting' && this.isMeetingConnected) {
        this.meetingWs.send(data);
      }
    }
  }

  /**
   * Attempt to reconnect WebSocket
   */
  async _attemptReconnect(type) {
    if (this.isShuttingDown) return;
    
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      logger.error(`❌ Max reconnection attempts reached for ${type} WebSocket`);
      this._emitEvent('error', { 
        type, 
        error: new Error('Max reconnection attempts exceeded') 
      });
      return;
    }
    
    const delay = this.reconnectDelay * this.reconnectAttempts;
    logger.info(`🔄 Reconnecting ${type} WebSocket in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(async () => {
      try {
        if (type === 'audio') {
          await this.connectAudioWebSocket();
        } else if (type === 'meeting') {
          await this.connectMeetingWebSocket();
        }
        
        this._emitEvent('reconnect', { type, attempt: this.reconnectAttempts });
      } catch (error) {
        logger.error(`Failed to reconnect ${type} WebSocket:`, error);
      }
    }, delay);
  }

  /**
   * Register event handler
   */
  on(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].push(handler);
    }
  }

  /**
   * Emit event to registered handlers
   */
  _emitEvent(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          logger.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Disconnect all WebSockets
   */
  async disconnect() {
    logger.info('🔌 Disconnecting WebSockets...');
    this.isShuttingDown = true;
    
    // Send disconnect messages
    if (this.isAudioConnected) {
      this.sendAudioMessage({
        type: 'bot_disconnected',
        timestamp: new Date().toISOString(),
      });
    }
    
    if (this.isMeetingConnected) {
      this.sendMeetingMessage({
        type: 'bot_action',
        action: 'disconnected',
        status: 'Bot leaving meeting',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Close connections
    if (this.audioWs) {
      this.audioWs.close();
      this.audioWs = null;
    }
    
    if (this.meetingWs) {
      this.meetingWs.close();
      this.meetingWs = null;
    }
    
    this.isAudioConnected = false;
    this.isMeetingConnected = false;
    
    logger.success('✅ WebSockets disconnected');
  }
}

export default WebSocketManager;
