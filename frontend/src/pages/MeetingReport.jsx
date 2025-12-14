import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Download, Mail, FileText, 
  CheckCircle2, Clock, Users, Calendar 
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/shared/Button'
import Card from '@/components/shared/Card'
import Badge from '@/components/shared/Badge'
import Loader from '@/components/shared/Loader'
import Avatar from '@/components/shared/Avatar'
import { meetingAPI } from '@/services/api'
import { formatTimestamp, formatDuration } from '@/utils/helpers'

const MeetingReport = () => {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  
  const [isLoading, setIsLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchReport()
  }, [meetingId])

  const fetchReport = async () => {
    try {
      setIsLoading(true)
      const response = await meetingAPI.getMeetingReport(meetingId)
      setReport(response.data)
    } catch (err) {
      setError('Failed to load meeting report')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await meetingAPI.downloadPDF(meetingId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meeting-${meetingId}-summary.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Failed to download PDF:', err)
    }
  }

  const handleSendEmail = () => {
    // TODO: Implement email functionality
    alert('Email functionality coming soon!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="xl" text="Loading meeting report..." />
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md text-center">
            <FileText className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Report Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => navigate('/')} variant="primary">
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="mb-6"
        >
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {report.title || 'Meeting Summary'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatTimestamp(report.startTime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(report.duration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{report.participants?.length || 0} participants</span>
                </div>
              </div>
            </div>

            <Badge variant="success" size="lg">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Completed
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleDownloadPDF}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleSendEmail}
              leftIcon={<Mail className="w-4 h-4" />}
            >
              Email Report
            </Button>
          </div>
        </div>

        {/* Summary Section */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            Meeting Summary
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {report.summary || 'No summary available.'}
            </p>
          </div>
        </Card>

        {/* Action Items */}
        {report.actionItems && report.actionItems.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              Action Items ({report.actionItems.length})
            </h2>
            <div className="space-y-3">
              {report.actionItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {item.text || item}
                    </p>
                    {item.assignee && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Assigned to: {item.assignee}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Participants */}
        {report.participants && report.participants.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Participants ({report.participants.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {report.participants.map((participant, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-full"
                >
                  <Avatar speaker={participant} size="sm" />
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {participant}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Full Transcript */}
        {report.transcript && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Full Transcript
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {report.transcript.map((entry, index) => (
                <div key={index} className="flex gap-3">
                  <Avatar speaker={entry.speaker} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {entry.speaker}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {entry.timestamp}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {entry.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default MeetingReport
