# **Inclusive Meeting Assistant** 🤖

Your personal AI-powered meeting assistant that automatically attends Google Meet sessions on your behalf. **Ora**, your intelligent bot, joins meetings from its dedicated email, records conversations, and provides comprehensive post-meeting intelligence with transcripts, summaries, and action items.

**🌟 Key Features:**
- 🤖 **Ora AI Bot** - Dedicated meeting assistant with its own email identity
- 📧 **Email-Based Workflow** - Invite Ora to meetings, it joins from its inbox
- 🎤 **Automatic Recording** - Start recording from frontend, Ora listens and captures everything
- 📝 **Post-Meeting Intelligence** - Automatic transcription, summarization, and action items
- 📊 **Meeting History** - View all your meetings with titles, transcripts, and summaries
- 📤 **Easy Sharing** - Download transcripts or email summaries to anyone
- 🔒 **Personal & Secure** - Your private meeting assistant for personal use

---

## **✨ How It Works**

### **The Ora Workflow**

Ora is your personal meeting assistant bot with its own email identity. Here's how the workflow operates:

1. **📧 Add Ora to Your Meetings**
   - Create a Google Meet and add participants
   - Include **Ora's email address** (e.g., `ora@yourdomain.com`) as a participant
   - Ora receives the meeting invitation in its Gmail inbox

2. **📨 Ora Receives Invitation**
   - Meeting invitation appears in Ora's inbox
   - Contains Google Meet link and meeting details
   - Ready to join when you give the command

3. **🎯 Start Recording from Frontend**
   - Login to the frontend using **Ora's credentials**
   - Navigate to the **"Inbox" tab** in the dashboard
   - See all meeting invitations Ora received
   - Click **"Start Recording"** on any meeting
   - Click **"Open in Gmail"** to manually join the meeting on Ora's behalf

4. **🎤 Ora Joins & Records**
   - Ora enters the Google Meet using the link from its inbox
   - Starts listening and recording audio automatically
   - Captures entire meeting conversation

5. **🔄 Post-Meeting Intelligence**
   - After meeting ends, recording is **automatically sent to backend**
   - Backend processes the audio:
     - 🗣️ **Transcribes** using OpenAI Whisper
     - 🧑‍🤝‍🧑 **Identifies speakers** using Pyannote diarization
     - 📝 **Generates summary** using DistilBART
     - ✅ **Extracts action items** using FLAN-T5

6. **📊 View Meeting History**
   - Login using **Ora's credentials** in the frontend
   - Navigate to **"History" tab** in dashboard
   - See all completed meetings with:
     - 📌 **Meeting title** (user can customize)
     - 📄 **Full transcript** with speaker attribution
     - 📋 **Summary** and key points
     - ✅ **Action items** extracted
   - **Download** transcript as PDF
   - **Email** summary to anyone with attachment

---

## **🚀 Core Features**

### **1. 🤖 Ora - Your Meeting Bot**
- Dedicated email identity for attending meetings
- Automatically joins Google Meet from inbox invitations
- Persistent presence throughout the meeting
- Graceful disconnection after meeting ends

### **2. 📧 Email Inbox Integration**
- Monitors Ora's Gmail inbox for meeting invitations
- Extracts Google Meet links automatically
- Displays upcoming meetings in frontend dashboard
- One-click joining from inbox interface

### **3. 🎤 Smart Audio Recording**
- Browser-based audio capture using Puppeteer
- High-quality audio recording during meetings
- Automatic upload to backend after meeting
- Handles long meetings (30+ minutes)

### **4. 🗣️ Transcription with Speaker Identification**
- **OpenAI Whisper** for high-accuracy transcription
- **Pyannote.audio** for speaker diarization
- Speaker-attributed transcript (SPEAKER_00, SPEAKER_01, etc.)
- Timestamps for every spoken segment
- Multi-language support

### **5. 📝 Intelligent Post-Meeting Analysis**
- **Automatic Summarization** using HuggingFace DistilBART
- **Action Item Extraction** using Google FLAN-T5
- **Key Decisions** highlighting
- **Speaker Analytics** (who spoke when and for how long)

### **6. 📊 Meeting History Dashboard**
- Complete meeting archive in one place
- Searchable and filterable meeting list
- Quick access to transcripts and summaries
- Meeting title management (rename meetings)
- Date and participant information

### **7. 📤 Export & Share Capabilities**
- **PDF Generation** with professional formatting
- **Email Delivery** with summary attachments
- **Download Transcripts** as text files
- **Copy to Clipboard** functionality

