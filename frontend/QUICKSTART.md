# Quick Start Guide - InclusiveMeet Frontend

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

Open a terminal in the `frontend` directory and run:

```bash
npm install
```

This will install all required packages including:
- React & React DOM
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)
- Lucide React (icons)
- Axios (API calls)

### Step 2: Configure Environment

The `.env` file is already created. Verify it contains:

```env
VITE_API_URL=http://localhost:5000/api
```

If your Python backend runs on a different port, update this URL.

### Step 3: Start Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000` and open in your browser automatically.

### Step 4: Test the UI

1. **Dashboard**: You'll see the main dashboard with the "Join Meeting" card
2. **Theme Toggle**: Click the moon/sun icon to test dark mode
3. **Join Meeting**: Enter a meeting URL (e.g., `meet.google.com/test-123`)

---

## 🎯 What You Get

### Three Main Pages

1. **Dashboard (`/`)**
   - Join meeting interface
   - Meeting history list
   - Feature showcase

2. **Live Meeting (`/meeting/:id`)**
   - Real-time transcript feed (left panel)
   - Sign language camera (center panel)
   - Action items panel (right panel)
   - Live AI summary

3. **Meeting Report (`/report/:id`)**
   - Meeting summary
   - Action items list
   - Participant list
   - Full transcript
   - PDF download

### Reusable Components

All components are in `src/components/`:

```
shared/
  ├── Button.jsx      - Customizable button component
  ├── Card.jsx        - Container component
  ├── Badge.jsx       - Status badges
  ├── Input.jsx       - Form input with validation
  ├── Loader.jsx      - Loading spinner
  └── Avatar.jsx      - User avatar with initials

layout/
  ├── Navbar.jsx      - Top navigation bar
  └── Footer.jsx      - Page footer

dashboard/
  ├── JoinMeetingCard.jsx    - Meeting join interface
  └── MeetingHistory.jsx     - Past meetings list

live-session/
  ├── TranscriptFeed.jsx     - Live transcript display
  ├── SignLanguageCam.jsx    - Webcam with sign detection
  ├── ActionItemPanel.jsx    - Task management
  └── LiveSummary.jsx        - AI insights
```

---

## 🎨 Customization Guide

### Change Brand Colors

Edit `frontend/tailwind.config.js`:

```javascript
colors: {
  primary: {
    // Change these values
    500: '#0ea5e9',  // Main blue
    600: '#0284c7',
    // ...
  },
}
```

### Modify Layout

The live meeting layout uses a 12-column grid:

```jsx
// In src/pages/LiveMeeting.jsx
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-5">  {/* 40% - Transcript */}
  <div className="col-span-4">  {/* 30% - Video */}
  <div className="col-span-3">  {/* 30% - Actions */}
</div>
```

Adjust `col-span-X` values to change panel widths.

---

## 🔌 Connecting to Backend

### API Integration

All API calls are in `src/services/api.js`:

```javascript
export const meetingAPI = {
  joinMeeting: (url) => api.post('/meetings/join', { url }),
  getMeetingStatus: (id) => api.get(`/meetings/${id}/status`),
  // ... more endpoints
}
```

### Usage in Components

```jsx
import { meetingAPI } from '@/services/api'

// In your component
const handleJoin = async () => {
  try {
    const response = await meetingAPI.joinMeeting(url)
    // Handle success
  } catch (error) {
    // Handle error
  }
}
```

### Mock Data for Development

If the backend isn't ready, you can add mock responses:

```javascript
// In src/services/api.js
const MOCK_MODE = true

if (MOCK_MODE) {
  return Promise.resolve({
    data: {
      meetingId: 'mock-123',
      status: 'active'
    }
  })
}
```

---

## 🧪 Testing Your Changes

### Test Checklist

- [ ] Dashboard loads without errors
- [ ] Dark mode toggle works
- [ ] Join meeting button responds
- [ ] Meeting history displays (even if empty)
- [ ] Navigation between pages works
- [ ] Components are responsive on mobile
- [ ] No console errors

### Browser Testing

Test in these browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if on Mac)

---

## 📦 Building for Production

```bash
npm run build
```

This creates optimized files in `dist/` folder.

To test the production build:

```bash
npm run preview
```

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found"

**Solution**: Run `npm install` again

### Issue: "Port 3000 is already in use"

**Solution**: Either:
1. Kill the process using port 3000
2. Or change port in `vite.config.js`:

```javascript
server: {
  port: 3001  // Use different port
}
```

### Issue: Dark mode doesn't persist

**Solution**: Check browser allows localStorage

### Issue: API calls fail with CORS error

**Solution**: Ensure your Python backend has CORS enabled:

```python
from flask_cors import CORS
CORS(app)
```

---

## 📚 Learning Resources

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind Cheatsheet](https://nerdcave.com/tailwind-cheat-sheet)

### React Router
- [React Router Docs](https://reactrouter.com/)

### Lucide Icons
- [Icon Search](https://lucide.dev/icons/)

---

## 🎓 Next Steps

1. **Customize the design**: Change colors, fonts, and layouts
2. **Add new features**: Create new components and pages
3. **Integrate backend**: Connect all API endpoints
4. **Add authentication**: Implement user login
5. **Deploy**: Host on Vercel, Netlify, or AWS

---

## 💡 Tips for Development

1. **Use React DevTools**: Install the browser extension
2. **Hot Reload**: Changes appear instantly (no refresh needed)
3. **Console**: Check browser console for errors
4. **Component Organization**: Keep components small and focused
5. **Reuse**: Use shared components for consistency

---

Need help? Check the main README.md or open an issue on GitHub!
