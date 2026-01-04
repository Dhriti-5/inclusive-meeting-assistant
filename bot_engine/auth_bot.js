import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { getStream } from 'puppeteer-stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

puppeteer.use(StealthPlugin());

const MEETING_LINK = process.argv[2];
const MEETING_ID = process.argv[3] || null;  // Meeting ID passed from backend
const BACKEND_URL = process.argv[4] || process.env.BACKEND_URL || "http://localhost:8000";
const BOT_NAME = "Ora";

if (!MEETING_LINK) {
    console.error("❌ Error: No meeting link provided.");
    console.error("Usage: node auth_bot.js <google-meet-url>");
    process.exit(1);
}

(async () => {
    console.log("🤖 Ora AI Waking Up...");

    // 1. Launch Browser
    // We keep headless: false locally for debugging, but use "new" for Docker later
    const browser = await puppeteer.launch({
        headless: false, 
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--use-fake-ui-for-media-stream', // Auto-accepts permissions
            '--window-size=1280,720',
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ],
        ignoreDefaultArgs: ['--enable-automation']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // 2. INJECT COOKIES (The "Login" Step)
    let cookies = [];
    const cookiesPath = path.join(__dirname, 'ora_cookies.json');
    
    if (process.env.ORA_COOKIES_BASE64) {
        // Production: Read from Secret Environment Variable
        try {
            const decoded = Buffer.from(process.env.ORA_COOKIES_BASE64, 'base64').toString('utf-8');
            cookies = JSON.parse(decoded);
            console.log("🔒 Loaded Cookies from Environment Secret");
        } catch (e) {
            console.error("❌ Failed to decode cookies from environment:", e.message);
            await browser.close();
            process.exit(1);
        }
    } else if (fs.existsSync(cookiesPath)) {
        // Local: Read from file
        try {
            const cookiesString = fs.readFileSync(cookiesPath, 'utf8');
            cookies = JSON.parse(cookiesString);
            console.log("📂 Loaded Cookies from Local File");
        } catch (e) {
            console.error("❌ Failed to read cookies from file:", e.message);
            await browser.close();
            process.exit(1);
        }
    } else {
        console.error("❌ CRITICAL: No cookies found. Bot will be a Guest (and likely blocked).");
        console.error(`Expected file at: ${cookiesPath}`);
        console.error("Please export cookies using EditThisCookie or Cookie-Editor extension.");
        await browser.close();
        process.exit(1);
    }

    // Set the cookies
    try {
        await page.setCookie(...cookies);
        console.log(`🍪 Identity Loaded: ${BOT_NAME} AI`);
    } catch (e) {
        console.error("❌ Failed to set cookies:", e.message);
        await browser.close();
        process.exit(1);
    }

    // 3. Navigate to Meeting
    console.log(`🔗 Joining: ${MEETING_LINK}`);
    try {
        await page.goto(MEETING_LINK, { waitUntil: 'networkidle2', timeout: 30000 });
        console.log("✅ Page loaded successfully");
    } catch (e) {
        console.error("❌ Failed to load meeting page:", e.message);
        await page.screenshot({ path: 'error_screenshot.png' });
        await browser.close();
        process.exit(1);
    }

    // Give the page time to initialize
    await new Promise(r => setTimeout(r, 5000));
    
    // Debug: Check what page we're actually on
    const pageContent = await page.content();
    const currentUrl = page.url();
    const pageTitle = await page.title();
    console.log(`📍 Current URL: ${currentUrl}`);
    console.log(`📄 Page Title: ${pageTitle}`);
    
    // Verify we're logged in by checking for account indicator
    const loginStatus = await page.evaluate(() => {
        // Check for profile picture or account menu
        const profilePic = document.querySelector('[data-is-touch-wrapper] img');
        const accountMenu = document.querySelector('[aria-label*="Google Account" i]');
        
        // Check for sign in button (indicates NOT logged in)
        const signInBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
            el.textContent.toLowerCase().includes('sign in')
        );
        
        // Check if we're on a meeting page (has meeting controls)
        const hasMeetingControls = document.querySelector('[aria-label*="microphone" i]') || 
                                   document.querySelector('[aria-label*="camera" i]');
        
        return {
            hasProfile: !!(profilePic || accountMenu),
            hasSignIn: !!signInBtn,
            hasMeetingControls: !!hasMeetingControls
        };
    });
    
    if (loginStatus.hasProfile || loginStatus.hasMeetingControls) {
        console.log("✅ Confirmed: Logged in (detected meeting controls)");
    } else if (loginStatus.hasSignIn) {
        console.log("❌ ERROR: Not logged in - Sign in button detected");
        console.log("   Your cookies are expired or invalid");
        await page.screenshot({ path: 'not_logged_in.png' });
        await browser.close();
        process.exit(1);
    } else {
        console.log("⚠️ Login status unclear, proceeding anyway...");
    }

    // 4. Handle Pre-Meeting Setup
    // Check if we need to turn off camera/mic (though it should be remembered)
    try {
        // Check if we're on the pre-join screen
        console.log("🎥 Looking for pre-join controls...");
        
        // Try to find and click camera/mic toggle buttons if they're on
        // Camera button
        try {
            const cameraBtnSelector = 'div[data-is-muted="false"][aria-label*="camera" i]';
            const cameraBtn = await page.$(cameraBtnSelector);
            if (cameraBtn) {
                await cameraBtn.click();
                console.log("📷 Camera turned OFF");
                await new Promise(r => setTimeout(r, 500));
            }
        } catch (e) {
            console.log("ℹ️ Camera already off or not found");
        }

        // Microphone button
        try {
            const micBtnSelector = 'div[data-is-muted="false"][aria-label*="microphone" i]';
            const micBtn = await page.$(micBtnSelector);
            if (micBtn) {
                await micBtn.click();
                console.log("🎤 Microphone turned OFF");
                await new Promise(r => setTimeout(r, 500));
            }
        } catch (e) {
            console.log("ℹ️ Microphone already off or not found");
        }

    } catch (e) {
        console.log("ℹ️ Pre-join setup skipped:", e.message);
    }

    // 5. Click Join Button OR detect if already in meeting
    try {
        console.log("🚪 Looking for join button...");
        
        // First check if we're already in the meeting (Leave call button present)
        const alreadyInMeeting = await page.$('button[aria-label*="Leave call" i]');
        
        if (alreadyInMeeting) {
            console.log("✅ Already in meeting! (Leave call button found)");
            // Skip join button logic
        } else {
            // First, let's see all buttons on the page for debugging
            const allButtons = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('button')).map(btn => ({
                    text: btn.textContent.trim(),
                    ariaLabel: btn.getAttribute('aria-label'),
                    visible: btn.offsetParent !== null
                })).filter(b => b.visible && (b.text || b.ariaLabel));
            });
            console.log("🔍 All visible buttons:", JSON.stringify(allButtons, null, 2));
            
            // Wait a bit more for dynamic content to load
            await new Promise(r => setTimeout(r, 2000));
            
            // Strategy 1: Find by text content (case insensitive)
            let clicked = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const joinButton = buttons.find(btn => {
                    const text = btn.textContent.trim().toLowerCase();
                    return text.includes('join now') || text.includes('ask to join') || 
                           text.includes('join') || text === 'join';
                });
                if (joinButton && joinButton.offsetParent !== null) {
                    joinButton.click();
                    return true;
                }
                return false;
            });

            if (!clicked) {
                // Strategy 2: Find by aria-label
                clicked = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button[aria-label]'));
                    const joinButton = buttons.find(btn => {
                        const label = btn.getAttribute('aria-label').toLowerCase();
                        return label.includes('join') || label.includes('ask to join');
                    });
                    if (joinButton && joinButton.offsetParent !== null) {
                        joinButton.click();
                        return true;
                    }
                    return false;
                });
            }

            if (clicked) {
                console.log("🚀 Clicked Join Button!");
                // Wait for the join action to process
                await new Promise(r => setTimeout(r, 5000));
            } else {
                console.log("⚠️ Join button not found. May already be in or error occurred.");
            }
        }

    } catch (e) {
        console.log("⚠️ Join button handling failed:", e.message);
    }

    // 6. Check for errors before waiting for admission
    const errorMessage = await page.evaluate(() => {
        const errorText = Array.from(document.querySelectorAll('div, span, p')).find(el => 
            el.textContent.includes("Couldn't start") || 
            el.textContent.includes("error") ||
            el.textContent.includes("try again")
        );
        return errorText ? errorText.textContent.trim() : null;
    });
    
    if (errorMessage) {
        console.log("❌ Google Meet Error Detected:", errorMessage);
        console.log("\n🔧 This error means:");
        console.log("   • Google is blocking automated browser access");
        console.log("   • Even with valid cookies, Meet detects automation");
        console.log("\n💡 Solutions:");
        console.log("   1. Try with headless: 'new' instead of false");
        console.log("   2. Add more human-like delays");
        console.log("   3. Use a real browser profile (not automated)");
        await page.screenshot({ path: 'meet_error.png' });
        console.log("📸 Screenshot saved: meet_error.png");
    }
    
    // 7. Wait for Meeting to Start
    // Look for the "Leave call" button (Red phone icon) - indicates we're in
    try {
        console.log("⏳ Waiting for meeting admission...");
        
        // Wait up to 90 seconds for host to admit us (increased timeout)
        // Also check we're not on an error page
        const leaveCallFound = await Promise.race([
            page.waitForSelector('button[aria-label*="Leave call" i]', { timeout: 90000 })
                .then(() => true),
            page.waitForSelector('button[aria-label*="Return to home" i]', { timeout: 90000 })
                .then(() => false)
        ]);
        
        if (!leaveCallFound) {
            console.log("❌ Detected error page or rejection. Bot was not admitted.");
            // Take screenshot to see what happened
            try {
                await page.screenshot({ path: 'rejection_screenshot.png' });
                console.log("📸 Screenshot saved: rejection_screenshot.png");
            } catch (e) {}
            throw new Error("Bot was rejected or meeting ended");
        }
        
        console.log("✅ Ora is INSIDE the meeting!");
        
        // Wait a bit to ensure we're stable in the meeting
        await new Promise(r => setTimeout(r, 3000));
        
        // Verify we're still in the meeting (not kicked out)
        const stillInMeeting = await page.$('button[aria-label*="Leave call" i]');
        if (!stillInMeeting) {
            console.log("❌ Bot was kicked out immediately after joining");
            throw new Error("Kicked out of meeting - possible authentication issue");
        }

        // --- AUDIO RECORDING START ---
        console.log("🎙️ Starting audio capture...");
        
        try {
            const stream = await getStream(page, { audio: true, video: false });
            const audioFilePath = path.join(__dirname, 'temp_recordings', `meeting_${Date.now()}.webm`);
            
            // Ensure temp_recordings directory exists
            const tempDir = path.join(__dirname, 'temp_recordings');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            const fileStream = fs.createWriteStream(audioFilePath);
            stream.pipe(fileStream);
            console.log("🔴 Recording Started...");
            console.log(`📁 Saving to: ${audioFilePath}`);

            // Keep recording until the meeting ends or we're removed
            // Check every 5 seconds if we're still in the meeting
            let stillInMeeting = true;
            while (stillInMeeting) {
                await new Promise(r => setTimeout(r, 5000));
                
                // Check if "Leave call" button still exists
                const leaveBtn = await page.$('button[aria-label*="Leave call" i]');
                if (!leaveBtn) {
                    stillInMeeting = false;
                    console.log("📞 Meeting ended or bot was removed");
                }
            }
            
            // Stop recording
            stream.destroy();
            fileStream.end();
            console.log("💾 Audio Saved Successfully");
            
            // Wait for file to finish writing
            await new Promise(r => setTimeout(r, 2000));
            
            // Upload audio to backend for processing
            if (MEETING_ID) {
                console.log("📤 Uploading audio to backend for processing...");
                try {
                    const formData = new FormData();
                    formData.append('audio', fs.createReadStream(audioFilePath));
                    formData.append('lang', 'en');
                    
                    const response = await axios.post(
                        `${BACKEND_URL}/api/meetings/${MEETING_ID}/upload-audio`,
                        formData,
                        {
                            headers: {
                                ...formData.getHeaders()
                            },
                            maxContentLength: Infinity,
                            maxBodyLength: Infinity
                        }
                    );
                    
                    console.log("✅ Audio uploaded successfully!");
                    console.log("📊 Backend processing meeting...");
                    
                } catch (uploadError) {
                    console.error("❌ Failed to upload audio:", uploadError.message);
                    console.error("   Audio saved locally at:", audioFilePath);
                }
            } else {
                console.log("⚠️ No meeting ID provided - audio saved locally only");
                console.log("   File:", audioFilePath);
            }

        } catch (recordError) {
            console.error("❌ Recording failed:", recordError.message);
        }

    } catch (e) {
        console.log("❌ Failed to join meeting:", e.message);
        console.log("Possible reasons:");
        console.log("  - Host didn't admit the bot");
        console.log("  - Meeting link is invalid or expired");
        console.log("  - Cookies expired (need to refresh)");
        
        // Take screenshot for debugging (only if page is still open)
        try {
            if (!page.isClosed()) {
                await page.screenshot({ path: 'join_failed_screenshot.png' });
                console.log("📸 Screenshot saved: join_failed_screenshot.png");
            }
        } catch (screenshotError) {
            console.log("⚠️ Could not take screenshot (page may be closed)");
        }
    }

    // Cleanup
    console.log("👋 Ora shutting down...");
    try {
        if (browser && !browser.process()?.killed) {
            await browser.close();
        }
    } catch (closeError) {
        console.log("⚠️ Browser already closed");
    }
    
    // Keep window open on Windows for debugging
    if (process.platform === 'win32') {
        console.log("\nPress Ctrl+C to close this window...");
        await new Promise(() => {}); // Never resolves, keeps process alive
    }
})().catch(err => {
    console.error("💥 Fatal Error:", err);
    process.exit(1);
});
