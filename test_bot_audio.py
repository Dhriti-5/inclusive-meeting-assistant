"""
Test script for bot audio processing
Tests the WebSocket endpoint and audio processing pipeline
"""
import asyncio
import websockets
import json
import wave
import sys
import os

# Append project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def test_bot_audio_websocket():
    """Test the bot audio WebSocket endpoint"""
    
    print("🧪 Testing Bot Audio WebSocket Endpoint")
    print("=" * 50)
    
    uri = "ws://localhost:8000/ws/bot-audio"
    
    try:
        print(f"📡 Connecting to {uri}...")
        
        async with websockets.connect(uri) as websocket:
            print("✅ Connected successfully!")
            
            # Send initial metadata
            metadata = {
                "type": "bot_connected",
                "meeting_id": "test-meeting-123",
                "timestamp": "2025-12-17T10:30:00.000Z",
                "sampleRate": 16000
            }
            
            print(f"📤 Sending metadata: {metadata}")
            await websocket.send(json.dumps(metadata))
            
            # Wait for acknowledgment
            response = await websocket.recv()
            print(f"📥 Received response: {response}")
            
            response_data = json.loads(response)
            if response_data.get("type") == "acknowledged":
                print("✅ Bot connection acknowledged!")
            
            # Test with a small audio chunk (silence)
            # In a real scenario, this would be actual audio data
            print("\n🎤 Testing audio chunk sending...")
            
            # Create a small audio chunk (1 second of silence)
            sample_rate = 16000
            channels = 1
            sample_width = 2
            duration = 1  # second
            
            # Generate silence
            audio_data = bytes(sample_rate * channels * sample_width * duration)
            
            print(f"📤 Sending audio chunk ({len(audio_data)} bytes)...")
            await websocket.send(audio_data)
            
            print("✅ Audio chunk sent successfully!")
            
            # Keep connection open briefly
            await asyncio.sleep(2)
            
            # Send disconnect message
            disconnect_msg = {
                "type": "bot_disconnected",
                "timestamp": "2025-12-17T10:31:00.000Z"
            }
            
            print(f"\n📤 Sending disconnect: {disconnect_msg}")
            await websocket.send(json.dumps(disconnect_msg))
            
            print("✅ Test completed successfully!")
            
    except websockets.exceptions.WebSocketException as e:
        print(f"❌ WebSocket error: {e}")
        print("\n💡 Make sure the backend is running:")
        print("   cd backend && python main.py")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

async def test_bot_audio_processor():
    """Test the BotAudioProcessor class directly"""
    
    print("\n\n🧪 Testing BotAudioProcessor Class")
    print("=" * 50)
    
    try:
        from backend.bot_audio_processor import BotAudioProcessor
        
        print("✅ Successfully imported BotAudioProcessor")
        
        # Create processor instance
        processor = BotAudioProcessor()
        print(f"✅ Created processor instance")
        print(f"   Sample rate: {processor.sample_rate}")
        print(f"   Channels: {processor.channels}")
        print(f"   Min chunk size: {processor.min_chunk_size} bytes")
        
        # Test buffer operations
        print("\n📊 Testing buffer operations...")
        
        # Add small chunk
        test_chunk = bytes(1000)
        processor.add_audio_chunk(test_chunk)
        print(f"✅ Added {len(test_chunk)} bytes to buffer")
        print(f"   Buffer size: {len(processor.audio_buffer)} bytes")
        print(f"   Has enough data: {processor.has_enough_data()}")
        
        # Add enough data
        large_chunk = bytes(processor.min_chunk_size)
        processor.add_audio_chunk(large_chunk)
        print(f"✅ Added {len(large_chunk)} bytes to buffer")
        print(f"   Buffer size: {len(processor.audio_buffer)} bytes")
        print(f"   Has enough data: {processor.has_enough_data()}")
        
        # Extract chunk
        if processor.has_enough_data():
            chunk = processor.get_audio_chunk()
            print(f"✅ Extracted chunk: {len(chunk)} bytes")
            print(f"   Remaining buffer: {len(processor.audio_buffer)} bytes")
        
        print("\n✅ BotAudioProcessor tests passed!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("\n💡 Make sure backend modules are accessible")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_dependencies():
    """Check if required dependencies are installed"""
    
    print("🔍 Checking Dependencies")
    print("=" * 50)
    
    dependencies = {
        "websockets": "pip install websockets",
        "wave": "Built-in",
        "asyncio": "Built-in"
    }
    
    all_ok = True
    for dep, install_cmd in dependencies.items():
        try:
            __import__(dep)
            print(f"✅ {dep}")
        except ImportError:
            print(f"❌ {dep} - Install: {install_cmd}")
            all_ok = False
    
    print()
    return all_ok

async def main():
    """Run all tests"""
    
    print("\n" + "=" * 50)
    print("🧪 Bot Audio Processing Test Suite")
    print("=" * 50 + "\n")
    
    # Check dependencies
    if not check_dependencies():
        print("❌ Missing dependencies. Please install them first.")
        return
    
    # Test BotAudioProcessor class
    processor_ok = await test_bot_audio_processor()
    
    # Test WebSocket endpoint
    websocket_ok = await test_bot_audio_websocket()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary")
    print("=" * 50)
    print(f"BotAudioProcessor: {'✅ PASS' if processor_ok else '❌ FAIL'}")
    print(f"WebSocket Endpoint: {'✅ PASS' if websocket_ok else '❌ FAIL'}")
    
    if processor_ok and websocket_ok:
        print("\n🎉 All tests passed!")
        print("\n✨ You can now run the bot:")
        print("   cd bot_engine && npm start")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n👋 Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
