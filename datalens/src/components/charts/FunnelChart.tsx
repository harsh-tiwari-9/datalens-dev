"use client"

import React from 'react'
import { Zap } from 'lucide-react'
import { ChartProps } from './types'

interface FunnelChartProps extends ChartProps {
  showPercentages?: boolean
  showValues?: boolean
  orientation?: 'vertical' | 'horizontal'
  maxStages?: number
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  config = {},
  className = '',
  showPercentages = true,
  showValues = true,
  orientation = 'vertical',
  maxStages = 8,
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config
  
  const maxValue = Math.max(...values)
  
  // Limit stages for better visualization
  const displayData = {
    labels: labels.slice(0, maxStages),
    values: values.slice(0, maxStages)
  }
  
  const colors = [
    'bg-indigo-500',
    'bg-blue-500', 
    'bg-cyan-500',
    'bg-teal-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-orange-500',
    'bg-red-500'
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="size-4 text-white" />
          </div>
          <div>
            {title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            {!title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">Funnel Analysis</h3>}
            <p className="text-xs text-slate-500">{displayData.labels.length} stages</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{maxValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Peak Stage</div>
        </div>
      </div>
      
      {/* Funnel Chart */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <div className="space-y-1">
          {displayData.values.map((value, index) => {
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
            const width = Math.max(20, percentage)
            const colorClass = colors[index % colors.length]
            
            return (
              <div 
                key={index} 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                onClick={() => onDataPointClick?.({ label: displayData.labels[index], value }, index)}
                onMouseEnter={() => onDataPointHover?.({ label: displayData.labels[index], value }, index)}
              >
                <div className="text-xs w-16 truncate text-slate-600 dark:text-slate-400">
                  {displayData.labels[index]}
                </div>
                <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-4 relative overflow-hidden">
                  <div 
                    className={`${colorClass} h-4 rounded-full transition-all duration-300`}
                    style={{ width: `${width}%` }}
                  />
                  {showValues && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {value}
                    </div>
                  )}
                </div>
                {showPercentages && (
                  <div className="text-xs text-slate-500 w-12 text-right">
                    {percentage.toFixed(1)}%
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Conversion Analysis */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Conversion Analysis</div>
        <div className="space-y-2">
          {displayData.values.slice(0, -1).map((value, index) => {
            const nextValue = displayData.values[index + 1]
            const conversionRate = value > 0 ? ((nextValue / value) * 100) : 0
            const dropOff = value - nextValue
            
            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  {displayData.labels[index]} → {displayData.labels[index + 1]}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500">
                    {conversionRate.toFixed(1)}% conversion
                  </span>
                  <span className="text-red-500">
                    -{dropOff.toLocaleString()} drop-off
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{displayData.values[0]?.toLocaleString() || 0}</div>
          <div className="text-xs text-slate-500">Entry</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{displayData.values[displayData.values.length - 1]?.toLocaleString() || 0}</div>
          <div className="text-xs text-slate-500">Exit</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {displayData.values.length > 1 ? 
              ((displayData.values[displayData.values.length - 1] / displayData.values[0]) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-xs text-slate-500">Overall Conversion</div>
        </div>
      </div>
    </div>
  )
}
