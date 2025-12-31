"""
Bot Audio Processing Module
Handles real-time audio streaming from the meeting bot, processes it through Whisper,
and broadcasts transcription results to connected clients.
"""
import asyncio
import io
import wave
import tempfile
import os
from typing import Optional
from fastapi import WebSocket
import numpy as np

class BotAudioProcessor:
    """Processes audio streams from the meeting bot"""
    
    def __init__(self, meeting_id: str = "temp"):
        self.audio_buffer = bytearray()
        self.sample_rate = 16000
        self.channels = 1
        self.sample_width = 2  # 16-bit audio
        self.chunk_duration_seconds = 5  # Process every 5 seconds
        self.min_chunk_size = self.sample_rate * self.channels * self.sample_width * self.chunk_duration_seconds
        
        # Full audio recording for post-meeting processing
        self.meeting_id = meeting_id
        self.recording_path = f"temp_recordings/{meeting_id}.wav"
        os.makedirs("temp_recordings", exist_ok=True)
        self.wave_file = wave.open(self.recording_path, 'wb')
        self.wave_file.setnchannels(self.channels)
        self.wave_file.setsampwidth(self.sample_width)
        self.wave_file.setframerate(self.sample_rate)

    def add_audio_chunk(self, chunk: bytes):
        """Add audio chunk to buffer and full recording"""
        self.audio_buffer.extend(chunk)
        self.wave_file.writeframes(chunk)
    
    def has_enough_data(self) -> bool:
        """Check if buffer has enough data for processing"""
        return len(self.audio_buffer) >= self.min_chunk_size
    
    def get_audio_chunk(self) -> Optional[bytes]:
        """Extract and return a chunk of audio for processing"""
        if not self.has_enough_data():
            return None
        
        # Extract chunk
        chunk = bytes(self.audio_buffer[:self.min_chunk_size])
        
        # Remove processed data from buffer (keep 50% overlap for better continuity)
        # overlap_size = self.min_chunk_size // 2
        # self.audio_buffer = self.audio_buffer[self.min_chunk_size - overlap_size:]
        
        # For real-time transcription, we might not want overlap if we are just appending text
        # But overlap helps with words cut in half. 
        # Let's stick to no overlap for simplicity in this "Brain Layer 1" implementation
        # as we are just appending text segments.
        self.audio_buffer = bytearray() # Clear buffer after processing to avoid re-processing
        
        return chunk
    
    def clear_buffer(self):
        """Clear the audio buffer"""
        self.audio_buffer.clear()

    def finalize_recording(self):
        """Close the full audio recording file"""
        if self.wave_file:
            self.wave_file.close()
            self.wave_file = None
        return self.recording_path
    
    async def process_with_whisper(self, audio_chunk: bytes):
        """
        Process audio chunk with Whisper model
        Returns transcribed text
        """
        # Optimization: VAD (Voice Activity Detection) to skip silence
        # Simple energy-based VAD
        try:
            audio_array = np.frombuffer(audio_chunk, dtype=np.int16)
            rms = np.sqrt(np.mean(audio_array**2))
            # Threshold can be adjusted. 300-500 is usually a good floor for silence in 16-bit audio
            if rms < 300: 
                return ""
        except Exception as e:
            print(f"⚠️ VAD check failed: {e}")

        try:
            # Import whisper model
            from speech_Module.whisper_loader import get_whisper_model
            
            # Create temporary WAV file for Whisper
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_wav:
                temp_path = temp_wav.name
                
                # Write WAV file
                with wave.open(temp_path, 'wb') as wav_file:
                    wav_file.setnchannels(self.channels)
                    wav_file.setsampwidth(self.sample_width)
                    wav_file.setframerate(self.sample_rate)
                    wav_file.writeframes(audio_chunk)
            
            # Get Whisper model
            model = get_whisper_model()
            
            # Transcribe
            result = model.transcribe(
                temp_path,
                language="en",
                task="transcribe",
                fp16=False
            )
            
            # Clean up temp file
            os.unlink(temp_path)
            
            text = result.get("text", "").strip()
            return text
            
        except Exception as e:
            print(f"❌ Whisper transcription error: {e}")
            return None

