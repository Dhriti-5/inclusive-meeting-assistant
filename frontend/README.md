# InclusiveMeet Frontend

A modern, accessible React-based frontend for the InclusiveMeet AI-powered meeting assistant.

## 🎨 Design Philosophy

- **Clean & Accessible**: High-contrast, clear UI following WCAG guidelines
- **Professional**: SaaS-grade design similar to Read.ai and Otter.ai
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode**: Full dark mode support with system preference detection

## 🚀 Features

### Core Features
- ✅ **Real-time Transcription Display**: Live speech-to-text with speaker identification
- ✅ **Sign Language Detection**: Visual feedback for ASL detection
- ✅ **Action Items Panel**: AI-powered task extraction and management
- ✅ **Live Summary**: Real-time meeting insights
- ✅ **Meeting History**: Browse past meetings with search and filters
- ✅ **PDF Export**: Download meeting summaries as PDF
- ✅ **Dark Mode**: Toggle between light and dark themes
- ✅ **Responsive Design**: Optimized for all screen sizes

### Accessibility Features
- High contrast colors for better visibility
- Keyboard navigation support
- Screen reader friendly
- Large, readable fonts (Inter)
- Clear focus indicators

## 📦 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3
- **Routing**: React Router v6
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Date Utilities**: date-fns

## 🛠️ Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- Python backend running on `http://localhost:5000`

### Setup

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

3. **Start development server**:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── layout/         # Layout components (Navbar, Footer)
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── live-session/   # Live meeting components
│   │   └── shared/         # Shared/reusable components
│   │
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # Home page
│   │   ├── LiveMeeting.jsx # Live meeting room
│   │   └── MeetingReport.jsx # Post-meeting report
│   │
│   ├── contexts/           # React contexts
│   │   └── ThemeContext.jsx # Theme management
│   │
│   ├── services/           # API services
│   │   └── api.js          # API client and endpoints
│   │
│   ├── utils/              # Utility functions
│   │   └── helpers.js      # Helper functions
│   │
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
│
├── public/                 # Static assets
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies
```

## 🎯 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🎨 Component Library

### Shared Components

#### Button
```jsx
import Button from '@/components/shared/Button'

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Props**:
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `isLoading`: boolean
- `leftIcon`, `rightIcon`: ReactNode

#### Card
```jsx
import Card from '@/components/shared/Card'

<Card hover className="p-6">
  Content
</Card>
```

#### Input
```jsx
import Input from '@/components/shared/Input'

<Input
  label="Meeting URL"
  placeholder="Enter URL"
  error={errorMessage}
  leftIcon={<Icon />}
/>
```

#### Badge
```jsx
import Badge from '@/components/shared/Badge'

<Badge variant="success" size="md">
  Completed
</Badge>
```

#### Avatar
```jsx
import Avatar from '@/components/shared/Avatar'

<Avatar speaker="John Doe" size="md" />
```

## 🔌 API Integration

The frontend communicates with the Python backend via REST APIs:

```javascript
// Example: Join a meeting
import { meetingAPI } from '@/services/api'

const response = await meetingAPI.joinMeeting('meet.google.com/abc-xyz')
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/meetings/join` | POST | Join a new meeting |
| `/meetings/:id/status` | GET | Get meeting status |
| `/meetings/:id/transcript` | GET | Get live transcript |
| `/meetings/history` | GET | Get meeting history |
| `/meetings/:id/report` | GET | Get meeting report |
| `/meetings/:id/end` | POST | End meeting |
| `/meetings/:id/pdf` | GET | Download PDF report |

## 🎨 Theming

### Colors

The app uses a custom color palette defined in Tailwind:

- **Primary**: Blue (#0ea5e9) - Main brand color
- **Accent**: Purple (#a855f7) - Secondary actions
- **Success**: Green - Positive actions
- **Danger**: Red - Destructive actions
- **Warning**: Yellow - Caution

### Dark Mode

Dark mode is automatically enabled based on system preferences and can be toggled manually:

```jsx
import { useTheme } from '@/contexts/ThemeContext'

const { isDark, toggleTheme } = useTheme()
```

## 🚀 Production Deployment

### Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Deploy

The built files can be deployed to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `dist/` folder
- **AWS S3**: Upload `dist/` to S3 bucket
- **GitHub Pages**: Use `gh-pages` package

### Environment Variables

For production, set the following environment variables:

```env
VITE_API_URL=https://your-backend-api.com/api
```

## 📱 Responsive Breakpoints

```javascript
// Tailwind breakpoints
sm: '640px'   // Mobile landscape
md: '768px'   // Tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
2xl: '1536px' // Extra large
```

## ♿ Accessibility

The UI follows WCAG 2.1 AA standards:

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ High contrast ratios
- ✅ Focus indicators
- ✅ Semantic HTML
- ✅ ARIA labels

## 🐛 Troubleshooting

### Common Issues

**1. API Connection Error**

Ensure the backend is running and the `VITE_API_URL` in `.env` is correct.

**2. Dark Mode Not Working**

Clear browser cache and localStorage.

**3. Webcam Not Accessible**

Grant camera permissions in browser settings.

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributing

Contributions are welcome! Please follow the existing code style and component patterns.

## 🆘 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for inclusive meetings
