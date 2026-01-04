import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PhoneOff, Settings, Maximize2, Upload } from 'lucide-react'
import Button from '@/components/shared/Button'
import ConnectionStatus from '@/components/shared/ConnectionStatus'
import TranscriptFeed from '@/components/live-session/TranscriptFeed'
import ActionItemPanel from '@/components/live-session/ActionItemPanel'
import LiveSummary from '@/components/live-session/LiveSummary'
import Loader from '@/components/shared/Loader'
import useWebSocket from '@/hooks/useWebSocket'
import { meetingAPI } from '@/services/api'

const LiveMeeting = () => {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  
  const [isLoading, setIsLoading] = useState(true)
  const [transcripts, setTranscripts] = useState([])
  const [actionItems, setActionItems] = useState([])
  const [summaryPoints, setSummaryPoints] = useState([])
  const [meetingStatus, setMeetingStatus] = useState('connecting')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Get JWT token from localStorage (for WebSocket authentication)
  const authToken = localStorage.getItem('token') || 'demo-token'

  // WebSocket connection for real-time updates
  const { connectionStatus, isConnected } = useWebSocket(meetingId, authToken, {
    onConnected: () => {
      console.log('WebSocket connected')
      setMeetingStatus('connected')
      setIsLoading(false)
    },
    onTranscript: (segment) => {
      console.log('Received transcript segment:', segment)
      setTranscripts(prev => [...prev, segment])
    },
    onStatus: (status, details) => {
      console.log('Status update:', status, details)
      setMeetingStatus(status)
      
      // Handle processing stages
      if (details?.stage) {
        console.log(`Processing stage: ${details.stage}`)
      }
    },
    onSummary: (summary, actionItemsData) => {
      console.log('Received summary and action items')
      
      if (summary) {
        // Parse summary points (assuming they come as line-separated text)
        const points = summary.split('\n').filter(p => p.trim())
        setSummaryPoints(points)
      }
      
      if (actionItemsData) {
        setActionItems(actionItemsData)
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error)
      setMeetingStatus('error')
    }
  })

  useEffect(() => {
    // Initialize meeting status on mount
    const initializeMeeting = async () => {
      try {
        setIsLoading(true)
        const response = await meetingAPI.getMeetingStatus(meetingId)
        setMeetingStatus(response.data.status)
        
        // Load existing transcripts and action items
        const transcriptRes = await meetingAPI.getLiveTranscript(meetingId)
        if (transcriptRes.data.transcript) {
          setTranscripts(transcriptRes.data.transcript)
        }

        const actionsRes = await meetingAPI.getActionItems(meetingId)
        if (actionsRes.data.action_items) {
          setActionItems(actionsRes.data.action_items)
        }
      } catch (err) {
        console.error('Failed to initialize meeting:', err)
      } finally {
        // Loading will be set to false by WebSocket onConnected callback
        // or after initial data fetch
        if (!isConnected) {
          setIsLoading(false)
        }
      }
    }

    initializeMeeting()
  }, [meetingId, isConnected])

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file')
      return
    }

    setIsUploading(true)
    setMeetingStatus('processing')
    
    try {
      const response = await meetingAPI.uploadAudio(meetingId, file, 'en')
      console.log('Audio uploaded successfully:', response.data)
      
      // WebSocket will handle real-time updates during processing
      // No need to poll - updates will come via onTranscript, onStatus, onSummary callbacks
      
      alert('Audio uploaded! Processing in real-time via WebSocket.')
    } catch (err) {
      console.error('Failed to upload audio:', err)
      alert('Failed to process audio. Please try again.')
      setMeetingStatus('error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleEndMeeting = async () => {
    try {
      await meetingAPI.endMeeting(meetingId)
      navigate(`/report/${meetingId}`)
    } catch (err) {
      console.error('Failed to end meeting:', err)
    }
  }

  const handleToggleAction = (actionId) => {
    setActionItems(prev =>
      prev.map(item =>
        item.id === actionId ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const handleAddAction = (text) => {
    const newAction = {
      id: Date.now(),
      text,
      completed: false,
      timestamp: new Date().toISOString(),
    }
    setActionItems(prev => [...prev, newAction])
  }

  const handleDeleteAction = (actionId) => {
    setActionItems(prev => prev.filter(item => item.id !== actionId))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="xl" text="Connecting to meeting..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Control Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 relative">
        {/* Connection Status - Top Right */}
        <div className="absolute top-3 right-4 z-10">
          <ConnectionStatus status={connectionStatus} />
        </div>
        
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Meeting ID: {meetingId}</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleUploadClick}
              isLoading={isUploading}
              leftIcon={<Upload className="w-4 h-4" />}
              className="text-white"
            >
              {isUploading ? 'Processing...' : 'Upload Audio'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white"
              leftIcon={<Settings className="w-4 h-4" />}
            >
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white"
              leftIcon={<Maximize2 className="w-4 h-4" />}
            >
              Fullscreen
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleEndMeeting}
              leftIcon={<PhoneOff className="w-4 h-4" />}
            >
              End Meeting
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-[1920px] mx-auto grid grid-cols-12 gap-4 p-4">
          {/* Left Panel - Transcript Feed (40%) */}
          <div className="col-span-5 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <TranscriptFeed transcripts={transcripts} isLive={true} />
          </div>

          {/* Center Panel - Summary (30%) */}
          <div className="col-span-4 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 h-full overflow-y-auto custom-scrollbar">
              <LiveSummary summaryPoints={summaryPoints} />
            </div>
          </div>

          {/* Right Panel - Action Items (30%) */}
          <div className="col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <ActionItemPanel
              actionItems={actionItems}
              onToggle={handleToggleAction}
              onAdd={handleAddAction}
              onDelete={handleDeleteAction}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveMeeting
