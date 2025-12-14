import React, { useRef, useEffect, useState } from 'react'
import { Video, VideoOff, Camera } from 'lucide-react'
import Badge from '@/components/shared/Badge'

const SignLanguageCam = ({ isActive = false, detectedSign = null }) => {
  const videoRef = useRef(null)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isActive) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => stopCamera()
  }, [isActive])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setHasPermission(true)
        setError(null)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please grant permission.')
      setHasPermission(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setHasPermission(false)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Sign Language Detection</h3>
        </div>
        {isActive && hasPermission && (
          <Badge variant="success" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full recording-pulse"></div>
            Active
          </Badge>
        )}
      </div>

      {/* Video Feed */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center p-6">
            <VideoOff className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : !isActive ? (
          <div className="text-center p-6">
            <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Camera is off</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Sign Detection Overlay */}
            {detectedSign && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border-2 border-primary-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Detected Sign</p>
                      <p className="text-4xl font-bold text-white">{detectedSign.letter}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">Confidence</p>
                      <p className="text-2xl font-bold text-green-400">
                        {Math.round(detectedSign.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recording Indicator */}
            <div className="absolute top-4 right-4">
              <div className="bg-red-500 px-3 py-1 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full recording-pulse"></div>
                <span className="text-white text-sm font-medium">REC</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Status Bar */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>ASL Detection Active</span>
          {detectedSign && (
            <span className="font-medium text-primary-600 dark:text-primary-400">
              Last: {detectedSign.letter}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default SignLanguageCam
