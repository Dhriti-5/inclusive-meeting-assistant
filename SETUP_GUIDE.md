# 🎯 Ora Setup Guide - Get Started in 10 Minutes

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] MongoDB installed and running
- [ ] Gmail account for Ora
- [ ] Google Chrome browser

## Step-by-Step Setup

### 1. Install MongoDB (if not already installed)

**Windows:**
```powershell
# Download from: https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb

# Start MongoDB
mongod --dbpath C:\data\db
```

**Verify MongoDB is running:**
```powershell
mongo --version
```

### 2. Clone and Setup Project

```powershell
cd "C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant"
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=ora_meetings

# JWT Secret (generate a random string)
SECRET_KEY=your-super-secret-random-key-here

# Ora's Email Configuration
ORA_EMAIL=ora.assistant@gmail.com
ORA_EMAIL_PASSWORD=your-google-app-password-here

# Email Sending Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=ora.assistant@gmail.com
SMTP_PASSWORD=your-google-app-password-here

# Optional: For speaker diarization
HUGGINGFACE_TOKEN=your-huggingface-token
```

### 4. Get Google App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Select **Mail** and **Windows Computer**
5. Click **Generate**
6. Copy the 16-character password
7. Paste it in `.env` as `ORA_EMAIL_PASSWORD` and `SMTP_PASSWORD`

### 5. Install Python Dependencies

```powershell
# Install required packages
pip install -r requirements.txt

# This will install:
# - fastapi
# - uvicorn
# - pymongo
# - motor (async MongoDB)
# - python-jose[cryptography] (JWT)
# - passlib[bcrypt] (password hashing)
# - python-multipart
# - whisper
# - transformers
# - torch
# - And more...
```

### 6. Install Node.js Dependencies

```powershell
# Frontend
cd frontend
npm install

# Bot Engine
cd ..\bot_engine
npm install
```

### 7. Setup Google Meet Bot (Important!)

To allow Ora to join meetings, you need to export your Google account cookies:

**Option A: Using Browser Extension**
1. Install "EditThisCookie" extension for Chrome
2. Login to Google Meet (https://meet.google.com)
3. Click the extension icon
4. Click "Export" → Copy all cookies
5. Save as `bot_engine/ora_cookies.json`

**Option B: Manual Export**
1. Open Chrome DevTools (F12)
2. Go to Application → Cookies → https://meet.google.com
3. Copy all cookies manually
4. Format as JSON and save to `bot_engine/ora_cookies.json`

Example format:
```json
[
  {
    "name": "SID",
    "value": "your-sid-value",
    "domain": ".google.com",
    ...
  }
]
```

### 8. Enable Gmail IMAP

For Ora to read meeting invites:

1. Go to Gmail settings
2. Click **Forwarding and POP/IMAP**
3. Enable **IMAP access**
4. Save changes

### 9. Start the Application

**Option 1: Use the startup script**
```powershell
.\START_ORA.ps1
```

**Option 2: Start manually**

Terminal 1 - Backend:
```powershell
cd backend
python main.py
```

Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```

### 10. Access the Application

1. Open browser: `http://localhost:5173`
2. Click **Register** to create an account
3. Login with your credentials
4. You're ready to use Ora! 🎉

## 🎯 How to Use

### Adding Ora to Meetings

1. When creating a Google Meet, add **Ora's email** (from `.env`) as a guest
2. Ora will receive the invitation in its inbox
3. Go to Ora dashboard → **Inbox** tab
4. You'll see the meeting invite
5. Click **Join Call** button
6. Ora bot will automatically join the meeting

### After the Meeting

1. Go to **Past Meetings** tab
2. Click on any meeting to view details
3. See:
   - AI-generated summary
   - Full transcript
   - Action items
4. **Download PDF** or **Send via Email**

## 🐛 Common Issues

### Issue: MongoDB connection failed

**Solution:**
- Ensure MongoDB is running: `mongod --dbpath C:\data\db`
- Check if port 27017 is available

### Issue: Bot won't join meetings

**Solution:**
- Verify `ora_cookies.json` exists in `bot_engine/` folder
- Ensure cookies are from a logged-in Google account
- Try re-exporting cookies (they expire after ~2 weeks)
- Check that Node.js dependencies are installed

### Issue: Email inbox not loading

**Solution:**
- Verify IMAP is enabled in Gmail
- Check `ORA_EMAIL` and `ORA_EMAIL_PASSWORD` in `.env`
- Ensure you're using Google App Password, not regular password
- Check firewall settings

### Issue: Frontend won't start

**Solution:**
```powershell
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Issue: Backend errors

**Solution:**
- Check all environment variables in `.env`
- Ensure MongoDB is running
- Verify Python packages are installed: `pip list`

## 🎓 Testing the System

### Test 1: Authentication
1. Register a new account
2. Logout and login again
3. Verify token persistence

### Test 2: Email Integration
1. Send a test email with a Google Meet link to Ora's email
2. Check Inbox tab - invite should appear
3. Mark as read functionality

### Test 3: Bot (requires real meeting)
1. Create a test Google Meet
2. Add Ora's email as participant
3. Join from Ora's inbox
4. Verify bot joins successfully

### Test 4: Post-meeting workflow
1. After meeting ends, check Past Meetings
2. Verify transcript is generated
3. Download PDF
4. Send test email

## 📚 Next Steps

- Customize the UI theme in `frontend/tailwind.config.js`
- Add more AI features (sentiment analysis, topic modeling)
- Deploy to production (Azure, AWS, or GCP)
- Set up automatic cookie refresh
- Add Slack/Teams integration

## 💡 Pro Tips

1. **Keep cookies fresh:** Re-export Google cookies every 1-2 weeks
2. **Test with short meetings first:** Start with 5-minute test calls
3. **Check logs:** Backend logs show detailed error messages
4. **Use dark mode:** Toggle theme in the UI navbar
5. **Backup database:** Regularly export MongoDB data

## 🚀 Production Deployment

For production use:

1. Use environment-specific `.env` files
2. Set up HTTPS with SSL certificates
3. Use MongoDB Atlas for database
4. Deploy backend to Azure/AWS
5. Deploy frontend to Vercel/Netlify
6. Set up monitoring (Sentry, LogRocket)
7. Implement rate limiting
8. Add Redis for caching

## 📞 Need Help?

- Check existing documentation in `/docs`
- Review code comments
- Test with minimal setup first
- Enable verbose logging in backend

---

**You're all set! 🎉 Enjoy using Ora to boost your meeting productivity!**