class BotConnectionManager:
    """Manages bot WebSocket connections and audio processing"""
    
    def __init__(self):
        self.bot_connections = {}  # meeting_id -> (websocket, processor)
        self.meeting_connections = {}  # meeting_id -> list of client websockets
        
    async def connect_bot(self, websocket: WebSocket, meeting_id: str):
        """Connect a bot to a meeting (websocket already accepted by main endpoint)"""
        processor = BotAudioProcessor(meeting_id=meeting_id)
        self.bot_connections[meeting_id] = (websocket, processor)
        
        print(f"🤖 Bot connected for meeting: {meeting_id}")
        
    async def disconnect_bot(self, meeting_id: str):
        """Disconnect bot from meeting and trigger post-processing"""
        if meeting_id in self.bot_connections:
            _, processor = self.bot_connections[meeting_id]
            
            # Finalize recording
            audio_path = processor.finalize_recording()
            print(f"💾 Meeting audio saved to: {audio_path}")
            
            del self.bot_connections[meeting_id]
            print(f"🤖 Bot disconnected from meeting: {meeting_id}")
            
            # Trigger Post-Meeting Intelligence (Layer 2)
            try:
                from .post_meeting_analysis import analyze_meeting
                # Run in background task
                asyncio.create_task(analyze_meeting(meeting_id, audio_path))
                print(f"🚀 Triggered post-meeting analysis for {meeting_id}")
            except ImportError:
                print("⚠️  Could not import post_meeting_analysis. Is it created?")
            except Exception as e:
                print(f"❌ Failed to trigger analysis: {e}")
    
    async def register_client(self, meeting_id: str, client_ws: WebSocket):
        """Register a client WebSocket to receive bot transcriptions"""
        if meeting_id not in self.meeting_connections:
            self.meeting_connections[meeting_id] = []
        
        self.meeting_connections[meeting_id].append(client_ws)
        print(f"👤 Client registered for bot transcriptions: {meeting_id}")
    
    async def unregister_client(self, meeting_id: str, client_ws: WebSocket):
        """Unregister a client WebSocket"""
        if meeting_id in self.meeting_connections:
            if client_ws in self.meeting_connections[meeting_id]:
                self.meeting_connections[meeting_id].remove(client_ws)
                
            if not self.meeting_connections[meeting_id]:
                del self.meeting_connections[meeting_id]
    
    async def broadcast_transcription(self, meeting_id: str, text: str, speaker: str = "Meeting Bot"):
        """
        Broadcast transcription to all connected clients
        PHASE 3: Now also broadcasts to meeting WebSocket for dashboard integration
        """
        if meeting_id not in self.meeting_connections:
            # Even if no direct connections, try to broadcast via meeting manager
            try:
                from .websocket_manager import manager
                await manager.broadcast_to_meeting(meeting_id, {
                    "type": "transcript_update",
                    "text": text,
                    "speaker": speaker,
                    "source": "meeting_bot"
                })
            except Exception as e:
                print(f"⚠️  Could not broadcast via meeting manager: {e}")
            return
        
        message = {
            "type": "bot_transcription",
            "text": text,
            "source": "meeting_bot",
            "speaker": speaker,
            "timestamp": __import__('datetime').datetime.utcnow().isoformat()
        }
        
        disconnected = []
        for client_ws in self.meeting_connections[meeting_id]:
            try:
                await client_ws.send_json(message)
            except Exception as e:
                print(f"⚠️  Error sending to client: {e}")
                disconnected.append(client_ws)
        
        # Clean up disconnected clients
        for client_ws in disconnected:
            await self.unregister_client(meeting_id, client_ws)
        
        # PHASE 3: Also broadcast via meeting WebSocket manager for dashboard
        try:
            from .websocket_manager import manager
            await manager.broadcast_to_meeting(meeting_id, {
                "type": "transcript_update",
                "text": text,
                "speaker": speaker,
                "source": "meeting_bot"
            })
        except Exception as e:
            print(f"⚠️  Could not broadcast via meeting manager: {e}")
    
    async def process_audio_chunk(self, meeting_id: str, audio_data: bytes):
        """Process incoming audio chunk from bot"""
        if meeting_id not in self.bot_connections:
            return
        
        _, processor = self.bot_connections[meeting_id]
        
        # Add chunk to buffer
        processor.add_audio_chunk(audio_data)
        
        # Process if we have enough data
        if processor.has_enough_data():
            audio_chunk = processor.get_audio_chunk()
            if audio_chunk:
                # Process with Whisper
                text = await processor.process_with_whisper(audio_chunk)
                
                if text:
                    print(f"🎤 Transcribed: {text[:50]}...")
                    # Broadcast to clients
                    await self.broadcast_transcription(meeting_id, text)

# Global bot manager instance
bot_manager = BotConnectionManager()
