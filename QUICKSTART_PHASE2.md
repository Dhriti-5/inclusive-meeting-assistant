# Quick Start Guide - Phase 2: Auth & MongoDB

## Prerequisites

1. **Install MongoDB**

   **Windows:**
   ```powershell
   # Option 1: Download installer from https://www.mongodb.com/try/download/community
   
   # Option 2: Using Chocolatey
   choco install mongodb
   
   # Create data directory
   mkdir C:\data\db
   
   # Start MongoDB
   mongod --dbpath="C:\data\db"
   ```

   **macOS:**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

   **Linux:**
   ```bash
   sudo apt-get update
   sudo apt-get install mongodb
   sudo systemctl start mongodb
   ```

2. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## Setup Steps

### Step 1: Configure Environment

Update [.env](.env) with your settings:
```env
# MongoDB Configuration
MONGODB_URL="mongodb://localhost:27017"
DATABASE_NAME="inclusive_meeting_assistant"

# JWT Configuration (generate with: openssl rand -hex 32)
JWT_SECRET_KEY="your-super-secret-jwt-key-change-this-in-production"
```

### Step 2: Start MongoDB

**Windows:**
```powershell
# In a new terminal
mongod --dbpath="C:\data\db"
```

**macOS/Linux:**
```bash
# MongoDB should be running as a service
brew services start mongodb-community  # macOS
sudo systemctl start mongodb          # Linux
```

### Step 3: Start Backend Server

```bash
cd "C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
✅ Connected to MongoDB at mongodb://localhost:27017
✅ Application started
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 4: Test the Implementation

In a new terminal:
```bash
python test_phase2_auth_mongodb.py
```

Expected output:
```
============================================================
  PHASE 2: Authentication & MongoDB Integration Test
============================================================

✅ User registered successfully!
✅ Login successful!
✅ Successfully retrieved user info!
✅ Meeting created successfully!
✅ Retrieved meeting status!
✅ Retrieved meeting history!
✅ Unauthorized access correctly blocked!

🎉 Phase 2 Implementation Complete!
```

## Quick API Examples

### 1. Register a User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student@college.edu","password":"mypassword","name":"Student Name"}'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -d "username=student@college.edu&password=mypassword"
```

Save the `access_token` from the response.

### 3. Create a Meeting

```bash
curl -X POST http://localhost:8000/api/meetings/join \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"Project Discussion"}'
```

### 4. Get Meeting History

```bash
curl http://localhost:8000/api/meetings/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## MongoDB Management

### Access MongoDB Shell

```bash
mongosh
```

### Useful Commands

```javascript
// Switch to your database
use inclusive_meeting_assistant

// View all collections
show collections

// View users
db.users.find().pretty()

// View meetings
db.meetings.find().pretty()

// Count documents
db.users.countDocuments()
db.meetings.countDocuments()

// Find specific user's meetings
db.meetings.find({user_id: "USER_ID"}).pretty()

// Delete test data
db.users.deleteOne({email: "test@example.com"})
```

## Troubleshooting

### MongoDB Not Starting

**Error:** `connection refused`

**Solution:**
1. Check if MongoDB is running: `mongosh`
2. On Windows, start manually: `mongod --dbpath="C:\data\db"`
3. Check port 27017 is not in use

### Backend Won't Start

**Error:** `No module named 'motor'`

**Solution:**
```bash
pip install motor python-jose[cryptography] passlib[bcrypt] python-multipart
```

### Authentication Fails

**Error:** `Could not validate credentials`

**Solution:**
1. Check token is included: `Authorization: Bearer <token>`
2. Token may have expired (24h limit)
3. Verify JWT_SECRET_KEY in .env

### Can't Create Meetings

**Error:** `401 Unauthorized`

**Solution:**
1. You must login first to get a token
2. Include token in Authorization header
3. Use OAuth2 format: `Bearer <token>`

## What's Different from Phase 1?

### Before (Phase 1):
- ❌ No user accounts
- ❌ Data lost on server restart
- ❌ Anyone could access any meeting
- ❌ No authentication

### After (Phase 2):
- ✅ User registration and login
- ✅ Data persisted in MongoDB
- ✅ Per-user meeting isolation
- ✅ JWT authentication on all endpoints

## Next Steps

### For Backend Development:
1. Add token refresh mechanism
2. Implement password reset
3. Add user profile management
4. Set up MongoDB indexes for performance

### For Frontend Development:
1. Create login/register pages
2. Add authentication context
3. Store JWT token in localStorage
4. Add token to all API requests
5. Handle token expiration

### For Production:
1. Use production MongoDB (MongoDB Atlas)
2. Enable MongoDB authentication
3. Use HTTPS for all requests
4. Implement rate limiting
5. Add logging and monitoring

## Resources

- **MongoDB Docs:** https://www.mongodb.com/docs/
- **FastAPI Auth:** https://fastapi.tiangolo.com/tutorial/security/
- **JWT Tokens:** https://jwt.io/
- **Phase 2 Full Docs:** [PHASE2_IMPLEMENTATION.md](PHASE2_IMPLEMENTATION.md)

---

**Need Help?** Check [PHASE2_IMPLEMENTATION.md](PHASE2_IMPLEMENTATION.md) for detailed documentation.
