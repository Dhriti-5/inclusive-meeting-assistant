import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, ArrowRight, Link as LinkIcon } from 'lucide-react'
import Card from '@/components/shared/Card'
import Button from '@/components/shared/Button'
import Input from '@/components/shared/Input'
import { isValidMeetingUrl, extractMeetingId } from '@/utils/helpers'
import { meetingAPI } from '@/services/api'

const JoinMeetingCard = () => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleJoin = async () => {
    setError('')
    
    if (!url.trim()) {
      setError('Please enter a meeting URL')
      return
    }

    if (!isValidMeetingUrl(url)) {
      setError('Please enter a valid Google Meet or Zoom URL')
      return
    }

    setIsLoading(true)
    try {
      // Create a new meeting session
      const response = await meetingAPI.joinMeeting('Live Meeting', url)
      const meetingId = response.data.meeting_id
      
      // Navigate to live meeting page
      navigate(`/meeting/${meetingId}`)
    } catch (err) {
      console.error('Failed to join meeting:', err)
      setError(err.response?.data?.error || 'Failed to join meeting. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleJoin()
    }
  }

  return (
    <Card className="max-w-2xl mx-auto mt-10 border-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
          <Video className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Launch Ora Assistant
        </h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Paste your Google Meet link below. <strong>Ora</strong> (the bot) will join as a guest 
        and provide real-time transcription, speaker diarization, and AI-powered insights.
      </p>

      {/* Important Notice */}
      <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              You must click "Admit" when prompted!
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              When "Ora wants to join" appears in your meeting, click <strong>Admit</strong> to let the bot enter and start recording.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          type="text"
          placeholder="meet.google.com/abc-xyz-123"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          error={error}
          leftIcon={<LinkIcon className="w-5 h-5" />}
          disabled={isLoading}
        />

        <Button 
          onClick={handleJoin}
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          {isLoading ? 'Sending Ora to Meeting...' : 'Send Ora to Join'}
        </Button>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          How it works:
        </h3>
        <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
            <span>Ora joins your Google Meet as a guest participant</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
            <span>You see "Ora wants to join" - click <strong>Admit</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">3</span>
            <span>Ora records audio and provides AI-powered insights</span>
          </li>
        </ol>
        
        <div className="mt-4 flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
            ✓ Google Meet Supported
          </span>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
            Zoom (Coming Soon)
          </span>
        </div>
      </div>
    </Card>
  )
}

export default JoinMeetingCard
