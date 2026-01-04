"""
Automatic System Audio Capture for Ora Meetings
Captures system audio and streams to backend for real-time processing
"""

import pyaudio
import wave
import asyncio
import websockets
import json
import sys
import os
from datetime import datetime

# Configuration
CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 2  # Stereo
RATE = 44100
BACKEND_URL = "ws://localhost:8000"

def list_audio_devices():
    """List all available audio input devices"""
    p = pyaudio.PyAudio()
    print("\n🎤 Available Audio Devices:\n")
    
    device_count = p.get_device_count()
    
    for i in range(device_count):
        info = p.get_device_info_by_index(i)
        if info['maxInputChannels'] > 0:
            print(f"  [{i}] {info['name']}")
            print(f"      Channels: {info['maxInputChannels']}")
            print(f"      Sample Rate: {int(info['defaultSampleRate'])} Hz")
            print()
    
    p.terminate()
    return device_count

def find_stereo_mix():
    """Try to find 'Stereo Mix' or system audio device"""
    p = pyaudio.PyAudio()
    stereo_mix_devices = []
    
    for i in range(p.get_device_count()):
        info = p.get_device_info_by_index(i)
        name = info['name'].lower()
        
        # Look for system audio capture devices
        if any(keyword in name for keyword in ['stereo mix', 'wave out', 'loopback', 'what u hear']):
            if info['maxInputChannels'] > 0:
                stereo_mix_devices.append({
                    'index': i,
                    'name': info['name'],
                    'rate': int(info['defaultSampleRate'])
                })
    
    p.terminate()
    
    if stereo_mix_devices:
        # Prefer 44100 Hz devices
        for device in stereo_mix_devices:
            if device['rate'] == 44100:
                print(f"✅ Found system audio device: {device['name']}")
                return device['index']
        
        # Otherwise use first one
        device = stereo_mix_devices[0]
        print(f"✅ Found system audio device: {device['name']}")
        return device['index']
    
    return None

