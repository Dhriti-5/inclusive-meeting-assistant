/**
 * Meeting Navigator Module
 * Handles Google Meet authentication, navigation, and meeting entry
 * Uses XPath and multiple selector strategies for robustness
 */
import { config } from './config.js';
import { logger } from './utils/logger.js';

export class MeetingNavigator {
  constructor(page) {
    this.page = page;
    this.isAuthenticated = false;
    this.isInMeeting = false;
  }

  /**
   * Authenticate with Google Account
   */
  async authenticate() {
    try {
      logger.info('🔐 Starting Google authentication...');

      // Navigate to Google login
      await this.page.goto('https://accounts.google.com/signin', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Step 1: Enter email
      await this._enterEmail();

      // Wait for navigation
      await this._waitFor(3000);

      // Step 2: Enter password
      await this._enterPassword();

      // Wait for login to complete
      await this._waitFor(5000);

      this.isAuthenticated = true;
      logger.success('✅ Authentication successful');

      return true;
    } catch (error) {
      logger.error('❌ Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Enter email address
   */
  async _enterEmail() {
    try {
      logger.info('   📧 Entering email address...');

      await this.page.waitForSelector('input[type="email"]', { timeout: 15000 });
      await this.page.type('input[type="email"]', config.google.email, { delay: 100 });

      // Click Next button (try multiple strategies)
      await this._clickButton(['#identifierNext', 'button[type="button"]'], 'Next');

    } catch (error) {
      logger.error('Failed to enter email:', error);
      throw error;
    }
  }

  /**
   * Enter password
   */
  async _enterPassword() {
    try {
      logger.info('   🔑 Entering password...');

      // Wait for password field
      const passwordField = await this.page.waitForSelector('input[type="password"]', {
        visible: true,
        timeout: 20000,
      });

      if (!passwordField) {
        throw new Error('Password field not found');
      }

      await this.page.type('input[type="password"]', config.google.password, { delay: 100 });

      // Click password Next button
      await this._clickButton(['#passwordNext'], 'Password Next');

    } catch (error) {
      logger.warn('⚠️  Automated password entry failed');
      logger.info('📋 Manual login required - please complete in browser window');
      logger.info('⏳ Waiting 60 seconds for manual completion...');
      await this._waitFor(60000);
    }
  }

  /**
   * Navigate to meeting and join
   */
  async joinMeeting(meetingUrl) {
    try {
      logger.info('📞 Navigating to Google Meet...');

      // Navigate to meeting URL
      await this.page.goto(meetingUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      logger.info('   Waiting for page to fully load...');
      await this._waitFor(5000);

      // Disable camera and microphone
      await this._disableMediaDevices();

      // Wait a bit more for the page to stabilize
      await this._waitFor(2000);

      // Click join button
      await this._clickJoinButton();

      // Wait for meeting interface to load
      logger.info('   Waiting for meeting entry...');
      await this._waitFor(5000);

      // Check if we are waiting for approval
      const isWaiting = await this._checkForWaitingRoom();
      if (isWaiting) {
        logger.info('   ⏳ Waiting for host approval...');
        // Wait up to 60 seconds for approval
        for (let i = 0; i < 12; i++) {
          await this._waitFor(5000);
          if (await this._verifyInMeeting()) {
            logger.success('   ✅ Host approved join request');
            break;
          }
          // Check if we got rejected
          if (await this._checkIfRejected()) {
             throw new Error('Host rejected join request');
          }
        }
      }

      // Verify we're actually in the meeting (not kicked out)
      const actuallyInMeeting = await this._verifyInMeeting();
      
      if (!actuallyInMeeting) {
        logger.error('❌ Bot was kicked out or meeting ended');
        logger.error('   Possible reasons:');
        logger.error('   • Meeting already ended');
        logger.error('   • Host rejected join request');
        logger.error('   • No participants in meeting');
        logger.error('   • Google detected bot behavior');
        throw new Error('Unable to stay in meeting');
      }

      this.isInMeeting = true;
      logger.success('✅ Successfully joined the meeting');

      return true;
    } catch (error) {
      logger.error('❌ Failed to join meeting:', error);
      throw error;
    }
  }

  /**
   * Disable camera and microphone before joining
   */
  async _disableMediaDevices() {
    try {
      logger.info('   🎥 Disabling camera and microphone...');

      // Google Meet camera button selectors
      const cameraSelectors = [
        '[aria-label*="Turn off camera" i]',
        '[aria-label*="camera" i][data-is-muted="false"]',
        'button[jsname="BOHaEe"]', // Camera button
      ];

      // Try to click camera button if it's on
      for (const selector of cameraSelectors) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            await button.click();
            await this._waitFor(500);
            logger.info('   ✅ Camera disabled');
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      // Google Meet microphone button selectors
      const micSelectors = [
        '[aria-label*="Turn off microphone" i]',
        '[aria-label*="microphone" i][data-is-muted="false"]',
        'button[jsname="BOHaEe"]', // Mic button
      ];

      // Try to click mic button if it's on
      for (const selector of micSelectors) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            await button.click();
            await this._waitFor(500);
            logger.info('   ✅ Microphone disabled');
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

    } catch (error) {
      logger.warn('⚠️  Could not disable media devices:', error.message);
      logger.info('   Continuing anyway...');
    }
  }

  /**
   * Click the join button using multiple strategies
   */
  async _clickJoinButton() {
    logger.info('   🚪 Looking for join button...');

    // Strategy 1: Try common button selectors
    const buttonSelectors = [
      'button[jsname="Qx7uuf"]', // Join now
      'div[role="button"][jsname="Qx7uuf"]',
      'span[jsname="V67aGc"]',
    ];

    for (const selector of buttonSelectors) {
      try {
        const element = await this.page.waitForSelector(selector, {
          timeout: 5000,
          visible: true,
        });
        
        if (element) {
          await element.click();
          logger.success(`   ✅ Clicked join button (${selector})`);
          return true;
        }
      } catch (e) {
        // Try next selector
        continue;
      }
    }

    // Strategy 2: Try XPath for text-based search
    logger.info('   Trying XPath fallback...');
    const joinTexts = ['Join now', 'Ask to join', 'Join', 'Rejoindre'];
    
    for (const text of joinTexts) {
      try {
        const xpath = `//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${text.toLowerCase()}')]`;
        const buttons = await this.page.$x(xpath);
        
        if (buttons.length > 0) {
          await buttons[0].click();
          logger.success(`   ✅ Clicked join button via XPath ("${text}")`);
          return true;
        }
      } catch (e) {
        continue;
      }
    }

    // Strategy 3: Manual fallback
    logger.warn('   ⚠️  Could not find join button automatically');
    logger.info('   👆 Please click "Join now" manually in the browser');
    logger.info('   ⏳ Waiting 30 seconds...');
    await this._waitFor(30000);
    
    return true; // Assume user clicked it
  }

  /**
   * Click a button using multiple selectors
   */
  async _clickButton(selectors, buttonName = 'Button') {
    let clicked = false;

    for (const selector of selectors) {
      try {
        await this.page.click(selector);
        clicked = true;
        logger.info(`   ✅ Clicked ${buttonName}`);
        break;
      } catch (e) {
        continue;
      }
    }

    if (!clicked) {
      // Fallback: Press Enter
      logger.info(`   Pressing Enter instead of clicking ${buttonName}`);
      await this.page.keyboard.press('Enter');
    }
  }

  /**
   * Check if we are in the waiting room ("Asking to join...")
   */
  async _checkForWaitingRoom() {
    try {
      const waitingIndicators = [
        'text=Asking to join',
        'text=You\'ll join the call when someone lets you in',
        'span[jsname="V67aGc"]:has-text("Asking to join")',
      ];

      for (const selector of waitingIndicators) {
        const element = await this.page.$(selector);
        if (element && await element.isVisible()) {
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if join request was rejected
   */
  async _checkIfRejected() {
    try {
      const rejectedIndicators = [
        'text=You can\'t join this call',
        'text=Return to home screen',
        'text=Someone denied your request to join',
      ];

      for (const selector of rejectedIndicators) {
        const element = await this.page.$(selector);
        if (element && await element.isVisible()) {
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Verify we're actually in the meeting (not on home screen)
   */
  async _verifyInMeeting() {
    try {
      await this._waitFor(2000); // Wait a bit for UI to stabilize
      
      // Check for "Return to home screen" or similar exit messages
      const exitIndicators = [
        'text=Return to home screen',
        'text=You left the meeting',
        'text=You\'re not in this call',
        'text=Meeting ended',
        '[aria-label*="Return to home"]',
      ];

      for (const selector of exitIndicators) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            const isVisible = await element.isVisible();
            if (isVisible) {
              logger.warn(`⚠️  Detected exit indicator: ${selector}`);
              return false;
            }
          }
        } catch (e) {
          // Selector not found, continue
        }
      }

      // Check for active meeting indicators
      const activeMeetingSelectors = [
        '[aria-label*="Leave call"]',
        '[aria-label*="End call"]',
        'button[jsname="CQylAd"]', // Leave button
        '[data-call-ended="false"]',
      ];

      for (const selector of activeMeetingSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            return true;
          }
        } catch (e) {
          continue;
        }
      }

      // If we can't find meeting UI, probably not in meeting
      logger.warn('⚠️  Cannot verify meeting status - no UI indicators found');
      return false;

    } catch (error) {
      logger.warn('Error verifying meeting status:', error.message);
      return false;
    }
  }

  /**
   * Check if still in meeting
   */
  async isStillInMeeting() {
    return this._verifyInMeeting();
  }

  /**
   * Leave the meeting gracefully
   */
  async leaveMeeting() {
    try {
      logger.info('🚪 Leaving meeting...');

      const leaveSelectors = [
        '[aria-label*="Leave call"]',
        '[aria-label*="End call"]',
        'button[jsname="CQylAd"]',
      ];

      for (const selector of leaveSelectors) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            await button.click();
            logger.success('✅ Left meeting');
            this.isInMeeting = false;
            return true;
          }
        } catch (e) {
          continue;
        }
      }

      logger.warn('⚠️  Could not find leave button');
      return false;

    } catch (error) {
      logger.error('Error leaving meeting:', error);
      return false;
    }
  }

  /**
   * Utility: Wait for specified duration
   */
  async _waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default MeetingNavigator;
