import React from 'react'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import clsx from 'clsx'

const ConnectionStatus = ({ status = 'disconnected', className = '' }) => {
  const statusConfig = {
    connected: {
      icon: Wifi,
      label: 'Listening',
      color: 'bg-green-500',
      textColor: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    processing: {
      icon: Loader2,
      label: 'Processing',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      animate: true
    },
    connecting: {
      icon: Loader2,
      label: 'Connecting',
      color: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      animate: true
    },
    disconnected: {
      icon: WifiOff,
      label: 'Offline',
      color: 'bg-red-500',
      textColor: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400'
    },
    error: {
      icon: WifiOff,
      label: 'Error',
      color: 'bg-red-500',
      textColor: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400'
    }
  }

  const config = statusConfig[status] || statusConfig.disconnected
  const Icon = config.icon

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border',
        config.bgColor,
        config.borderColor,
        'transition-all duration-300',
        className
      )}
    >
      {/* Status Indicator Dot */}
      <div className="relative">
        <div className={clsx('w-2 h-2 rounded-full', config.color)} />
        {(status === 'connected' || status === 'processing') && (
          <div className={clsx(
            'absolute inset-0 w-2 h-2 rounded-full animate-ping',
            config.color,
            'opacity-75'
          )} />
        )}
      </div>

      {/* Icon */}
      <Icon
        className={clsx(
          'w-4 h-4',
          config.iconColor,
          config.animate && 'animate-spin'
        )}
      />

      {/* Label */}
      <span className={clsx('text-sm font-medium', config.textColor)}>
        {config.label}
      </span>
    </div>
  )
}

export default ConnectionStatus
