"""
Test Audio Capture - Quick 10 second test
Run this to verify audio capture is working before joining meetings
"""

import pyaudio
import wave
import os
from datetime import datetime

# Configuration
CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 2
RATE = 44100
RECORD_SECONDS = 10  # Short test

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
    """Find Stereo Mix device"""
    p = pyaudio.PyAudio()
    stereo_mix_devices = []
    
    for i in range(p.get_device_count()):
        info = p.get_device_info_by_index(i)
        name = info['name'].lower()
        
        if 'stereo mix' in name:
            if info['maxInputChannels'] > 0:
                stereo_mix_devices.append({
                    'index': i,
                    'name': info['name'],
                    'rate': int(info['defaultSampleRate'])
                })
    
    p.terminate()
    
    if stereo_mix_devices:
        for device in stereo_mix_devices:
            if device['rate'] == 44100:
                return device['index'], device['name']
        device = stereo_mix_devices[0]
        return device['index'], device['name']
    
    return None, None

def test_audio_capture(device_index=None):
    """Capture 10 seconds of audio and save to file"""
    p = pyaudio.PyAudio()
    
    try:
        print("\n🎙️  Starting audio capture test...")
        
        # Try to open stream
        if device_index is not None:
            device_info = p.get_device_info_by_index(device_index)
            print(f"   Using device: {device_info['name']}")
            stream = p.open(
                format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                input_device_index=device_index,
                frames_per_buffer=CHUNK
            )
        else:
            print(f"   Using default device")
            stream = p.open(
                format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK
            )
        
        print(f"   ✅ Stream opened successfully!")
        print(f"\n🔴 Recording for {RECORD_SECONDS} seconds...")
        print("   Play some audio or speak to test!")
        print()
        
        frames = []
        
        # Record
        for i in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
            try:
                data = stream.read(CHUNK, exception_on_overflow=False)
                frames.append(data)
                
                # Progress indicator
                if i % 43 == 0:  # Roughly every second
                    seconds_recorded = i / (RATE / CHUNK)
                    print(f"   📊 {seconds_recorded:.1f}s / {RECORD_SECONDS}s")
            except Exception as e:
                print(f"   ⚠️  Read error: {e}")
                continue
        
        print(f"\n✅ Recording complete!")
        
        # Stop stream
        stream.stop_stream()
        stream.close()
        
        # Save to file
        output_dir = "recordings"
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{output_dir}/test_capture_{timestamp}.wav"
        
        wf = wave.open(filename, 'wb')
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(p.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))
        wf.close()
        
        print(f"\n💾 Audio saved to: {filename}")
        print(f"\n🎧 Next steps:")
        print(f"   1. Open the file in Windows Media Player")
        print(f"   2. Check if you can hear the recorded audio")
        print(f"   3. If yes → Audio capture is working! ✅")
        print(f"   4. If no → Try different device or enable Stereo Mix")
        
        # Show file size
        file_size = os.path.getsize(filename)
        print(f"\n📊 File size: {file_size / 1024:.1f} KB")
        
        if file_size < 1000:
            print("   ⚠️  File is very small - audio might not be captured properly")
        else:
            print("   ✅ File size looks good!")
        
        return True, filename
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure the device is not being used by another app")
        print("2. Try enabling Stereo Mix in Windows Sound settings")
        print("3. Try using a different device (microphone)")
        return False, None
        
    finally:
        p.terminate()

def main():
    print("=" * 60)
    print("   Audio Capture Test")
    print("=" * 60)
    
    # List devices
    device_count = list_audio_devices()
    
    # Try to find Stereo Mix
    stereo_mix_index, stereo_mix_name = find_stereo_mix()
    
    devices_to_try = []
    
    if stereo_mix_index is not None:
        print(f"✅ Found Stereo Mix: {stereo_mix_name}")
        print(f"   Device Index: {stereo_mix_index}")
        devices_to_try.append(('Stereo Mix', stereo_mix_index))
    
    # Also add some safe fallback devices
    devices_to_try.extend([
        ('Microphone', 2),  # Usually microphone
        ('Default', None),   # System default
    ])
    
    print("\n" + "=" * 60)
    print("   Trying devices automatically...")
    print("=" * 60)
    
    # Try each device
    for device_name, device_index in devices_to_try:
        print(f"\n🔍 Trying: {device_name}")
        success, filename = test_audio_capture(device_index)
        
        if success and filename:
            print("\n" + "=" * 60)
            print("   Test Complete! ✅")
            print("=" * 60)
            print(f"\n✅ Audio capture is working with: {device_name}!")
            print(f"\nRecorded file: {filename}")
            print(f"\nTo play the recording:")
            print(f'   1. Press Enter')
            print(f'   2. Windows Explorer will open')
            print(f'   3. Double-click the file to play')
            print("\nIf you hear audio, you're ready for meetings! 🚀")
            
            input("\nPress Enter to open the recording folder...")
            os.system(f'explorer /select,"{os.path.abspath(filename)}"')
            return
        else:
            print(f"   ❌ {device_name} didn't work, trying next...")
    
    # If we get here, nothing worked
    print("\n" + "=" * 60)
    print("   All Tests Failed ❌")
    print("=" * 60)
    print("\n❌ None of the audio devices are working")
    print("\n📋 Manual Setup Required:")
    print("\n1. Enable Stereo Mix:")
    print("   • Right-click speaker icon (taskbar)")
    print("   • Click 'Sounds' → 'Recording' tab")
    print("   • Right-click empty area → 'Show Disabled Devices'")
    print("   • Find 'Stereo Mix' → Right-click → 'Enable'")
    print("   • Right-click 'Stereo Mix' → 'Set as Default Device'")
    print("   • Click 'OK'")
    print("\n2. Or try a different device:")
    
    choice = input("\n👉 Enter device index to try (or press Enter to exit): ").strip()
    if choice:
        try:
            device_index = int(choice)
            print(f"\nTesting device {device_index}...")
            success, filename = test_audio_capture(device_index)
            if success:
                print("\n✅ Success! This device works.")
                os.system(f'explorer /select,"{os.path.abspath(filename)}"')
        except Exception as e:
            print(f"Error: {e}")
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
