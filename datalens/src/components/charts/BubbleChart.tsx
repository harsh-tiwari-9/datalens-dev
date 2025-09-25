"use client"

import React from 'react'
import { Target } from 'lucide-react'
import { ChartProps } from './types'

interface BubbleChartProps extends ChartProps {
  showGrid?: boolean
  showLabels?: boolean
  maxBubbles?: number
  sizeRange?: [number, number]
}

export const BubbleChart: React.FC<BubbleChartProps> = ({
  data,
  config = {},
  className = '',
  showGrid = true,
  showLabels = false,
  maxBubbles = 20,
  sizeRange = [4, 20],
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config
  
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const range = maxValue - minValue
  
  // Limit bubbles for better visualization
  const displayData = {
    labels: labels.slice(0, maxBubbles),
    values: values.slice(0, maxBubbles)
  }
  
  const colors = [
    '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'
  ]

  // Generate bubble positions and sizes
  const generateBubbles = () => {
    return displayData.values.map((value, index) => {
      // Simple positioning algorithm (in a real implementation, you'd use a proper bubble chart layout)
      const x = 20 + (index % 4) * 60 + Math.random() * 20
      const y = 20 + Math.floor(index / 4) * 60 + Math.random() * 20
      const normalizedValue = range > 0 ? (value - minValue) / range : 0.5
      const size = sizeRange[0] + (sizeRange[1] - sizeRange[0]) * normalizedValue
      const color = colors[index % colors.length]
      
      return {
        x,
        y,
        size,
        value,
        label: displayData.labels[index],
        color
      }
    })
  }

  const bubbles = generateBubbles()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Target className="size-4 text-white" />
          </div>
          <div>
            {title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            {!title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">Bubble Chart</h3>}
            <p className="text-xs text-slate-500">{displayData.labels.length} bubbles</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{maxValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Largest Bubble</div>
        </div>
      </div>
      
      {/* Bubble Chart */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <div className="relative h-64 w-full">
          <svg className="w-full h-full" viewBox="0 0 300 200">
            <defs>
              <filter id="bubbleGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Grid lines */}
            {showGrid && (
              <>
                {[0, 50, 100, 150, 200].map((y, i) => (
                  <line
                    key={`h-${i}`}
                    x1="0"
                    y1={y}
                    x2="300"
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    opacity="0.1"
                    className="text-slate-400"
                  />
                ))}
                {[0, 50, 100, 150, 200, 250, 300].map((x, i) => (
                  <line
                    key={`v-${i}`}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="200"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    opacity="0.1"
                    className="text-slate-400"
                  />
                ))}
              </>
            )}
            
            {/* Bubbles */}
            {bubbles.map((bubble, index) => (
              <g 
                key={index}
                className="cursor-pointer"
                onClick={() => onDataPointClick?.({ label: bubble.label, value: bubble.value }, index)}
                onMouseEnter={() => onDataPointHover?.({ label: bubble.label, value: bubble.value }, index)}
              >
                <circle
                  cx={bubble.x}
                  cy={bubble.y}
                  r={bubble.size}
                  fill={bubble.color}
                  opacity="0.7"
                  filter="url(#bubbleGlow)"
                  className="drop-shadow-sm hover:opacity-100 transition-opacity duration-200"
                />
                {showLabels && (
                  <text
                    x={bubble.x}
                    y={bubble.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium fill-white"
                  >
                    {bubble.value > 1000 ? `${(bubble.value/1000).toFixed(1)}k` : bubble.value}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>
      
      {/* Legend */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Bubble Details</div>
        <div className="grid grid-cols-2 gap-2">
          {bubbles.slice(0, 8).map((bubble, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 p-2 bg-white dark:bg-slate-700 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              onClick={() => onDataPointClick?.({ label: bubble.label, value: bubble.value }, index)}
              onMouseEnter={() => onDataPointHover?.({ label: bubble.label, value: bubble.value }, index)}
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: bubble.color }}
              ></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {bubble.label}
                </div>
                <div className="text-xs text-slate-500">
                  {bubble.value.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{minValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Smallest</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{maxValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Largest</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{bubbles.length}</div>
          <div className="text-xs text-slate-500">Bubbles</div>
        </div>
      </div>
    </div>
  )
}