### **8. 🔐 Secure Authentication**
- JWT-based authentication using Ora's credentials
- MongoDB for secure data storage
- Protected API endpoints
- Personal workspace isolation


---

## **🏗 Technology Stack**

**Frontend:**
- React 18 with Vite
- Tailwind CSS for modern UI
- React Router for navigation
- WebSocket client for real-time updates
- Axios for API requests

**Backend:**
- FastAPI (Python web framework)
- Motor (MongoDB async driver)
- PyJWT for authentication
- Uvicorn ASGI server
- WebSocket support

**Bot Engine:**
- Node.js with Puppeteer
- Browser automation for Google Meet
- Audio capture with puppeteer-stream
- WebSocket client for streaming

**AI/ML Models:**
- OpenAI Whisper (speech-to-text)
- Pyannote.audio (speaker diarization)
- DistilBART (text summarization)
- FLAN-T5 (action item extraction)
- MarianMT (translation - optional)

**Database:**
- MongoDB with async operations
- Collections: users, meetings, transcripts

**Email Integration:**
- Gmail IMAP for inbox monitoring
- Email parsing for meeting invitations
- Google Meet link extraction

---

## **⚙️ Installation & Setup**

### **Prerequisites**
- Python 3.10 or higher
- Node.js 18 or higher
- MongoDB 7.0 or higher
- Google Account for Ora (the bot)
- Gmail App Password enabled

### **1. Clone Repository**
```bash
git clone <your-repo-url>
cd inclusive-meeting-assistant
```

### **2. Backend Setup**

#### **Create Virtual Environment**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### **Install Dependencies**
```bash
pip install -r requirements.txt
```

#### **Configure Environment**
Create a `.env` file in the project root:
```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=inclusive_meeting_assistant

# JWT Authentication
SECRET_KEY=your-super-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Ora's Email Credentials (Gmail)
ORA_EMAIL=ora@yourdomain.com
ORA_EMAIL_PASSWORD=your-gmail-app-password

# HuggingFace Token (for speaker diarization)
HUGGINGFACE_TOKEN=hf_your_token_here

# Backend URL (for bot communication)
BACKEND_URL=http://localhost:8000

# Email Configuration (for sending reports)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password
```

**Important Setup Steps:**

1. **Create Gmail Account for Ora:**
   - Create a new Google account (e.g., `ora.assistant@gmail.com`)
   - This will be Ora's identity

2. **Enable Gmail App Password:**
   - Go to Google Account Settings
   - Security → 2-Step Verification (enable it)
   - App Passwords → Generate new app password
   - Copy the 16-character password
   - Use this as `ORA_EMAIL_PASSWORD` in `.env`

3. **Get HuggingFace Token:**
   - Visit https://huggingface.co/settings/tokens
   - Create a free account and generate a token
   - Use this as `HUGGINGFACE_TOKEN` in `.env`

### **3. Frontend Setup**

```bash
cd frontend
npm install
```

Update API URL in `frontend/src/components/MeetingInbox.jsx` and `frontend/src/services/api.js` if needed (default is `http://localhost:8000`).

### **4. Bot Engine Setup**

```bash
cd bot_engine
npm install
```

Create `bot_engine/.env`:
```env
BACKEND_URL=http://localhost:8000
```

### **5. Start MongoDB**

```bash
# Windows (as service)
net start MongoDB

# Or manually
mongod --dbpath C:\data\db

# Linux/Mac
sudo systemctl start mongod
```

### **6. Create Ora User in Database**

After starting the backend, you need to register Ora as a user:

1. Start the backend (see next section)
2. Go to http://localhost:3000/register
3. Register with:
   - **Email:** Same as `ORA_EMAIL` in `.env`
   - **Full Name:** Ora AI Assistant
   - **Password:** Create a secure password
4. Remember these credentials for frontend login

---

## **🚀 Running the Application**

### **Start All Services**

#### **Terminal 1 - Backend**
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Expected output:
```
✅ Connected to MongoDB
✅ Diarization pipeline preloaded
INFO: Uvicorn running on http://0.0.0.0:8000
```

