import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Dashboard from './pages/Dashboard'
import LiveMeeting from './pages/LiveMeeting'
import MeetingReport from './pages/MeetingReport'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meeting/:meetingId" element={<LiveMeeting />} />
            <Route path="/report/:meetingId" element={<MeetingReport />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
