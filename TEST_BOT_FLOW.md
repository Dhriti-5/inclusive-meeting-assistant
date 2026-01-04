# Complete Bot Flow Test

## Changes Made

### 1. Bot Engine (auth_bot.js)
- ✅ Added `form-data` and `axios` dependencies (npm installed)
- ✅ Bot now accepts 3 command-line arguments: `<meet_link> <meeting_id> <backend_url>`
- ✅ After recording completes, bot uploads audio to backend
- ✅ Upload endpoint: `POST ${BACKEND_URL}/api/meetings/${MEETING_ID}/upload-audio`
- ✅ FormData contains: `audio` (file stream), `lang` (en)

### 2. Backend (ora_bot_manager.py)
- ✅ Updated `start_bot()` to pass `meeting_id` and `backend_url` to bot
- ✅ Command: `node auth_bot.js <meet_link> <meeting_id> <backend_url>`

## Test Steps

### 1. Verify Services Running
```powershell
# Backend should be on port 8000
# Frontend should be on port 3000
Get-Process | Where-Object { $_.ProcessName -like '*python*' -or $_.ProcessName -like '*node*' }
```

### 2. Test Complete Workflow

1. **Open Frontend**: http://localhost:3000
2. **Login** with: ora.meeting.ai@gmail.com / Ora@2025
3. **Go to Inbox Tab** (should see 1 meeting invite)
4. **Click "Join Meeting"** button
5. **Bot Should**:
   - Open Puppeteer browser (visible)
   - Navigate to Google Meet
   - Get admitted by host
   - Start recording audio
   - When meeting ends, upload audio to backend
6. **Backend Should**:
   - Receive audio file
   - Run Whisper transcription
   - Generate summary with NLP
   - Extract action items
   - Save to MongoDB
   - Update meeting status to "completed"
7. **Frontend Should**:
   - Show completed meeting in "Past Meetings" tab
   - Allow clicking meeting to view details
   - Show summary, transcript, action items
   - Provide PDF download button

## Expected Console Output (Bot)

```
🤖 Ora AI Waking Up...
🍪 Found valid cookies file
🌐 Navigating to: https://meet.google.com/...
🎥 Looking for pre-join controls...
🚪 Looking for join button...
⏳ Waiting for host to admit bot...
✅ Ora is INSIDE the meeting!
🎙️ Starting audio capture...
🔴 Recording Started...
📁 Saving to: temp_recordings/meeting_1234567890.webm
📞 Meeting ended or bot was removed
💾 Audio Saved Successfully
📤 Uploading audio to backend for processing...
✅ Audio uploaded successfully!
📊 Backend processing meeting...
👋 Ora shutting down...
```

## Expected Backend Logs

```
INFO: Bot started for meeting: <meeting_id>
INFO: Received audio upload for meeting: <meeting_id>
INFO: Running transcription pipeline...
INFO: Transcription complete
INFO: Generating summary...
INFO: Summary complete
INFO: Extracting action items...
INFO: Meeting processing complete
INFO: Updated meeting status to 'completed'
```

## Debugging Checklist

If bot doesn't upload:
- [ ] Check bot console for "📤 Uploading audio to backend"
- [ ] Verify `MEETING_ID` is not null in bot logs
- [ ] Check backend logs for upload endpoint hits
- [ ] Verify file path exists: `bot_engine/temp_recordings/meeting_*.webm`

If backend doesn't process:
- [ ] Check MongoDB connection
- [ ] Verify Whisper model is loaded
- [ ] Check backend error logs for pipeline errors
- [ ] Verify meeting record exists in database

If no summary appears:
- [ ] Check "Past Meetings" tab in frontend
- [ ] Verify meeting status is "completed" in MongoDB
- [ ] Check if meeting document has transcript/summary fields
- [ ] Refresh frontend page

## Database Check

```python
# Connect to MongoDB and check meeting record
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def check_meeting():
    client = AsyncIOMotorClient("mongodb://127.0.0.1:27017")
    db = client.ora_meetings
    meeting = await db.meetings.find_one({"_id": "<meeting_id>"})
    print("Status:", meeting.get("status"))
    print("Has transcript:", bool(meeting.get("transcript")))
    print("Has summary:", bool(meeting.get("summary")))
    print("Has action items:", bool(meeting.get("action_items")))

asyncio.run(check_meeting())
```

## Next Steps After Successful Test

1. ✅ Verify bot joins and records
2. ✅ Verify audio upload works
3. ✅ Verify backend processing completes
4. ✅ Verify frontend shows completed meeting
5. Test PDF generation
6. Test email sending
7. Add error handling for edge cases
8. Deploy to production

## Known Issues & Solutions

### Issue: "⚠️ No meeting ID provided"
**Solution**: Backend ora_bot_manager must pass meeting_id as 3rd argument

### Issue: "❌ Failed to upload audio: ECONNREFUSED"
**Solution**: Verify backend is running on port 8000, check firewall

### Issue: Bot records but no processing
**Solution**: Check backend /upload-audio endpoint, verify audio file is valid

### Issue: Frontend shows 0 past meetings
**Solution**: Meeting status must be "completed" and have processed_at timestamp
