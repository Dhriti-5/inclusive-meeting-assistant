import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, FileText, Download, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import Card from '@/components/shared/Card'
import Button from '@/components/shared/Button'
import Badge from '@/components/shared/Badge'
import Loader from '@/components/shared/Loader'
import { formatTimestamp, formatDuration } from '@/utils/helpers'
import { meetingAPI } from '@/services/api'

const MeetingHistory = () => {
  const [meetings, setMeetings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMeetingHistory()
  }, [])

  const fetchMeetingHistory = async () => {
    try {
      setIsLoading(true)
      const response = await meetingAPI.getMeetingHistory()
      setMeetings(response.data.meetings || [])
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
      processing: { variant: 'warning', icon: AlertCircle, text: 'Processing' },
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
