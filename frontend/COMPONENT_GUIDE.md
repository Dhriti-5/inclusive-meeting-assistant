# Component Architecture & Usage Guide

## 🏗️ Component Hierarchy

```
App.jsx (Root)
├── ThemeProvider (Context)
└── Router
    ├── Dashboard Page (/)
    │   ├── Navbar
    │   │   ├── Logo
    │   │   ├── Navigation Links
    │   │   ├── Theme Toggle Button
    │   │   └── User Profile Button
    │   │
    │   ├── Hero Section
    │   │   └── Title + Description
    │   │
    │   ├── JoinMeetingCard
    │   │   ├── Input (URL)
    │   │   ├── Button (Join)
    │   │   └── Badge (Platforms)
    │   │
    │   ├── MeetingHistory
    │   │   └── Card[] (Multiple)
    │   │       ├── Badge (Status)
    │   │       ├── Button (View Summary)
    │   │       └── Button (Download PDF)
    │   │
    │   ├── Features Grid
    │   │   └── Card[] (3 features)
    │   │
    │   └── Footer
    │
    ├── LiveMeeting Page (/meeting/:id)
    │   ├── Control Bar
    │   │   ├── Recording Indicator
    │   │   ├── Button (Settings)
    │   │   ├── Button (Fullscreen)
    │   │   └── Button (End Meeting)
    │   │
    │   └── 3-Panel Layout
    │       ├── Left Panel (40%)
    │       │   └── TranscriptFeed
    │       │       └── TranscriptItem[]
    │       │           ├── Avatar
    │       │           ├── Speaker Name
    │       │           ├── Timestamp
    │       │           └── Text Bubble
    │       │
    │       ├── Center Panel (30%)
    │       │   ├── SignLanguageCam
    │       │   │   ├── Video Element
    │       │   │   ├── Recording Badge
    │       │   │   └── Sign Overlay
    │       │   │       ├── Detected Letter
    │       │   │       └── Confidence %
    │       │   │
    │       │   └── LiveSummary
    │       │       └── Card[]
    │       │           └── Summary Points
    │       │
    │       └── Right Panel (30%)
    │           └── ActionItemPanel
    │               ├── Add Item Form
    │               └── ActionItem[]
    │                   ├── Checkbox
    │                   ├── Text
    │                   └── Delete Button
    │
    └── MeetingReport Page (/report/:id)
        ├── Navbar
        ├── Back Button
        ├── Header
        │   ├── Title + Metadata
        │   ├── Badge (Status)
        │   ├── Button (Download PDF)
        │   └── Button (Email)
        │
        ├── Summary Card
        │   └── AI-generated text
        │
        ├── Action Items Card
        │   └── Numbered List
        │
        ├── Participants Card
        │   └── Avatar[] + Names
        │
        ├── Transcript Card
        │   └── TranscriptItem[]
        │
        └── Footer
```

---

## 📦 Shared Components Usage

### Button Component
```jsx
import Button from '@/components/shared/Button'

// Primary button
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// With icon
<Button 
  variant="outline" 
  leftIcon={<Download />}
  rightIcon={<ArrowRight />}
>
  Download
</Button>

// Loading state
<Button isLoading>
  Processing...
</Button>

// All variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `isLoading`: boolean
- `disabled`: boolean
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `onClick`: function
- `className`: string (for additional styles)

---

### Card Component
```jsx
import Card from '@/components/shared/Card'

// Basic card
<Card>
  <p>Content here</p>
</Card>

// With hover effect
<Card hover>
  <p>Hover over me!</p>
</Card>

// Without padding
<Card padding={false}>
  <p>No padding</p>
</Card>

// Custom styles
<Card className="bg-blue-50 border-2">
  <p>Custom styled</p>
</Card>
```

**Props:**
- `children`: ReactNode
- `hover`: boolean (adds hover animation)
- `padding`: boolean (default: true)
- `className`: string

---

### Input Component
```jsx
import Input from '@/components/shared/Input'

