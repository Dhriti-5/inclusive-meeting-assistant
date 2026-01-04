"""
Database Schema Documentation for Inclusive Meeting Assistant
MongoDB Collections and Field Definitions
"""

# ============================================
# COLLECTION: users
# ============================================
"""
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "password_hash": "bcrypt_hash_here",
  "name": "John Doe",
  "created_at": ISODate("2025-12-31T10:00:00Z")
}
"""

# ============================================
# COLLECTION: meetings
# ============================================
"""
{
  "_id": "abc123def",  // String UUID (8 chars)
  "user_id": "ObjectId('...')",  // Reference to users collection
  
  // Meeting Metadata
  "title": "Weekly Team Sync",
  "participant_name": "John Doe",  // Legacy field
  "status": "completed",  // waiting | processing | completed | failed
  
  // Timestamps
  "created_at": ISODate("2025-12-31T10:00:00Z"),
  "started_at": ISODate("2025-12-31T10:05:00Z"),
  "ended_at": ISODate("2025-12-31T11:00:00Z"),
  
  // Duration and Analytics
  "duration_seconds": 3300.5,  // Total meeting duration
  "speaker_stats": {
    "SPEAKER_01": 1200.5,  // Seconds each speaker talked
    "SPEAKER_02": 980.3,
    "SPEAKER_03": 1120.7
  },
  
  // Transcript Data (Critical for RAG)
  "transcript": [
    {
      "speaker": "SPEAKER_01",
      "text": "Let's start the meeting by reviewing last week's action items.",
      "start": 5.2,  // Start time in seconds
      "end": 8.7,    // End time in seconds
      "timestamp": 5.2  // Deprecated, kept for backward compatibility
    },
    {
      "speaker": "SPEAKER_02",
      "text": "I completed the database migration task.",
      "start": 9.1,
      "end": 12.3,
      "timestamp": 9.1
    }
    // ... more segments
  ],
  
  // AI Generated Outputs
  "summary": "The team discussed quarterly goals and reviewed progress on the new feature launch. Key decisions were made regarding the deployment timeline.",
  
  "action_items": [
    {
      "task": "Complete authentication module testing",
      "assignee": "Alex",
      "status": "pending",  // pending | completed | cancelled
      "created_at": ISODate("2025-12-31T11:00:00Z")
    },
    {
      "task": "Update API documentation",
      "assignee": "Sarah",
      "status": "pending",
      "created_at": ISODate("2025-12-31T11:00:00Z")
    }
  ],
  
  // RAG and Media
  "rag_indexed": true,  // Whether meeting is indexed in ChromaDB for chat
  "audio_url": "/recordings/abc123def.wav"  // Path to audio file (if available)
}
"""

# ============================================
# COLLECTION: ChromaDB (Vector Store)
# ============================================
"""
Collection Name: meeting_{meeting_id}

Each chunk stored with:
- embedding: [384-dim vector from all-MiniLM-L6-v2]
- document: "text content of the chunk"
- metadata: {
    "chunk_id": 0,
    "speakers": "SPEAKER_01,SPEAKER_02",
    "start_time": 45.2,
    "end_time": 95.6,
    "meeting_id": "abc123def"
  }
"""

# ============================================
# INDEXES (Recommended for Performance)
# ============================================
"""
db.meetings.createIndex({ "user_id": 1, "created_at": -1 })
db.meetings.createIndex({ "status": 1 })
db.meetings.createIndex({ "_id": 1, "user_id": 1 })
db.users.createIndex({ "email": 1 }, { unique: true })
"""

# ============================================
# FIELD TYPE REFERENCE
# ============================================
"""
status: Enum ["waiting", "processing", "completed", "failed"]
  - waiting: Meeting created but not started
  - processing: Real-time transcription or post-meeting analysis in progress
  - completed: Analysis finished successfully
  - failed: Error during processing

action_item.status: Enum ["pending", "completed", "cancelled"]

speaker_stats: Dictionary mapping speaker IDs to speaking time in seconds
  - Used for analytics charts
  - Calculated during post-meeting analysis

transcript.start/end: Float (seconds from meeting start)
  - Required for audio timeline synchronization
  - Used for clickable transcript segments
"""