async def capture_and_stream(meeting_id, device_index=None, token=None):
    """Capture audio and save to file (no streaming - more reliable)"""
    
    # Initialize PyAudio
    p = pyaudio.PyAudio()
    
    try:
        # Open audio stream
        print(f"\n🎙️  Starting audio capture...")
        
        stream_opened = False
        attempts = 0
        max_attempts = 3
        
        while not stream_opened and attempts < max_attempts:
            try:
                if device_index is not None:
                    device_info = p.get_device_info_by_index(device_index)
                    print(f"   Attempt {attempts + 1}: Using device: {device_info['name']}")
                    stream = p.open(
                        format=FORMAT,
                        channels=CHANNELS,
                        rate=RATE,
                        input=True,
                        input_device_index=device_index,
                        frames_per_buffer=CHUNK
                    )
                else:
                    print(f"   Attempt {attempts + 1}: Using default device")
                    stream = p.open(
                        format=FORMAT,
                        channels=CHANNELS,
                        rate=RATE,
                        input=True,
                        frames_per_buffer=CHUNK
                    )
                stream_opened = True
                print("   ✅ Audio stream opened successfully!")
            except Exception as stream_error:
                attempts += 1
                print(f"   ❌ Failed: {stream_error}")
                if attempts < max_attempts and device_index is not None:
                    print(f"   Trying default device instead...")
                    device_index = None
                elif attempts >= max_attempts:
                    raise Exception(f"Failed to open audio stream after {max_attempts} attempts")
        
        if not stream_opened:
            raise Exception("Could not open audio stream")
        
        # Get JWT token
        if not token:
            token = input("\n🔑 Enter your JWT token (from browser localStorage): ").strip()
        
        print(f"\n✅ Ready to record!")
        print(f"📋 Meeting ID: {meeting_id}")
        print(f"\n🎤 Recording in progress...")
        print("   • Join your meeting now")
        print("   • Press Ctrl+C when meeting ends\n")
        
        # Also save locally
        output_dir = "recordings"
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{output_dir}/meeting_{meeting_id}_{timestamp}.wav"
        
        wf = wave.open(filename, 'wb')
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(p.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        
        frames_sent = 0
        try:
            while True:
                # Read audio chunk
                data = stream.read(CHUNK, exception_on_overflow=False)
                
                # Save locally
                wf.writeframes(data)
                
                frames_sent += 1
                if frames_sent % 100 == 0:
                    duration = frames_sent * CHUNK / RATE
                    print(f"📊 Recording... {int(duration // 60)}m {int(duration % 60)}s")
                
        except KeyboardInterrupt:
            print("\n\n⏹️  Stopping recording...")
        finally:
                wf.close()
                print(f"💾 Audio saved to: {filename}")
                
                # Auto-upload to backend
                print("\n📤 Uploading audio to backend...")
                try:
                    import requests
                    
                    with open(filename, 'rb') as audio_file:
                        files = {'audio': audio_file}
                        headers = {'Authorization': f'Bearer {token}'}
                        
                        upload_url = f"{BACKEND_URL.replace('ws://', 'http://')}/api/meetings/{meeting_id}/upload-audio"
                        
                        print(f"   Uploading to: {upload_url}")
                        response = requests.post(upload_url, files=files, headers=headers)
                        
                        if response.status_code == 200:
                            print("✅ Audio uploaded successfully!")
                            print("🔄 Processing started - check Past Meetings tab in a few minutes")
                            print("\n✨ You can close this window now")
                        else:
                            print(f"⚠️  Upload failed: {response.status_code}")
                            print(f"   Response: {response.text}")
                            print(f"\n   Manual upload: Click 'Upload Audio' button and select:\n   {filename}")
                            
                except Exception as upload_error:
                    print(f"⚠️  Auto-upload failed: {upload_error}")
                    print(f"\n   Manual upload: Click 'Upload Audio' button and select:\n   {filename}")
                
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure 'Stereo Mix' is enabled in Windows Sound settings")
        print("2. Right-click speaker icon → Sounds → Recording tab")
        print("3. Right-click in empty area → Show Disabled Devices")
        print("4. Enable 'Stereo Mix' if available")
    finally:
        if 'stream' in locals():
            stream.stop_stream()
            stream.close()
        p.terminate()
        
        print("\n" + "=" * 60)
        print("   Recording session ended")
        print("=" * 60)
        input("\nPress Enter to close this window...")

def main():
    print("=" * 60)
    print("   Ora Meeting Audio Capture")
    print("=" * 60)
    
    if len(sys.argv) < 2:
        print("\n❌ Usage: python capture_audio.py <meeting_id> [token]")
        print("\nExample: python capture_audio.py 67a1b2c3d4e5f6g7h8i9j0k")
        sys.exit(1)
    
    meeting_id = sys.argv[1]
    token = sys.argv[2] if len(sys.argv) > 2 else None
    
    print(f"\n📋 Meeting ID: {meeting_id}")
    
    # List available devices
    device_count = list_audio_devices()
    
    # Try to find stereo mix
    stereo_mix_index = find_stereo_mix()
    
    if stereo_mix_index is None:
        print("\n⚠️  Stereo Mix not available or not enabled!")
        print("\n� Falling back to Microphone")
        print("   Note: This will capture your voice clearly.")
        print("   Other participants may be heard if speakers are on.")
        
        # Try microphone (usually device 2)
        stereo_mix_index = 2
        print(f"\n✅ Using Microphone (device {stereo_mix_index})")
        print("\n📋 To capture all system audio in the future:")
        print("   1. Right-click speaker icon → 'Sounds' → 'Recording'")
        print("   2. Right-click empty area → 'Show Disabled Devices'")
        print("   3. Enable 'Stereo Mix' and set as default")
    
    # Start capture
    print("\n" + "=" * 60)
    
    # Initialize PyAudio once to get device count
    p = pyaudio.PyAudio()
    
    # Validate device index
    if stereo_mix_index is not None:
        try:
            info = p.get_device_info_by_index(stereo_mix_index)
            print(f"Selected device: {info['name']}")
            print(f"Sample rate: {int(info['defaultSampleRate'])} Hz")
        except Exception as e:
            print(f"⚠️  Invalid device index: {e}")
            stereo_mix_index = None
    
    p.terminate()
    
    asyncio.run(capture_and_stream(meeting_id, stereo_mix_index, token))

if __name__ == "__main__":
    main()
