import React, { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import Card from '@/components/shared/Card'
import Button from '@/components/shared/Button'
import { meetingAPI } from '@/services/api'

const ChatPanel = ({ meetingId }) => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAvailable, setIsAvailable] = useState(null)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    checkAvailability()
  }, [meetingId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkAvailability = async () => {
    try {
      const response = await meetingAPI.checkRAGHealth(meetingId)
      setIsAvailable(response.data.indexed)
      if (!response.data.indexed) {
        setError('This meeting has not been processed yet. Chat will be available after analysis completes.')
      }
    } catch (err) {
      console.error('Failed to check RAG availability:', err)
      setError('Unable to check chat availability')
      setIsAvailable(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputValue.trim() || isLoading || !isAvailable) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await meetingAPI.chatWithMeeting(meetingId, inputValue)
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources || [],
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Chat error:', err)
      const errorMessage = {
        id: Date.now() + 1,
        role: 'error',
        content: err.response?.data?.detail || 'Failed to get response. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Chat with Meeting
          </h3>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-sm">
          {isAvailable === null ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : isAvailable ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">Ready</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-600 dark:text-yellow-400">Not Available</span>
            </>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && !isAvailable && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Ask a question about this meeting
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
              Try asking: "What did we discuss about the budget?" or "What were the main action items?"
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.role === 'error'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                
                {/* Sources/Citations */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Sources:
                    </div>
                    <div className="space-y-2">
                      {message.sources.map((source, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {source.speakers?.join(', ') || 'Unknown'}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {formatTimestamp(source.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">{source.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading || !isAvailable}
          placeholder={isAvailable ? "Ask a question about this meeting..." : "Chat not available yet"}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   placeholder-gray-400 dark:placeholder-gray-500
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Button
          type="submit"
          disabled={!inputValue.trim() || isLoading || !isAvailable}
          className="px-4"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>
    </Card>
  )
}

export default ChatPanel
