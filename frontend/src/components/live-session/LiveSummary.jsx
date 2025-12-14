import React from 'react'
import { Sparkles, TrendingUp } from 'lucide-react'
import Card from '@/components/shared/Card'

const LiveSummary = ({ summaryPoints = [] }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-accent-600 dark:text-accent-400" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Live Summary</h3>
      </div>

      {summaryPoints.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            AI summary will appear as the meeting progresses...
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {summaryPoints.map((point, index) => (
            <Card key={index} className="p-4 border-l-4 border-accent-500">
              <div className="flex gap-3">
                <TrendingUp className="w-5 h-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                    {point.text}
                  </p>
                  {point.timestamp && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(point.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default LiveSummary
