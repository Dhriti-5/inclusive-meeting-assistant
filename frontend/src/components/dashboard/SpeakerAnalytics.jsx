import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Users, Clock } from 'lucide-react'
import Card from '@/components/shared/Card'

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

const SpeakerAnalytics = ({ transcript = [] }) => {
  // Calculate speaking time per speaker
  const speakerData = useMemo(() => {
    if (!transcript || transcript.length === 0) return []
    
    const speakerStats = {}
    
    // Aggregate speaking time per speaker
    transcript.forEach((segment) => {
      const speaker = segment.speaker || 'Unknown'
      const duration = segment.end - segment.start || 0
      
      if (!speakerStats[speaker]) {
        speakerStats[speaker] = {
          name: speaker,
          totalTime: 0,
          segments: 0
        }
      }
      
      speakerStats[speaker].totalTime += duration
      speakerStats[speaker].segments += 1
    })
    
    // Convert to array and calculate percentages
    const totalTime = Object.values(speakerStats).reduce((sum, s) => sum + s.totalTime, 0)
    
    return Object.values(speakerStats)
      .map(speaker => ({
        ...speaker,
        percentage: totalTime > 0 ? (speaker.totalTime / totalTime * 100) : 0,
        formattedTime: formatDuration(speaker.totalTime)
      }))
      .sort((a, b) => b.totalTime - a.totalTime)
  }, [transcript])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.formattedTime} ({data.percentage.toFixed(1)}%)
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {data.segments} segments
          </p>
        </div>
      )
    }
    return null
  }

  if (speakerData.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          Speaker Analytics
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No speaker data available
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        Speaker Participation
      </h3>

      {/* Pie Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={speakerData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="totalTime"
            >
              {speakerData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Speaker List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          Speaking Time Breakdown
        </h4>
        {speakerData.map((speaker, index) => (
          <div
            key={speaker.name}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {speaker.name}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {speaker.formattedTime}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {speaker.percentage.toFixed(1)}% • {speaker.segments} segments
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total Speakers:</span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
              {speakerData.length}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total Segments:</span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
              {speakerData.reduce((sum, s) => sum + s.segments, 0)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default SpeakerAnalytics
