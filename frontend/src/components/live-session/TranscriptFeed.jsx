import React, { useEffect, useRef, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import Avatar from '@/components/shared/Avatar'
import { formatTimestamp } from '@/utils/helpers'

const TranscriptFeed = ({ transcripts = [], isLive = false }) => {
  const scrollRef = useRef(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcripts, autoScroll])

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    setAutoScroll(isAtBottom)
  }

  if (transcripts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No transcription yet</p>
        <p className="text-sm">Transcripts will appear here in real-time</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Live Transcription</h3>
        </div>
        {isLive && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full recording-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
          </div>
        )}
      </div>

      {/* Transcript List */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4"
      >
        {transcripts.map((transcript, index) => (
          <div key={index} className="flex gap-3 animate-fade-in">
            {transcript.isSignLanguage ? (
              // Sign Language Message - Special Styling
              <div className="w-full">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg p-4 border-2 border-primary-300 dark:border-primary-600">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-500 rounded-full p-2">
                      <span className="text-2xl">🤟</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-primary-700 dark:text-primary-300">
                          {transcript.speaker}
                        </span>
                        <span className="text-xs text-primary-600 dark:text-primary-400">
                          {formatTimestamp(transcript.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {transcript.text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Regular Transcript Message
              <>
                <Avatar speaker={transcript.speaker} size="md" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {transcript.speaker}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(transcript.timestamp)}
                    </span>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg rounded-tl-none p-3">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {transcript.text}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Auto-scroll indicator */}
      {!autoScroll && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => {
              setAutoScroll(true)
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight
              }
            }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium transition-all"
          >
            ↓ New messages
          </button>
        </div>
      )}
    </div>
  )
}

export default TranscriptFeed
