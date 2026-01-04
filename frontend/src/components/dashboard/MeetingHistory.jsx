import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, FileText, Download, Calendar, CheckCircle2, AlertCircle, Upload } from 'lucide-react'
import Card from '@/components/shared/Card'
import Button from '@/components/shared/Button'
import Badge from '@/components/shared/Badge'
import Loader from '@/components/shared/Loader'
import { formatTimestamp, formatDuration } from '@/utils/helpers'
import { meetingAPI } from '@/services/api'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const MeetingHistory = () => {
  const [meetings, setMeetings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasProcessing, setHasProcessing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMeetingHistory()
  }, [])
  
  useEffect(() => {
    // Only set up auto-refresh if there are processing/recording meetings
    if (!hasProcessing) return
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing due to processing meetings...')
      fetchMeetingHistory()
    }, 15000) // Every 15 seconds (not too frequent)
    
    return () => clearInterval(interval)
  }, [hasProcessing])

  const fetchMeetingHistory = async () => {
    try {
      setIsLoading(true)
      const response = await meetingAPI.getMeetingHistory()
      const fetchedMeetings = response.data.meetings || []
      setMeetings(fetchedMeetings)
      
      // Check if any meetings are still processing
      const processing = fetchedMeetings.some(m => m.status === 'processing' || m.status === 'recording')
      setHasProcessing(processing)
      
      if (processing) {
        console.log('Found processing meetings, will auto-refresh')
      } else {
        console.log('No processing meetings, auto-refresh disabled')
      }
    } catch (err) {
      setError('Failed to load meeting history')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewSummary = (meetingId) => {
    navigate(`/report/${meetingId}`)
  }

  const handleDownloadPDF = async (meetingId, meetingTitle) => {
    try {
      const response = await meetingAPI.downloadPDF(meetingId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${meetingTitle}-summary.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Failed to download PDF:', err)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { variant: 'success', icon: CheckCircle2, text: 'Completed' },
      processing: { variant: 'warning', icon: AlertCircle, text: 'Processing...' },
      recording: { variant: 'info', icon: AlertCircle, text: 'Waiting for Upload' },
      failed: { variant: 'danger', icon: AlertCircle, text: 'Failed' },
    }

    const config = statusConfig[status] || statusConfig.completed
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    )
  }

  const handleUploadAudio = async (meetingId) => {
    // Show instructions first
    const shouldProceed = window.confirm(
      '📁 Upload Audio File\n\n' +
      'The audio file should be in:\n' +
      'C:\\Users\\Pc\\Deep Learning Specialization\\inclusive-meeting-assistant\\recordings\\\n\n' +
      'File name format:\n' +
      `meeting_${meetingId}_YYYYMMDD_HHMMSS.wav\n\n` +
      'Or if you recorded manually:\n' +
      '- OBS recordings: Usually in Videos folder\n' +
      '- Game Bar: Videos\\Captures folder\n' +
      '- Any .wav, .mp3, or .mp4 file with meeting audio\n\n' +
      'Click OK to select the file.'
    )
    
    if (!shouldProceed) return
    
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*,video/*'
    
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      try {
        const formData = new FormData()
        formData.append('audio', file)
        
        const token = localStorage.getItem('token')
        
        alert('⏳ Uploading audio file... This may take a minute.')
        
        await axios.post(
          `${API_BASE_URL}/api/meetings/${meetingId}/upload-audio`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        
        alert('✅ Audio uploaded successfully! Processing will start now.\n\nRefresh the page in a few minutes to see the results.')
        fetchMeetingHistory()
      } catch (error) {
        console.error('Error uploading audio:', error)
        alert('❌ Failed to upload audio. Please try again.\n\nError: ' + (error.response?.data?.detail || error.message))
      }
    }
    
    input.click()
  }

  if (isLoading) {
    return (
      <Card className="mt-10">
        <Loader text="Loading meeting history..." />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mt-10">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={fetchMeetingHistory} variant="primary" className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  if (meetings.length === 0) {
    return (
      <Card className="mt-10">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No meetings yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Join your first meeting to get started with InclusiveMeet
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Recent Meetings
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {meetings.length} total meetings
        </span>
      </div>

      <div className="grid gap-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id} hover className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {meeting.title || 'Untitled Meeting'}
                  </h3>
                  {getStatusBadge(meeting.status)}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatTimestamp(meeting.startTime)}</span>
                  </div>
                  {meeting.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(meeting.duration)}</span>
                    </div>
                  )}
                  {meeting.participants && (
                    <span>{meeting.participants} participants</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {meeting.status === 'recording' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUploadAudio(meeting.id)}
                    leftIcon={<Upload className="w-4 h-4" />}
                  >
                    Upload Audio
                  </Button>
                )}
                {meeting.status === 'completed' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSummary(meeting.id)}
                      leftIcon={<FileText className="w-4 h-4" />}
                    >
                      View Summary
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadPDF(meeting.id, meeting.title)}
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      PDF
                    </Button>
                  </>
                )}
                {meeting.status === 'processing' && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Generating summary...
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default MeetingHistory
