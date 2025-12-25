# 🚀 Phase 5 Quick Start Guide

## Getting Started with Sign Language Detection

### 1️⃣ Installation
```bash
cd frontend
npm install
```

### 2️⃣ Start the Application
```bash
npm run dev
```
The app will be available at: **http://localhost:3000**

### 3️⃣ Access Sign Language Feature

1. **Login** to your account
2. Click **"Sign Language"** in the navigation bar
3. **Allow camera access** when prompted by your browser

### 4️⃣ Start Detecting Gestures

The system will automatically:
- ✅ Load MediaPipe hand detection models
- ✅ Access your webcam
- ✅ Display your video feed with hand landmarks
- ✅ Detect and recognize gestures in real-time

---

## 📸 Testing the Gestures

### Easy Letters to Start With:

**Letter A** - Make a fist
```
✊ Closed fist with thumb on the side
```

**Letter L** - Thumb and index at 90°
```
👍 + ☝️ = L shape
```

**Letter V** - Peace sign
```
✌️ Index and middle finger extended
```

**Number 5** - Open hand
```
🖐️ All fingers extended
```

**Letter Y** - Shaka/hang loose sign
```
🤙 Thumb and pinky extended
```

---

## 💡 Tips for Best Results

1. **Good Lighting** - Ensure your face/hand area is well-lit
2. **Plain Background** - Solid color backgrounds work best
3. **Clear View** - Keep your hand in the camera frame
4. **Hold Steady** - Hold each gesture for 1-2 seconds
5. **Distance** - Position hand ~2 feet from camera

---

## 🎮 Controls

| Button | Function |
|--------|----------|
| **Disable Camera** | Turn off webcam feed |
| **Clear Text** | Remove all detected text |
| **← Delete** | Remove last character |
| **Copy Text** | Copy detected text to clipboard |
| **Download History** | Save detection history as .txt file |

---

## 📊 What You'll See

### On Screen:
- **Live Video Feed** - Your webcam with mirrored display
- **Green Dots & Lines** - Hand landmarks (21 points per hand)
- **Current Gesture Box** - Shows detected letter/number with confidence
- **FPS Counter** - Performance indicator (top-right)
- **Detected Text Area** - Accumulated characters
- **Detection History** - Sidebar with timestamp log
- **Session Stats** - Total gestures, text length, last detection

### Performance Metrics:
- **FPS**: Should be 25-30 for smooth operation
- **Confidence**: Gestures show confidence percentage
- **Stability**: How consistent the detection is

---

## 🎯 Supported Gestures Reference

### Letters (10)
| Letter | Description | How to Sign |
|--------|-------------|-------------|
| **A** | Closed fist | All fingers closed, thumb on side |
| **B** | Flat hand | All fingers together, thumb tucked |
| **C** | Curved hand | Hand curved like letter C |
| **D** | Index up, O shape | Index up, other fingers touch thumb |
| **F** | OK with 3 up | Thumb-index circle, other 3 up |
| **I** | Pinky up | Only pinky extended |
| **L** | L shape | Thumb + index at 90° angle |
| **O** | Circle | All fingers form circle |
| **V** | Peace sign | Index + middle fingers up |
| **Y** | Shaka | Thumb + pinky extended |

### Numbers (5)
| Number | How to Sign |
|--------|-------------|
| **1** | Index finger only |
| **2** | Index + middle fingers |
| **3** | Thumb + index + middle |
| **4** | Four fingers (no thumb) |
| **5** | All five fingers extended |

---

## 🐛 Troubleshooting

### Camera not showing?
```
✅ Check browser permissions (click 🔒 in address bar)
✅ Ensure no other app is using the camera
✅ Try refreshing the page
```

### Low FPS or laggy?
```
✅ Close other browser tabs
✅ Use Google Chrome (best performance)
✅ Check if GPU acceleration is enabled in browser
```

### Gestures not detected?
```
✅ Improve lighting conditions
✅ Move hand closer/farther from camera
✅ Hold gesture steady for 2 seconds
✅ Ensure plain background behind hand
```

### "Loading MediaPipe..." stuck?
```
✅ Check internet connection (for first load)
✅ Clear browser cache
✅ Try incognito/private mode
```

---

## 🎬 Quick Demo Flow

**Try this sequence to test the feature:**

1. Start with number **5** (open hand) ✋
2. Make a fist for **A** ✊
3. Show peace sign for **V** ✌️
4. Make L shape for **L** 🤟
5. Show pinky for **I** 🤘

**Expected Output:** `5AVLI`

---

## 🔗 Learn More

- Full documentation: [PHASE5_SUMMARY.md](PHASE5_SUMMARY.md)
- ASL alphabet reference: https://www.lifeprint.com/asl101/pages-layout/handshapes.htm
- MediaPipe docs: https://developers.google.com/mediapipe

---

## ✅ Success Checklist

- [ ] Frontend server running on port 3000
- [ ] Can login to the application
- [ ] See "Sign Language" in navigation
- [ ] Camera permissions granted
- [ ] Can see webcam feed
- [ ] Green dots appear on hand
- [ ] Gestures are detected and shown
- [ ] Text accumulates in the text area
- [ ] Can copy/download detected text
- [ ] FPS is 20+ (good performance)

---

**🎉 You're all set! Start signing and watch the magic happen!**

Need help? Check [PHASE5_SUMMARY.md](PHASE5_SUMMARY.md) for detailed technical information.
