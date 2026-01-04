"""
Ora Bot Manager - Simplified bot management for joining Google Meet
"""
import subprocess
import os
import signal
import psutil
from typing import Optional

BOT_DIR = os.path.join(os.path.dirname(__file__), "..", "bot_engine")
BOT_SCRIPT = "auth_bot.js"


class OraBotManager:
    def __init__(self):
        self.active_bots = {}  # meeting_id: process
    
    def start_bot(self, meeting_id: str, meet_link: str) -> dict:
        """Start a bot to join a meeting"""
        try:
            # Check if bot is already running for this meeting
            if meeting_id in self.active_bots:
                process = self.active_bots[meeting_id]
                if process.poll() is None:  # Still running
                    return {
                        "success": False,
                        "message": "Bot already running for this meeting",
                        "pid": process.pid
                    }
            
            # Start the bot process
            bot_path = os.path.join(BOT_DIR, BOT_SCRIPT)
            backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
            process = subprocess.Popen(
                ["node", bot_path, meet_link, meeting_id, backend_url],
                cwd=BOT_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0
            )
            
            self.active_bots[meeting_id] = process
            
            return {
                "success": True,
                "message": "Bot started successfully",
                "pid": process.pid,
                "meeting_id": meeting_id
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to start bot: {str(e)}",
                "error": str(e)
            }
    
    def stop_bot(self, meeting_id: str) -> dict:
        """Stop a bot for a specific meeting"""
        try:
            if meeting_id not in self.active_bots:
                return {"success": False, "message": "No bot found for this meeting"}
            
            process = self.active_bots[meeting_id]
            
            # Kill the process
            if os.name == 'nt':
                # Windows
                process.send_signal(signal.CTRL_BREAK_EVENT)
                process.terminate()
            else:
                # Unix
                process.terminate()
            
            process.wait(timeout=5)
            del self.active_bots[meeting_id]
            
            return {"success": True, "message": "Bot stopped successfully"}
            
        except subprocess.TimeoutExpired:
            # Force kill if graceful termination fails
            process.kill()
            del self.active_bots[meeting_id]
            return {"success": True, "message": "Bot force stopped"}
        except Exception as e:
            return {"success": False, "message": f"Error stopping bot: {str(e)}"}
    
    def get_bot_status(self, meeting_id: str) -> dict:
        """Get status of a bot"""
        if meeting_id not in self.active_bots:
            return {"status": "not_found", "running": False}
        
        process = self.active_bots[meeting_id]
        
        if process.poll() is None:
            return {
                "status": "running",
                "running": True,
                "pid": process.pid
            }
        else:
            return {
                "status": "stopped",
                "running": False,
                "exit_code": process.returncode
            }
    
    def cleanup_finished_bots(self):
        """Remove finished bots from tracking"""
        finished = []
        for meeting_id, process in self.active_bots.items():
            if process.poll() is not None:
                finished.append(meeting_id)
        
        for meeting_id in finished:
            del self.active_bots[meeting_id]


# Global bot manager instance
bot_manager = OraBotManager()
