# 🔧 Bot Engine Troubleshooting

## Common Errors & Solutions

### ❌ "Attempted to use detached Frame"

**What it means:** The browser page reloaded or changed while the bot was trying to interact with it.

**✅ Fixed!** The bot now:
- Uses better timing and waits for page loads
- Has multiple fallback methods to find the join button
- Uses XPath as a backup
- Prompts for manual join if automation fails

**If it still happens:**
1. Increase wait times in the meeting URL
2. Check your internet connection (slow loading can cause issues)
3. Make sure the meeting link is valid and active

---

### ❌ "Google credentials not configured"

**Solution:**
1. Edit `bot_engine/.env` file
2. Replace placeholders with real values:
   ```env
   GOOGLE_EMAIL=your-actual-email@gmail.com
   GOOGLE_PASSWORD=your-app-password
   ```

---

### ❌ Bot can't login to Google

**Solutions:**

1. **Use App Password (Recommended):**
   - Go to https://myaccount.google.com/apppasswords
   - Generate an app password
   - Use that instead of regular password

2. **Enable Less Secure Apps:**
   - Some accounts need this enabled
   - Go to Google Account Security settings

3. **Try Manual Login:**
   - Set `HEADLESS=false` in `.env`
   - Bot will pause for 60 seconds
   - Login manually in the browser window

4. **Create Dedicated Account:**
   - Make a new Gmail just for the bot
   - Simpler security settings

---

### ❌ "Could not find join button"

**Now Fixed!** The bot will:
1. Try multiple selector strategies
2. Use XPath to find buttons with "Join" text
3. Wait 30 seconds and ask you to click manually

**Manual Override:**
- When you see the message, just click "Join now" yourself
- Bot will continue automatically

---

### ❌ "Invalid meeting URL"

**Check your URL format:**
```env
# ✅ Correct
MEETING_URL=https://meet.google.com/abc-defg-hij

# ❌ Wrong
MEETING_URL=meet.google.com/abc-defg-hij  # Missing https://
MEETING_URL=https://meet.google.com/      # Missing meeting code
```

---

### ❌ Browser closes immediately

**Causes:**
1. Backend not running
2. WebSocket connection failed
3. Meeting join failed

**Solutions:**
```powershell
# 1. Start backend FIRST
uvicorn backend.main:app --reload

# 2. Wait for it to fully start (you'll see "Application startup complete")

# 3. THEN start bot
cd bot_engine
node bot_engine.js
```

---

### ❌ No audio captured

**Check:**
1. Backend WebSocket is connected (you'll see "✅ WebSocket connected")
2. Meeting has audio (unmute yourself or others)
3. Bot hasn't been kicked from meeting

**Test WebSocket:**
```powershell
# Check if backend is running
curl http://localhost:8000/docs
```

---

### 💡 Pro Tips

1. **First Run:** Use `HEADLESS=false` to see what's happening
2. **Slow Internet:** Increase wait times in the code
3. **Security:** Create a dedicated Gmail for the bot
4. **Debugging:** Check browser console for errors
5. **Meeting Host:** Some meetings require host approval to join

---

## Debug Mode

Want to see everything that's happening?

1. Edit `bot_engine/.env`:
   ```env
   HEADLESS=false
   ```

2. Run the bot and watch the browser

3. You'll see:
   - Login process
   - Meeting join
   - Button clicks
   - Any errors on the page

---

## Still Having Issues?

Check in this order:

- [ ] `.env` file has real credentials (not placeholders)
- [ ] Backend is running (`http://localhost:8000/docs` opens)
- [ ] Meeting URL is valid and active
- [ ] Gmail account can be used for automation
- [ ] Internet connection is stable
- [ ] Node modules installed (`npm install`)

If all else fails, try the manual join feature - when prompted, just click "Join" yourself!
