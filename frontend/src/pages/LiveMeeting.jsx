import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PhoneOff, Settings, Maximize2 } from 'lucide-react'
import Button from '@/components/shared/Button'
import TranscriptFeed from '@/components/live-session/TranscriptFeed'
import SignLanguageCam from '@/components/live-session/SignLanguageCam'
import ActionItemPanel from '@/components/live-session/ActionItemPanel'
import LiveSummary from '@/components/live-session/LiveSummary'
import Loader from '@/components/shared/Loader'
import { meetingAPI } from '@/services/api'

const LiveMeeting = () => {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  
  const [isLoading, setIsLoading] = useState(true)
  const [transcripts, setTranscripts] = useState([])
  const [actionItems, setActionItems] = useState([])
  const [summaryPoints, setSummaryPoints] = useState([])
  const [detectedSign, setDetectedSign] = useState(null)
  const [meetingStatus, setMeetingStatus] = useState('connecting')

  useEffect(() => {
    initializeMeeting()
    const interval = setInterval(fetchLiveData, 2000) // Poll every 2 seconds
    return () => clearInterval(interval)
  }, [meetingId])

  const initializeMeeting = async () => {
    try {
      setIsLoading(true)
      const response = await meetingAPI.getMeetingStatus(meetingId)
      setMeetingStatus(response.data.status)
    } catch (err) {
      console.error('Failed to initialize meeting:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLiveData = async () => {
    try {
      // Fetch transcript updates
      const transcriptRes = await meetingAPI.getLiveTranscript(meetingId)
      if (transcriptRes.data.transcripts) {
        setTranscripts(transcriptRes.data.transcripts)
      }

      // Fetch action items
      const actionsRes = await meetingAPI.getActionItems(meetingId)
      if (actionsRes.data.actions) {
        setActionItems(actionsRes.data.actions)
      }

      // Update summary points (mock for now)
      // In production, this would come from the backend
    } catch (err) {
      console.error('Failed to fetch live data:', err)
    }
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
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full recording-pulse"></div>
              <span className="text-white font-medium">Recording in Progress</span>
            </div>
            <span className="text-gray-400 text-sm">Meeting ID: {meetingId}</span>
          </div>

          <div className="flex items-center gap-3">
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

          {/* Center Panel - Video & Sign Language (30%) */}
          <div className="col-span-4 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden h-[60%]">
              <SignLanguageCam 
                isActive={true} 
                detectedSign={detectedSign}
              />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 h-[38%] overflow-y-auto custom-scrollbar">
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