#### **Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE ready in 1234 ms
➜  Local:   http://localhost:3000/
```

### **Access Points**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main web application |
| **Backend API** | http://localhost:8000 | REST API endpoints |
| **API Docs** | http://localhost:8000/docs | Interactive Swagger documentation |

---

## **📖 Complete Usage Guide**

### **Step 1: Initial Setup (One-Time)**

1. **Register Ora Account**
   - Go to http://localhost:3000/register
   - Use Ora's email address (from `.env`)
   - Set a password
   - This creates Ora's account in the system

### **Step 2: Schedule a Meeting**

1. **Create Google Meet:**
   - Go to Google Calendar or Google Meet
   - Create a new meeting
   - Set date, time, and title

2. **Invite Ora:**
   - Add participants as usual
   - **Important:** Add Ora's email (e.g., `ora.assistant@gmail.com`)
   - Ora will receive the invitation

### **Step 3: Start Recording**

1. **Login to Frontend:**
   - Go to http://localhost:3000/login
   - Use **Ora's credentials** (email and password)
   - Login to access Ora's dashboard

2. **Check Inbox Tab:**
   - Click on **"Inbox"** tab in the dashboard
   - You'll see all meeting invitations Ora received
   - Each invitation shows:
     - Meeting subject/title
     - Sender information
     - Date and time
     - Google Meet link

3. **Start Recording:**
   - Find the meeting you want to attend
   - Click **"Start Recording"** button
   - System prepares Ora to join

4. **Join Meeting:**
   - Click **"Open in Gmail"** button
   - This opens Ora's Gmail in a new tab
   - Click the **"Join call"** button in the email
   - Ora joins the Google Meet
   - Audio recording starts automatically

### **Step 4: During the Meeting**

- Ora stays in the meeting as a participant
- Audio is captured in the background
- No action needed from you during the meeting
- Ora will stay until the meeting ends

### **Step 5: After the Meeting**

- Recording automatically uploads to backend
- Backend processes the audio:
  - ⏳ **Transcription** (may take a few minutes)
  - 🗣️ **Speaker identification**
  - 📝 **Summary generation**
  - ✅ **Action item extraction**

### **Step 6: View Results**

1. **Go to History Tab:**
   - Still logged in as Ora
   - Click **"History"** tab in dashboard
   - See list of all completed meetings

2. **View Meeting Details:**
   - Click on any meeting card
   - See comprehensive meeting report:
     - **Meeting Title** (editable if needed)
     - **Full Transcript** with speaker labels
     - **Summary** of key points
     - **Action Items** extracted
     - **Date and Duration**
     - **Participants** (if available)

3. **Export Options:**
   - **Download PDF:** Click download button for complete report
   - **Email Summary:** Enter recipient email, click send
   - **Copy Transcript:** Copy text to clipboard

---

## **🎯 Key Features Explained**

### **Meeting Title Management**
- Default title comes from email subject
- You can edit/rename meeting titles in the History tab
- Helps organize your meeting archive

### **Speaker Identification**
- Speakers labeled as SPEAKER_00, SPEAKER_01, etc.
- System detects when speakers change
- Each segment shows who spoke and when
- Useful for multi-participant meetings

### **Action Items**
- AI automatically detects tasks and decisions
- Extracts "to-do" items from conversation
- Shows assignees if mentioned
- Helps with follow-ups

### **Email Inbox Monitoring**
- Backend periodically checks Ora's Gmail
- Automatically fetches new meeting invitations
- Click "Refresh" in Inbox tab to check manually
- Only shows unread/upcoming meetings

---

## **� Troubleshooting**

### **MongoDB Connection Error**
```bash
# Check if MongoDB is running
mongosh

# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### **Port Already in Use**
```powershell
# Windows: Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### **HuggingFace Token Error**
- Get a free token from https://huggingface.co/settings/tokens
- Add to `.env` file: `HUGGINGFACE_TOKEN=hf_your_token`
- Required for speaker diarization feature

### **Audio File Not Processing**
- Ensure file is in supported format (WAV, MP3, M4A)
- Check file size (recommended < 500MB)
- Verify audio quality (clear speech, minimal noise)

---

## **🗺 Roadmap**

**Coming Soon:**
- 🤖 Auto-join from inbox
- 📊 Advanced analytics  
- 🔍 Search across meetings
- 🌍 Multi-language transcription
- 📅 Calendar integration
- 📱 Mobile app

---

## **🤝 Contributing**

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## **📄 License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

## **🙏 Acknowledgments**

**Powered by:**
- [OpenAI Whisper](https://github.com/openai/whisper) - Speech recognition
- [Pyannote.audio](https://github.com/pyannote/pyannote-audio) - Speaker diarization
- [HuggingFace Transformers](https://huggingface.co/) - NLP models
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [React](https://react.dev/) - Frontend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Puppeteer](https://pptr.dev/) - Browser automation

---

**Built with ❤️ for seamless meeting management**

*Last Updated: January 2026 | Version 2.0.0*
