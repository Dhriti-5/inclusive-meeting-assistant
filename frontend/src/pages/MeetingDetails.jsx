import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Download, 
  Mail, 
  FileText, 
  Clock, 
  Calendar,
  Users,
  CheckCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react'
import axios from 'axios'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const API_BASE_URL = 'http://localhost:8000'

const MeetingDetails = () => {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  const [meeting, setMeeting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('summary')
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [emailRecipient, setEmailRecipient] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    fetchMeetingDetails()
  }, [meetingId])

  const fetchMeetingDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_BASE_URL}/api/meetings/${meetingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMeeting(response.data)
    } catch (error) {
      console.error('Error fetching meeting:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_BASE_URL}/api/meetings/${meetingId}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      )
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `meeting-${meetingId}-summary.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF')
    }
  }

  const sendEmail = async () => {
    if (!emailRecipient || !emailRecipient.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    try {
      setSendingEmail(true)
      const token = localStorage.getItem('token')
      
      const formData = new FormData()
      formData.append('recipient', emailRecipient)
      
      const response = await axios.post(
        `${API_BASE_URL}/api/meetings/${meetingId}/send-email`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      if (response.data.success) {
        alert('✅ Email sent successfully!')
        setEmailModalOpen(false)
        setEmailRecipient('')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('❌ Failed to send email')
    } finally {
      setSendingEmail(false)
    }
  }

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  const calculateDuration = (start, end) => {
    if (!start || !end) return 'N/A'
    const duration = new Date(end) - new Date(start)
    const minutes = Math.floor(duration / 60000)
    return `${minutes} minutes`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Meeting Not Found
            </h2>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'transcript', label: 'Transcript', icon: FileText },
    { id: 'actions', label: 'Action Items', icon: CheckCircle },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {meeting.title || 'Meeting Summary'}
                </h1>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(meeting.created_at)}</span>
                  </div>
                  
                  {meeting.duration && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{meeting.duration || 'N/A'}</span>
                    </div>
                  )}
                  
                  {meeting.participants && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{meeting.participants} participants</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={downloadPDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
                
                <button
                  onClick={() => setEmailModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send via Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          {activeTab === 'summary' && (
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">Meeting Summary</h2>
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {meeting.summary || 'Summary is being generated...'}
              </div>
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Transcript</h2>
              {meeting.transcript ? (
                <div className="space-y-3">
                  {meeting.transcript.split('\n').map((line, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-800 dark:text-gray-200">{line}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Transcript is being processed...</p>
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Action Items</h2>
              {meeting.action_items && meeting.action_items.length > 0 ? (
                <div className="space-y-3">
                  {meeting.action_items.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-800 dark:text-gray-200">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No action items found in this meeting.</p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Send Meeting Summary
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={sendEmail}
                disabled={sendingEmail}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </button>
              <button
                onClick={() => {
                  setEmailModalOpen(false)
                  setEmailRecipient('')
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default MeetingDetails
