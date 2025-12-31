/**
 * Audio Stream Handler Module
 * Manages audio capture from Google Meet using puppeteer-stream
 * Streams audio to backend via WebSocket
 */
import { getStream } from 'puppeteer-stream';
import { config } from './config.js';
import { logger } from './utils/logger.js';

export class AudioStreamHandler {
  constructor(websocketManager) {
    this.wsManager = websocketManager;
    this.stream = null;
    this.isStreaming = false;
    this.bytesStreamed = 0;
    this.startTime = null;
    this.lastChunkTime = null;
    this.chunksProcessed = 0;
  }

  /**
   * Start capturing audio from the page
   */
  async startCapture(page) {
    try {
      logger.info('🎤 Initializing audio capture...');

      // Configure audio stream
      const streamOptions = {
        audio: true,
        video: false,
        mimeType: config.audio.mimeType,
        audioBitsPerSecond: config.audio.audioBitsPerSecond,
        videoBitsPerSecond: 0,
        frameSize: config.audio.chunkDuration,
      };

      // Get audio stream from the page
      this.stream = await getStream(page, streamOptions);
      this.isStreaming = true;
      this.startTime = Date.now();

      logger.success('✅ Audio capture initialized');
      logger.info(`   Sample Rate: ${config.audio.sampleRate}Hz`);
      logger.info(`   Channels: ${config.audio.channels} (Mono)`);
      logger.info(`   Bit Depth: ${config.audio.bitDepth}-bit PCM`);

      // Set up stream event handlers
      this._setupStreamHandlers();

      return true;
    } catch (error) {
      logger.error('❌ Failed to start audio capture:', error);
      throw error;
    }
  }

  /**
   * Set up event handlers for the audio stream
   */
  _setupStreamHandlers() {
    // Handle incoming audio data
    this.stream.on('data', (chunk) => {
      this._handleAudioChunk(chunk);
    });

    // Handle stream errors
    this.stream.on('error', (error) => {
      logger.error('❌ Audio stream error:', error);
      this.isStreaming = false;
      this._notifyStreamError(error);
    });

    // Handle stream end
    this.stream.on('end', () => {
      logger.warn('🎤 Audio stream ended');
      this.isStreaming = false;
      this._notifyStreamEnd();
    });
  }

  /**
   * Process and forward audio chunk to backend
   */
  _handleAudioChunk(chunk) {
    if (!this.isStreaming) return;

    try {
      // Update metrics
      this.bytesStreamed += chunk.length;
      this.chunksProcessed++;
      this.lastChunkTime = Date.now();

      // Send audio chunk to backend via WebSocket
      if (this.wsManager.isConnected()) {
        this.wsManager.sendAudio(chunk);
      } else {
        logger.warn('⚠️  WebSocket not connected, audio chunk dropped');
      }

      // Log periodic stats (every 100 chunks)
      if (this.chunksProcessed % 100 === 0) {
        this._logStats();
      }
    } catch (error) {
      logger.error('❌ Error handling audio chunk:', error);
    }
  }

  /**
   * Notify backend of stream error
   */
  _notifyStreamError(error) {
    if (this.wsManager.isConnected()) {
      this.wsManager.send({
        type: 'audio_stream_error',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Notify backend of stream end
   */
  _notifyStreamEnd() {
    if (this.wsManager.isConnected()) {
      this.wsManager.send({
        type: 'audio_stream_ended',
        totalBytes: this.bytesStreamed,
        totalChunks: this.chunksProcessed,
        duration: this._getStreamDuration(),
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Log streaming statistics
   */
  _logStats() {
    const duration = this._getStreamDuration();
    const mbStreamed = (this.bytesStreamed / (1024 * 1024)).toFixed(2);
    const chunksPerSecond = (this.chunksProcessed / (duration / 1000)).toFixed(1);

    logger.info(`📊 Stream Stats: ${mbStreamed} MB | ${this.chunksProcessed} chunks | ${chunksPerSecond} chunks/s`);
  }

  /**
   * Get stream duration in milliseconds
   */
  _getStreamDuration() {
    return this.startTime ? Date.now() - this.startTime : 0;
  }

  /**
   * Get current streaming status
   */
  getStatus() {
    return {
      isStreaming: this.isStreaming,
      bytesStreamed: this.bytesStreamed,
      chunksProcessed: this.chunksProcessed,
      duration: this._getStreamDuration(),
      lastChunkTime: this.lastChunkTime,
    };
  }

  /**
   * Check if stream is healthy
   */
  isHealthy() {
    if (!this.isStreaming) return false;
    
    // Check if we received audio recently (within last 5 seconds)
    const timeSinceLastChunk = Date.now() - (this.lastChunkTime || 0);
    return timeSinceLastChunk < 5000;
  }

  /**
   * Stop audio capture
   */
  async stop() {
    logger.info('🛑 Stopping audio capture...');

    this.isStreaming = false;

    if (this.stream) {
      try {
        this.stream.destroy();
        this.stream = null;
        logger.success('✅ Audio stream stopped');
      } catch (error) {
        logger.error('❌ Error stopping stream:', error);
      }
    }

    // Log final stats
    this._logFinalStats();
  }

  /**
   * Log final streaming statistics
   */
  _logFinalStats() {
    const duration = this._getStreamDuration();
    const durationSeconds = (duration / 1000).toFixed(1);
    const mbStreamed = (this.bytesStreamed / (1024 * 1024)).toFixed(2);

    logger.info('📊 Final Audio Stream Statistics:');
    logger.info(`   Duration: ${durationSeconds}s`);
    logger.info(`   Data Streamed: ${mbStreamed} MB`);
    logger.info(`   Total Chunks: ${this.chunksProcessed}`);
  }
}

export default AudioStreamHandler;
