"""
WebSocket Connection Manager for real-time meeting updates.
Handles WebSocket connections, broadcasting, and connection lifecycle.
"""
from typing import Dict, List, Set
from fastapi import WebSocket
import asyncio
import json
from datetime import datetime

class ConnectionManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        # Store active connections by meeting_id
        # meeting_id -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}
        
        # Store user email for each connection
        # WebSocket -> user_email
        self.connection_users: Dict[WebSocket, str] = {}
        
        # Lock for thread-safe operations
        self._lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket, meeting_id: str, user_email: str):
        """
        Accept a new WebSocket connection and add it to the meeting room.
        
        Args:
            websocket: The WebSocket connection
            meeting_id: The meeting ID to join
            user_email: The authenticated user's email
        """
        await websocket.accept()
        
        async with self._lock:
            if meeting_id not in self.active_connections:
                self.active_connections[meeting_id] = []
            
            self.active_connections[meeting_id].append(websocket)
            self.connection_users[websocket] = user_email
        
        print(f"✅ WebSocket connected: {user_email} joined meeting {meeting_id}")
        print(f"   Total connections for meeting: {len(self.active_connections[meeting_id])}")
    
    async def disconnect(self, websocket: WebSocket, meeting_id: str):
        """
        Remove a WebSocket connection from the meeting room.
        
        Args:
            websocket: The WebSocket connection to remove
            meeting_id: The meeting ID
        """
        async with self._lock:
            if meeting_id in self.active_connections:
                if websocket in self.active_connections[meeting_id]:
                    self.active_connections[meeting_id].remove(websocket)
                    user_email = self.connection_users.pop(websocket, "Unknown")
                    
                    # Clean up empty meeting rooms
                    if not self.active_connections[meeting_id]:
                        del self.active_connections[meeting_id]
                    
                    print(f"❌ WebSocket disconnected: {user_email} left meeting {meeting_id}")
    
    async def broadcast_to_meeting(self, meeting_id: str, message: dict):
        """
        Broadcast a message to all connections in a specific meeting.
        
        Args:
            meeting_id: The meeting ID
            message: The message dictionary to send (will be JSON serialized)
        """
        if meeting_id not in self.active_connections:
            return
        
        # Create a copy of the connection list to avoid modification during iteration
        connections = self.active_connections[meeting_id].copy()
        
        disconnected = []
        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"⚠️  Error sending to connection: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            await self.disconnect(connection, meeting_id)
    
    async def send_personal_message(self, websocket: WebSocket, message: dict):
        """
        Send a message to a specific WebSocket connection.
        
        Args:
            websocket: The WebSocket connection
            message: The message dictionary to send
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"⚠️  Error sending personal message: {e}")
    
    def get_meeting_connection_count(self, meeting_id: str) -> int:
        """Get the number of active connections for a meeting"""
        return len(self.active_connections.get(meeting_id, []))
    
    def get_total_connections(self) -> int:
        """Get the total number of active connections across all meetings"""
        return sum(len(connections) for connections in self.active_connections.values())
    
    async def send_status_update(self, meeting_id: str, status: str, details: dict = None):
        """
        Send a status update to all connections in a meeting.
        
        Args:
            meeting_id: The meeting ID
            status: Status type (e.g., "processing", "completed", "error")
            details: Additional details to include
        """
        message = {
            "type": "status",
            "status": status,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details or {}
        }
        await self.broadcast_to_meeting(meeting_id, message)
    
    async def send_transcript_segment(self, meeting_id: str, segment: dict):
        """
        Send a new transcript segment to all connections in a meeting.
        
        Args:
            meeting_id: The meeting ID
            segment: The transcript segment (speaker, text, timestamp)
        """
        message = {
            "type": "transcript",
            "segment": segment,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_meeting(meeting_id, message)
    
    async def send_summary(self, meeting_id: str, summary: str, action_items: List[str] = None):
        """
        Send the meeting summary and action items.
        
        Args:
            meeting_id: The meeting ID
            summary: The summary text
            action_items: List of action items
        """
        message = {
            "type": "summary",
            "summary": summary,
            "action_items": action_items or [],
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_meeting(meeting_id, message)
    
    async def send_error(self, meeting_id: str, error: str):
        """
        Send an error message to all connections in a meeting.
        
        Args:
            meeting_id: The meeting ID
            error: The error message
        """
        message = {
            "type": "error",
            "error": error,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_meeting(meeting_id, message)

# Global connection manager instance
manager = ConnectionManager()