// Basic input
<Input 
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// With label
<Input 
  label="Email Address"
  type="email"
  placeholder="you@example.com"
/>

// With validation
<Input 
  label="Meeting URL"
  error={errorMessage}
  helperText="Enter a valid Google Meet or Zoom URL"
/>

// With icons
<Input 
  leftIcon={<Search />}
  rightIcon={<Info />}
  placeholder="Search..."
/>
```

**Props:**
- `label`: string
- `type`: string (default: 'text')
- `placeholder`: string
- `value`: string
- `onChange`: function
- `error`: string
- `helperText`: string
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `disabled`: boolean

---

### Badge Component
```jsx
import Badge from '@/components/shared/Badge'

// Basic badge
<Badge>Default</Badge>

// Variants
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Processing</Badge>
<Badge variant="danger">Failed</Badge>
<Badge variant="info">Info</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// With icon
<Badge variant="success">
  <CheckCircle className="w-3 h-3 mr-1" />
  Completed
</Badge>
```

**Props:**
- `variant`: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
- `size`: 'sm' | 'md' | 'lg'
- `children`: ReactNode
- `className`: string

---

### Avatar Component
```jsx
import Avatar from '@/components/shared/Avatar'

// Basic avatar
<Avatar speaker="John Doe" />

// Sizes
<Avatar speaker="Jane Smith" size="sm" />
<Avatar speaker="Mike Johnson" size="md" />
<Avatar speaker="Sarah Williams" size="lg" />
<Avatar speaker="Tom Brown" size="xl" />

// Without initials
<Avatar speaker="User" showInitials={false} />
```

**Props:**
- `speaker`: string (required - generates color and initials)
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `showInitials`: boolean (default: true)
- `className`: string

**Note:** Avatar color is automatically generated based on speaker name for consistency.

---

### Loader Component
```jsx
import Loader from '@/components/shared/Loader'

// Basic loader
<Loader />

// Sizes
<Loader size="sm" />
<Loader size="md" />
<Loader size="lg" />
<Loader size="xl" />

// With custom text
<Loader text="Loading meetings..." />

// Without text
<Loader text="" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `text`: string (default: 'Loading...')

---

## 🎨 Layout Components

### Navbar
```jsx
import Navbar from '@/components/layout/Navbar'

// Already configured, just use it
<Navbar />
```

Features:
- InclusiveMeet logo
- Navigation links
- Theme toggle (auto dark mode)
- User profile icon

---

### Footer
```jsx
import Footer from '@/components/layout/Footer'

// Already configured, just use it
<Footer />
```

Features:
- Copyright year (auto-updates)
- Branding message

---

## 🔄 Context Usage

### Theme Context
```jsx
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const { isDark, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme}>
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  )
}
```

**Features:**
- Auto-detects system preference
- Persists in localStorage
- Smooth transitions
- Available app-wide

---

## 🔌 API Service Usage

### Making API Calls
```jsx
import { meetingAPI } from '@/services/api'

// Join meeting
const response = await meetingAPI.joinMeeting('meet.google.com/abc-xyz')
console.log(response.data.meetingId)

// Get meeting status
const status = await meetingAPI.getMeetingStatus(meetingId)

// Get live transcript
const transcript = await meetingAPI.getLiveTranscript(meetingId)

// Get meeting history
const history = await meetingAPI.getMeetingHistory()

// Get full report
const report = await meetingAPI.getMeetingReport(meetingId)

// End meeting
await meetingAPI.endMeeting(meetingId)

// Download PDF
const pdfBlob = await meetingAPI.downloadPDF(meetingId)

// Get action items
const actions = await meetingAPI.getActionItems(meetingId)
```

**Features:**
- Centralized error handling
- Request/response interceptors
- Easy to mock for testing
- TypeScript-ready

---

## 🛠️ Utility Functions

