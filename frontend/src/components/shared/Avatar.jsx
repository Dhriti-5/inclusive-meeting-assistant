import React from 'react'
import { cn } from '@/utils/helpers'
import { getSpeakerInitials, getSpeakerColor } from '@/utils/helpers'

const Avatar = ({ speaker, size = 'md', className, showInitials = true }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }

  const colorClass = getSpeakerColor(speaker)
  const initials = getSpeakerInitials(speaker)

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white shadow-md',
        colorClass,
        sizes[size],
        className
      )}
      aria-label={`Avatar for ${speaker}`}
    >
      {showInitials && initials}
    </div>
  )
}

export default Avatar
