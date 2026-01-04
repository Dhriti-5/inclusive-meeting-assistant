import { useState, useEffect } from 'react'
import { Calendar, Clock, Mail, User, Video, RefreshCw, CheckCircle, PlayCircle, ExternalLink } from 'lucide-react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const MeetingInbox = () => {
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [joiningMeetingId, setJoiningMeetingId] = useState(null)
  const [loggingMeetingId, setLoggingMeetingId] = useState(null)

  useEffect(() => {
    fetchInvites()
  }, [])

  const fetchInvites = async () => {
    try {
      setRefreshing(true)
      const token = localStorage.getItem('token')
      
      console.log('🔍 Fetching invites...')
      console.log('Token:', token ? 'Present' : 'Missing')
      
      const response = await axios.get(`${API_BASE_URL}/api/inbox/invites`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📧 Inbox response:', response.data)
      
      if (response.data.success) {
        setInvites(response.data.invites)
        console.log(`✅ Found ${response.data.invites.length} invites`)
      }
    } catch (error) {
      console.error('❌ Error fetching invites:', error)
      console.error('Error details:', error.response?.data)
      
      // Show error message to user
      if (error.response?.status === 401) {
        alert('Please login to view meeting invites')
      } else {
        console.error('Failed to fetch invites. Check if backend is running.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleOpenInGmail = (invite) => {
    // Open Gmail to let user join manually
    window.open(`https://mail.google.com/mail/u/0/#inbox/${invite.id}`, '_blank')
  }

  const handleStartRecording = async (invite) => {
    try {
      setJoiningMeetingId(invite.id)
      const token = localStorage.getItem('token')
      
      const formData = new FormData()
      formData.append('meet_link', invite.meet_link)
      formData.append('meeting_title', invite.subject)
      
      const response = await axios.post(
        `${API_BASE_URL}/api/meetings/start-recording`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      if (response.data.success) {
        // Mark as read
        await axios.post(
          `${API_BASE_URL}/api/inbox/mark-read/${invite.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        const meetingId = response.data.meeting_id
        
        if (response.data.auto_capture) {
          // Script launched automatically
          alert(`✅ Recording Started Automatically!\n\nA new window opened to capture audio.\n\n📋 Meeting ID: ${meetingId}\n\n⚡ Next Steps:\n1. Check the new PowerShell window\n2. Click "Open in Gmail" below\n3. Join the meeting\n4. Audio records automatically!\n5. After meeting, press Ctrl+C in PowerShell window\n\n✨ Everything is automatic!`)
        } else {
          // Fallback to manual instructions
          const command = `python capture_audio.py ${meetingId}`
          alert(`✅ Recording Ready!\n\nMeeting ID: ${meetingId}\n\n⚠️ Auto-launch failed. Please run manually:\n\n1. Open PowerShell\n2. Run: cd "C:\\Users\\Pc\\Deep Learning Specialization\\inclusive-meeting-assistant"\n3. Run: ${command}\n4. Then click "Open in Gmail" and join meeting`)
          
          navigator.clipboard.writeText(command).catch(() => {})
        }
        
        // Refresh invites
        fetchInvites()
      }
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('❌ Failed to start recording. Please try again.')
    } finally {
      setJoiningMeetingId(null)
    }
  }

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  const extractSenderName = (senderStr) => {
    const match = senderStr.match(/"?([^"<]+)"?\s*</)
    return match ? match[1].trim() : senderStr.split('<')[0].trim()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Mail className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Meeting Inbox
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {invites.length} meeting invite{invites.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <button
          onClick={fetchInvites}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Invites List */}
      {invites.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Meeting Invites
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add Ora's email to your meetings to see invites here
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {invite.subject}
                  </h3>
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{extractSenderName(invite.sender)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(invite.date)}</span>
                    </div>
                    
                    {invite.meeting_time && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{invite.meeting_time}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Meet Link Preview */}
                  <div className="flex items-center space-x-2 text-sm">
                    <Video className="h-4 w-4 text-blue-600" />
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {invite.meet_link}
                    </code>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="ml-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleOpenInGmail(invite)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>Open in Gmail</span>
                  </button>
                  
                  <button
                    onClick={() => handleStartRecording(invite)}
                    disabled={joiningMeetingId === invite.id}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {joiningMeetingId === invite.id ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Starting...</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-5 w-5" />
                        <span>Start Recording</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MeetingInbox