### Helper Functions
```jsx
import { 
  cn, 
  formatDuration, 
  formatTimestamp,
  isValidMeetingUrl,
  getSpeakerColor,
  getSpeakerInitials 
} from '@/utils/helpers'

// Merge class names
const classes = cn('base-class', isActive && 'active-class')

// Format duration
formatDuration(3600) // "1h 0m"
formatDuration(150)  // "2m 30s"

// Format timestamp
formatTimestamp(new Date()) // "Dec 14, 10:30 AM"

// Validate meeting URL
isValidMeetingUrl('meet.google.com/abc-xyz') // true
isValidMeetingUrl('invalid-url') // false

// Get speaker color
getSpeakerColor('John Doe') // 'bg-blue-500'

// Get initials
getSpeakerInitials('John Doe') // 'JD'
```

---

## 🧪 Mock Data

### Using Mock Data
```jsx
import { 
  mockMeetings,
  mockTranscripts,
  mockActionItems,
  mockSummaryPoints,
  mockMeetingReport,
  mockDetectedSign
} from '@/utils/mockData'

function MyComponent() {
  const [meetings, setMeetings] = useState(mockMeetings)
  const [transcripts, setTranscripts] = useState(mockTranscripts)
  
  // Use mock data for development/testing
}
```

---

## 🎯 Best Practices

### Component Creation
```jsx
// 1. Import dependencies
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. Import components
import Button from '@/components/shared/Button'
import Card from '@/components/shared/Card'

// 3. Import utilities
import { cn } from '@/utils/helpers'

// 4. Define component
const MyComponent = ({ prop1, prop2 }) => {
  // 5. State and hooks
  const [state, setState] = useState(initialValue)
  const navigate = useNavigate()
  
  // 6. Event handlers
  const handleClick = () => {
    // Logic here
  }
  
  // 7. Render
  return (
    <Card>
      <Button onClick={handleClick}>
        {prop1}
      </Button>
    </Card>
  )
}

// 8. Export
export default MyComponent
```

### Styling
```jsx
// Use Tailwind classes
<div className="flex items-center gap-4 p-6">

// Add dark mode variants
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Combine with cn() utility
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className
)}>
```

### State Management
```jsx
// Local state for component-specific data
const [count, setCount] = useState(0)

// Context for app-wide state
const { isDark } = useTheme()

// Props for parent-child communication
<ChildComponent data={parentData} onChange={handleChange} />
```

---

## 📱 Responsive Design

### Breakpoints
```jsx
// Mobile first approach
<div className="
  text-sm          {/* Default (mobile) */}
  md:text-base     {/* Tablet (768px+) */}
  lg:text-lg       {/* Desktop (1024px+) */}
">
```

### Grid Layouts
```jsx
// Responsive grid
<div className="
  grid 
  grid-cols-1      {/* 1 column on mobile */}
  md:grid-cols-2   {/* 2 columns on tablet */}
  lg:grid-cols-3   {/* 3 columns on desktop */}
  gap-4
">
```

---

## 🎨 Color System

### Using Colors
```jsx
// Primary color (blue)
<div className="bg-primary-500 text-primary-900">

// Accent color (purple)
<div className="bg-accent-500 text-accent-900">

// Status colors
<div className="bg-green-500">  {/* Success */}
<div className="bg-red-500">    {/* Danger */}
<div className="bg-yellow-500"> {/* Warning */}

// Gray scale
<div className="bg-gray-100 dark:bg-gray-800">
```

---

## ⚡ Performance Tips

1. **Use React.memo** for expensive components
2. **Lazy load** routes with React.lazy()
3. **Debounce** search inputs
4. **Optimize images** in public folder
5. **Code split** large components

---

## 🐛 Debugging

### Common Issues
```jsx
// Check console for errors
console.log('Debug:', variable)

// Use React DevTools to inspect state
// Install: https://react.dev/learn/react-developer-tools

// Check network tab for API calls
```

---

This guide covers all components and their usage. For more details, check the component source files!
