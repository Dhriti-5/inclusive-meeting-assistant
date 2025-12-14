import React, { useState } from 'react'
import { CheckCircle2, Circle, ListTodo, Plus, Trash2 } from 'lucide-react'
import Button from '@/components/shared/Button'
import Card from '@/components/shared/Card'

const ActionItemPanel = ({ actionItems = [], onToggle, onAdd, onDelete }) => {
  const [newItemText, setNewItemText] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddItem = () => {
    if (newItemText.trim() && onAdd) {
      onAdd(newItemText.trim())
      setNewItemText('')
      setIsAdding(false)
    }
  }

  const completedCount = actionItems.filter(item => item.completed).length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Action Items</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add
          </Button>
        </div>
        
        {actionItems.length > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {completedCount} of {actionItems.length} completed
          </div>
        )}
      </div>

      {/* Action Items List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {/* Add New Item Form */}
        {isAdding && (
          <Card className="p-3 border-2 border-primary-500">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="Enter action item..."
              className="w-full px-3 py-2 bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={handleAddItem}>
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Existing Action Items */}
        {actionItems.length === 0 && !isAdding ? (
          <div className="text-center py-12">
            <ListTodo className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No action items yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              AI will automatically detect tasks from the conversation
            </p>
          </div>
        ) : (
          actionItems.map((item) => (
            <Card
              key={item.id}
              className={`p-4 transition-all duration-200 ${
                item.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggle && onToggle(item.id)}
                  className="mt-1 flex-shrink-0 text-primary-600 dark:text-primary-400 hover:scale-110 transition-transform"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      item.completed
                        ? 'line-through text-gray-500 dark:text-gray-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {item.text}
                  </p>
                  {item.assignee && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Assigned to: {item.assignee}
                    </p>
                  )}
                  {item.timestamp && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Added {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                {onDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* AI Detection Status */}
      <div className="p-3 bg-primary-50 dark:bg-primary-900/20 border-t border-primary-200 dark:border-primary-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full recording-pulse"></div>
          <p className="text-xs text-primary-700 dark:text-primary-300">
            AI is listening for action items...
          </p>
        </div>
      </div>
    </div>
  )
}

export default ActionItemPanel
