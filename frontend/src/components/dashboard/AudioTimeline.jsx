import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import clsx from 'clsx'

const AudioTimeline = ({ transcript = [], audioUrl = null }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef(null)
  const timelineRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [audioUrl])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const seekTo = (time) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    setCurrentTime(time)
  }

  const handleTimelineClick = (e) => {
    const timeline = timelineRef.current
    if (!timeline) return

    const rect = timeline.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const time = percentage * duration
    seekTo(time)
  }

  const skip = (seconds) => {
    const audio = audioRef.current
    if (!audio) return
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    seekTo(newTime)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCurrentSegment = () => {
    return transcript.find(
      (segment) => currentTime >= segment.start && currentTime <= segment.end
    )
  }

  const currentSegment = getCurrentSegment()

  if (!audioUrl) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Audio playback not available for this meeting
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Current Segment Display */}
      {currentSegment && (
        <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">
              NOW PLAYING
            </span>
            <span className="text-xs text-primary-600 dark:text-primary-400">
              {formatTime(currentSegment.start)} - {formatTime(currentSegment.end)}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {currentSegment.speaker}:
            </span>
            <p className="text-gray-700 dark:text-gray-300 flex-1">
              {currentSegment.text}
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer mb-4 group"
        onClick={handleTimelineClick}
      >
        {/* Progress Bar */}
        <div
          className="absolute h-full bg-primary-600 dark:bg-primary-500 rounded-full transition-all"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />

        {/* Transcript Markers */}
        {transcript.map((segment, index) => (
          <div
            key={index}
            className="absolute top-0 h-full w-0.5 bg-gray-400 dark:bg-gray-500 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ left: `${(segment.start / duration) * 100}%` }}
            onClick={(e) => {
              e.stopPropagation()
              seekTo(segment.start)
            }}
            title={`${segment.speaker}: ${segment.text.substring(0, 50)}...`}
          />
        ))}

        {/* Playhead */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary-600 dark:bg-primary-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
        />
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => skip(-10)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Rewind 10s"
          >
            <SkipBack className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          <button
            onClick={togglePlayPause}
            className="p-3 rounded-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={() => skip(10)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Forward 10s"
          >
            <SkipForward className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${volume * 100}%, rgb(229, 231, 235) ${volume * 100}%, rgb(229, 231, 235) 100%)`
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default AudioTimeline
