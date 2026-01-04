# Fix Audio Capture for Headphone Users

## Problem
When using headphones, the microphone only captures YOUR voice, not other meeting participants. 
Result: Transcript shows "you you you" - only fragments of your own voice.

## Why This Happens
- **Headphones** = Meeting audio goes to your ears only (not captured)
- **Microphone** = Only records what you say into mic
- **Result** = No meeting audio recorded, only your echoing voice

## Solution 1: Enable Stereo Mix (BEST)

### Quick PowerShell Command (Run as Admin):
```powershell
# Enable all audio recording devices
$devices = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\Render\*"
foreach ($device in $devices) {
    Set-ItemProperty -Path $device.PSPath -Name "DeviceState" -Value 1
}
```

### Manual Method:
1. **Right-click Speaker icon** (taskbar) → **Sounds**
2. Go to **Recording** tab
3. Right-click empty space → **Show Disabled Devices**
4. Find **"Stereo Mix"** or **"Wave Out Mix"**
5. Right-click → **Enable**
6. Right-click → **Set as Default Device**
7. Click **Apply** → **OK**
8. **Restart the recording script**

### Verify Stereo Mix Works:
```powershell
python test_audio_capture.py
```
Should show: `✅ Found Stereo Mix: Stereo Mix (Conexant ISST Audio`

---

## Solution 2: Use Speakers Instead

**Simple but works:**
1. Remove headphones during meeting
2. Use laptop/PC speakers
3. Microphone captures:
   - ✅ Your voice (from mic)
   - ✅ Meeting audio (from speakers)
   - ⚠️ May have slight echo

**Tips to reduce echo:**
- Keep speaker volume medium (not max)
- Place laptop/mic away from speakers
- Use built-in laptop speakers (better than external)

---

## Solution 3: Virtual Audio Cable (Advanced)

Install **VB-Audio Virtual Cable** (free):
1. Download: https://vb-audio.com/Cable/
2. Install VB-CABLE Driver
3. In Windows Sound Settings:
   - **Playback**: Set VB-Cable as default
   - **Recording**: Set VB-Cable Output as recording device
4. In Google Meet:
   - Audio output: Your headphones
   - Audio input: Your microphone
5. Recording captures VB-Cable (all system audio)

---

## Solution 4: Browser Extension (Coming Soon)

**Future improvement:**
- Capture audio directly from browser tab
- No need for Stereo Mix or speakers
- Works perfectly with headphones
- Currently not implemented

---

## How to Test After Fix

### 1. Enable Stereo Mix (Solution 1)
```powershell
cd "C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant"
python test_audio_capture.py
```

**Expected output:**
```
✅ Found Stereo Mix: Stereo Mix (Conexant ISST Audio
🔍 Trying: Stereo Mix
✅ Stream opened successfully!
🔴 Recording for 10 seconds...
```

**Play music or YouTube video** during the 10 seconds - it should be captured!

### 2. Test Real Meeting
1. Enable Stereo Mix (if not done)
2. Start recording: Click "Start Recording" in frontend
3. Join meeting in Gmail
4. **Play music or video** on your computer
5. Talk into microphone
6. Press Ctrl+C after 30 seconds
7. Check transcript:
   - ❌ Should NOT see: "you you you"
   - ✅ Should see: Actual words from music/video + your speech

---

## Why Your Current Recording Failed

**Your transcript:**
```
[UNKNOWN] you you you . [UNIVERSITY] you are you . You are you, you are .
```

**Analysis:**
- Only captured: Echoes of your own voice
- NOT captured: Other meeting participants
- Reason: Microphone fallback (can't hear headphones)

**Audio source priority:**
1. ✅ **Stereo Mix** = Captures EVERYTHING (system audio)
2. ⚠️ **Microphone** = Only captures nearby sounds (your voice)
3. ❌ **Microphone + Headphones** = Almost nothing captured

---

## Current Status Check

Run this to see your audio setup:
```powershell
python -c "import pyaudio; p = pyaudio.PyAudio(); [print(f'{i}: {p.get_device_info_by_index(i)[\"name\"]}') for i in range(p.get_device_count())]; p.terminate()"
```

Look for:
- ✅ "Stereo Mix" in the list = Available (may need enabling)
- ❌ No "Stereo Mix" = Need Solution 2 (speakers) or 3 (virtual cable)

---

## Recommended Action Plan

### For BEST Results:

1. **Enable Stereo Mix** (5 minutes)
   - Follow "Solution 1" steps above
   - Restart computer if needed
   - Verify with `test_audio_capture.py`

2. **Test with music** (1 minute)
   - Start recording script
   - Play YouTube video
   - Stop after 30 seconds
   - Check if video audio was captured

3. **Real meeting test** (next meeting)
   - Start recording BEFORE joining
   - Join meeting
   - Verify audio levels in PowerShell window
   - Press Ctrl+C when done

### If Stereo Mix Doesn't Work:

**Temporary workaround:**
- Use speakers (remove headphones)
- Keep volume medium
- Accept slight echo
- Works 100% guaranteed

**Better solution:**
- Install Virtual Audio Cable
- Takes 10 minutes to setup
- Works perfectly with headphones
- No echo issues

---

## Quick Command Reference

```powershell
# Test audio capture
python test_audio_capture.py

# List audio devices
python -c "import pyaudio; p = pyaudio.PyAudio(); [print(f'{i}: {p.get_device_info_by_index(i)[\"name\"]}') for i in range(p.get_device_count())]; p.terminate()"

# Enable Stereo Mix (PowerShell Admin)
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\Render\*" -Name "DeviceState" -Value 1

# Restart audio services
Restart-Service -Name "Audiosrv" -Force
```

---

## Expected Results After Fix

**Before (Current):**
```
Summary: you you you . You are you . You you you are.
```

**After (Fixed):**
```
Summary: Discussed project timeline and deliverables. 
John suggested moving deadline to next week. 
Sarah agreed to send updated requirements by Friday.
Action Items:
- Sarah: Send requirements (Due: Friday)
- John: Review timeline (Due: Monday)
```

---

Your audio capture will work perfectly once Stereo Mix is enabled! 🎧✅
