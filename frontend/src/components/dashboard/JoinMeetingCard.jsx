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
      const response = await meetingAPI.joinMeeting(url)
      const meetingId = response.data.meetingId || extractMeetingId(url)
      
      // Navigate to live meeting page
      navigate(`/meeting/${meetingId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join meeting. Please try again.')
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
          Start Inclusive Assistant
        </h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Paste your Google Meet or Zoom link below. The InclusiveBot will join automatically 
        and provide real-time transcription, sign language detection, and AI-powered insights.
      </p>

      <div className="space-y-4">
        <Input
          type="text"
          placeholder="meet.google.com/abc-xyz-123 or zoom.us/j/123456789"
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
          {isLoading ? 'Joining...' : 'Join Meeting Now'}
        </Button>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Supported Platforms:
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
            Google Meet
          </span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
            Zoom
          </span>
        </div>
      </div>
    </Card>
  )
}

export default JoinMeetingCard
