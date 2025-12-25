import puppeteer from 'puppeteer';
import { getStream } from 'puppeteer-stream';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

dotenv.config();

class GoogleMeetBot {
  constructor() {
    this.browser = null;
    this.page = null;
    this.ws = null;
    this.audioStream = null;
    this.isRecording = false;
    this.signLanguagePoller = null;  // For polling sign language commands
    
    // Configuration
    this.config = {
      email: process.env.GOOGLE_EMAIL,
      password: process.env.GOOGLE_PASSWORD,
      meetingUrl: process.env.MEETING_URL,
      backendWsUrl: process.env.BACKEND_WS_URL || 'ws://localhost:8000/ws/bot-audio',
      backendApiUrl: process.env.BACKEND_API_URL || 'http://localhost:8000',
      headless: process.env.HEADLESS === 'true',
      audioSampleRate: parseInt(process.env.AUDIO_SAMPLE_RATE) || 16000,
      signLanguagePollingInterval: parseInt(process.env.SIGN_POLLING_INTERVAL) || 1000  // Check every 1 second
    };
  }

  extractMeetingId(url) {
    /**
     * Extract meeting ID from Google Meet URL
     * Example: https://meet.google.com/abc-defg-hij -> abc-defg-hij
     */
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1] || 'default';
    } catch (e) {
      console.warn('Could not extract meeting ID, using default');
      return 'default';
    }
  }

  async initialize() {
    console.log('🤖 Initializing Google Meet Bot...');
    
    // Validate configuration
    if (!this.config.email || !this.config.password) {
      throw new Error('Google credentials not configured. Check .env file.');
    }
    
    if (!this.config.meetingUrl) {
      throw new Error('Meeting URL not configured. Check .env file.');
    }
    
    // Launch browser with regular puppeteer (not puppeteer-stream)
    console.log('🚀 Launching Chrome...');
    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--use-fake-ui-for-media-stream', // Auto-allow media permissions
        '--use-fake-device-for-media-stream', // Use fake audio device
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--autoplay-policy=no-user-gesture-required'
      ],
      defaultViewport: {
        width: 1280,
        height: 720
      }
    });
    
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid bot detection
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    console.log('✅ Browser launched successfully');
  }

  async login() {
    console.log('🔐 Logging into Google Account...');
    
    try {
      // Navigate to Google login
      await this.page.goto('https://accounts.google.com/signin', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // Enter email
      console.log('   Entering email...');
      await this.page.waitForSelector('input[type="email"]', { timeout: 15000 });
      await this.page.type('input[type="email"]', this.config.email, { delay: 100 });
      
      // Click Next button (try multiple selectors)
      const nextButtonSelectors = ['#identifierNext', 'button[type="button"]'];
      let clicked = false;
      for (const selector of nextButtonSelectors) {
        try {
          await this.page.click(selector);
          clicked = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!clicked) {
        // Try pressing Enter instead
        await this.page.keyboard.press('Enter');
      }
      
      // Wait for password field with longer timeout
      console.log('   Waiting for password field...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      try {
        await this.page.waitForSelector('input[type="password"]', { visible: true, timeout: 20000 });
      } catch (e) {
        console.log('   ⚠️  Could not find password field automatically.');
        console.log('   📋 Please manually complete the login in the browser window.');
        console.log('   ⏳ Waiting 60 seconds for manual login...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        console.log('✅ Proceeding (assuming login completed)');
        return;
      }
      
      // Enter password
      console.log('   Entering password...');
      await this.page.type('input[type="password"]', this.config.password, { delay: 100 });
      
      // Click password Next button
      try {
        await this.page.click('#passwordNext');
      } catch (e) {
        await this.page.keyboard.press('Enter');
      }
      
      // Wait for login to complete
      console.log('   Completing login...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('✅ Login successful');
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      console.log('\n💡 Tip: If Google is blocking automated login:');
      console.log('   1. Enable "Less secure app access" in your Google account');
      console.log('   2. Use an App Password instead of your regular password');
      console.log('   3. Or manually login when the browser opens');
      throw error;
    }
  }

  async joinMeeting() {
    console.log('📞 Joining Google Meet...');
    
    try {
      // Navigate to meeting URL
      await this.page.goto(this.config.meetingUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to turn off camera and microphone before joining
      try {
        // Turn off camera
        const cameraButton = await this.page.$('[aria-label*="camera" i], [data-is-muted="false"]');
        if (cameraButton) {
          await cameraButton.click();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (e) {
        console.log('Camera button not found or already off');
      }
      
      // Click "Join now" or "Ask to join" button
      const joinButtonSelectors = [
        'button[jsname="Qx7uuf"]', // Join now
        'button:has-text("Join now")',
        'button:has-text("Ask to join")',
        '[aria-label*="Join" i]',
        'button span:has-text("Join")',
        '.VfPpkd-LgbsSe' // Material button
      ];
      
      let joined = false;
      for (const selector of joinButtonSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 });
          await this.page.click(selector);
          joined = true;
          console.log(`✅ Clicked join button: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!joined) {
        // Try to find any button with "Join" text
        const buttons = await this.page.$$('button');
        for (const button of buttons) {
          const text = await button.evaluate(el => el.textContent);
          if (text && (text.includes('Join') || text.includes('Ask to join'))) {
            await button.click();
            joined = true;
            console.log('✅ Clicked join button by text content');
            break;
          }
        }
      }
      
      if (!joined) {
        throw new Error('Could not find join button');
      }
      
      // Wait for meeting to load
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('✅ Successfully joined the meeting');
    } catch (error) {
      console.error('❌ Failed to join meeting:', error.message);
      throw error;
    }
  }

  async connectWebSocket() {
    console.log('🔌 Connecting to backend WebSocket...');
    
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.config.backendWsUrl);
      
      this.ws.on('open', () => {
        console.log('✅ WebSocket connected to backend');
        
        // Extract meeting ID from URL
        const meetingId = this.extractMeetingId(this.config.meetingUrl);
        
        // Send initial connection message
        this.ws.send(JSON.stringify({
          type: 'bot_connected',
          meeting_id: meetingId,
          timestamp: new Date().toISOString(),
          sampleRate: this.config.audioSampleRate
        }));
        
        resolve();
      });
      
      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('📨 Received from backend:', message);
        } catch (e) {
          console.log('📨 Received binary data from backend');
        }
      });
      
      this.ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        reject(error);
      });
      
      this.ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
      });
      
      // Timeout
      setTimeout(() => {
        if (this.ws.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);
    });
  }

  async startAudioCapture() {
    console.log('🎤 Starting audio capture...');
    
    try {
      // Get audio stream from the page
      const stream = await getStream(this.page, {
        audio: true,
        video: false,
        mimeType: 'audio/webm',
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 0,
        frameSize: 20 // 20ms frames
      });
      
      this.audioStream = stream;
      this.isRecording = true;
      
      console.log('✅ Audio capture started');
      
      // Stream audio data to backend via WebSocket
      stream.on('data', (chunk) => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN && this.isRecording) {
          // Send audio chunk to backend
          this.ws.send(chunk);
        }
      });
      
      stream.on('error', (error) => {
        console.error('❌ Audio stream error:', error);
        this.isRecording = false;
      });
      
      stream.on('end', () => {
        console.log('🎤 Audio stream ended');
        this.isRecording = false;
      });
      
      // Keep the bot alive and recording
      console.log('🎙️ Bot is now recording audio from the meeting...');
      console.log('Press Ctrl+C to stop the bot');
      
    } catch (error) {
      console.error('❌ Failed to start audio capture:', error);
      throw error;
    }
  }

  /**
   * PHASE 4: Sign Language Bridge
   * Poll the backend for sign language commands and type them in chat
   */
  async startSignLanguagePoller() {
    console.log('🤟 Starting Sign Language Command Poller...');
    console.log(`   Polling interval: ${this.config.signLanguagePollingInterval}ms`);
    
    this.signLanguagePoller = setInterval(async () => {
      try {
        // Check backend for new sign language commands
        const response = await fetch(`${this.config.backendApiUrl}/api/get-latest-command`);
        const data = await response.json();
        
        if (data.command === 'type' && data.text) {
          console.log(`✍️ Sign Language Command: ${data.text}`);
          await this.sendChatMessage(data.text);
        }
        
      } catch (error) {
        // Silently ignore errors (backend might be restarting)
        // Uncomment for debugging: console.error('Sign language poller error:', error.message);
      }
    }, this.config.signLanguagePollingInterval);
  }

  /**
   * Send a message to Google Meet chat
   */
  async sendChatMessage(message) {
    try {
      // Wait a moment to ensure page is ready
      await this.page.waitForTimeout(500);
      
      // Try to find and click the chat button (if chat isn't already open)
      // Google Meet selectors can change - these are common patterns
      const chatButtonSelectors = [
        'button[aria-label*="Chat"]',
        'button[aria-label*="chat"]',
        '[data-tooltip*="Chat"]',
        'button[jsname="A5il2e"]'  // Google Meet internal name
      ];
      
      for (const selector of chatButtonSelectors) {
        try {
          const chatButton = await this.page.$(selector);
          if (chatButton) {
            // Check if chat is already open by looking for the input field
            const chatInput = await this.page.$('textarea[aria-label*="message"]');
            
            if (!chatInput) {
              // Chat not open, click to open it
              await chatButton.click();
              await this.page.waitForTimeout(1000); // Wait for chat to open
              console.log('   📂 Opened chat panel');
            }
            break;
          }
        } catch (e) {
          // Try next selector
          continue;
        }
      }
      
      // Find the chat input textarea
      const textareaSelectors = [
        'textarea[aria-label*="message"]',
        'textarea[placeholder*="message"]',
        'textarea[jsname="YPqjbf"]'  // Google Meet internal name
      ];
      
      let textarea = null;
      for (const selector of textareaSelectors) {
        textarea = await this.page.$(selector);
        if (textarea) break;
      }
      
      if (textarea) {
        // Type the message
        await textarea.click();
        await textarea.type(message, { delay: 50 });
        
        // Press Enter to send
        await this.page.keyboard.press('Enter');
        
        console.log(`   ✅ Message sent to chat: "${message}"`);
      } else {
        console.log('   ⚠️ Could not find chat input field');
      }
      
    } catch (error) {
      console.error('   ❌ Error sending chat message:', error.message);
    }
  }

  async stop() {
    console.log('🛑 Stopping bot...');
    
    this.isRecording = false;
    
    // Stop sign language poller
    if (this.signLanguagePoller) {
      clearInterval(this.signLanguagePoller);
      this.signLanguagePoller = null;
      console.log('✅ Sign language poller stopped');
    }
    
    if (this.audioStream) {
      this.audioStream.destroy();
    }
    
    if (this.ws) {
      this.ws.send(JSON.stringify({
        type: 'bot_disconnected',
        timestamp: new Date().toISOString()
      }));
      this.ws.close();
    }
    
    if (this.browser) {
      await this.browser.close();
    }
    
    console.log('✅ Bot stopped successfully');
  }

  async run() {
    try {
      await this.initialize();
      await this.login();
      await this.joinMeeting();
      await this.connectWebSocket();
      await this.startAudioCapture();
      
      // PHASE 4: Start sign language command poller
      await this.startSignLanguagePoller();
      console.log('🎉 Bot is fully operational!');
      console.log('   - Audio transcription: ✅');
      console.log('   - Sign language bridge: ✅');
      
      // Keep process alive
      process.on('SIGINT', async () => {
        console.log('\n👋 Received SIGINT, shutting down...');
        await this.stop();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        console.log('\n👋 Received SIGTERM, shutting down...');
        await this.stop();
        process.exit(0);
      });
      
    } catch (error) {
      console.error('❌ Bot encountered an error:', error);
      await this.stop();
      process.exit(1);
    }
  }
}

// Run the bot
const bot = new GoogleMeetBot();
bot.run();
