import clsx from 'clsx'

/**
 * Utility function for merging class names
 */
export const cn = (...inputs) => {
  return clsx(inputs)
}

/**
 * Format duration from seconds to readable string
 */
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Extract meeting ID from various meeting URLs
 */
export const extractMeetingId = (url) => {
  // Google Meet: meet.google.com/abc-defg-hij
  const meetMatch = url.match(/meet\.google\.com\/([a-z-]+)/i)
  if (meetMatch) return meetMatch[1]

  // Zoom: zoom.us/j/123456789
  const zoomMatch = url.match(/zoom\.us\/j\/(\d+)/i)
  if (zoomMatch) return zoomMatch[1]

  return null
}

/**
 * Validate meeting URL
 */
export const isValidMeetingUrl = (url) => {
  const patterns = [
    /meet\.google\.com\/[a-z-]+/i,
    /zoom\.us\/j\/\d+/i,
  ]
  return patterns.some(pattern => pattern.test(url))
}

/**
 * Generate speaker color based on speaker name
 */
export const getSpeakerColor = (speaker) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500',
  ]
  
  const index = speaker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

/**
 * Get speaker initials
 */
export const getSpeakerInitials = (speaker) => {
  if (!speaker) return '??'
  
  const parts = speaker.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return speaker.substring(0, 2).toUpperCase()
}

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
