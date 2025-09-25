"use client"

import React from 'react'
import { ChartDataPoint } from './types'

interface TooltipProps {
  dataPoint: ChartDataPoint
  index: number
  position: { x: number; y: number }
  visible: boolean
  chartType: string
  total?: number
  percentage?: number
}

export const Tooltip: React.FC<TooltipProps> = ({
  dataPoint,
  index,
  position,
  visible,
  chartType,
  total,
  percentage
}) => {
  if (!visible) return null

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toLocaleString()
  }

  return (
    <div
      className="absolute z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3 min-w-48 pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {chartType.replace('-', ' ').toUpperCase()}
        </span>
      </div>
      
      {/* Data Point Info */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 dark:text-slate-400">Label:</span>
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-32">
            {dataPoint.label}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 dark:text-slate-400">Value:</span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {formatValue(dataPoint.value)}
          </span>
        </div>
        
        {percentage !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Percentage:</span>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {percentage.toFixed(1)}%
            </span>
          </div>
        )}
        
        {total !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Total:</span>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {formatValue(total)}
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 dark:text-slate-400">Index:</span>
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            #{index + 1}
          </span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Click for more details
        </div>
      </div>
    </div>
  )
}
