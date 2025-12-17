"""
Simple startup script for the backend server.
Runs uvicorn without loading heavy models on startup.
"""
import uvicorn
import sys
import os
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

# Disable model preloading by setting environment variable
os.environ['SKIP_MODEL_PRELOAD'] = '1'

if __name__ == "__main__":
    print("=" * 60)
    print("Starting Inclusive Meeting Assistant Backend")
    print("=" * 60)
    print("Server will be available at: http://localhost:8000")
    print("API docs: http://localhost:8000/docs")
    print("=" * 60)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
