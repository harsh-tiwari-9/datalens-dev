"use client"

import React from 'react'
import { Target } from 'lucide-react'
import { ChartProps } from './types'

interface ScatterChartProps extends ChartProps {
  showTrendLine?: boolean
  showGrid?: boolean
  pointSize?: 'small' | 'medium' | 'large'
  showLabels?: boolean
}

export const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  config = {},
  className = '',
  showTrendLine = true,
  showGrid = true,
  pointSize = 'medium',
  showLabels = false,
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config
  
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const range = maxValue - minValue
  
  const getPointSize = () => {
    switch (pointSize) {
      case 'small': return 2
      case 'large': return 6
      default: return 4
    }
  }

  // Generate trend line
  const generateTrendLine = () => {
    if (values.length < 2) return ''
    
    const n = values.length
    const sumX = values.reduce((sum, _, index) => sum + index, 0)
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0)
    const sumXX = values.reduce((sum, _, index) => sum + (index * index), 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    const startY = range > 0 ? 120 - ((intercept - minValue) / range) * 100 : 50
    const endY = range > 0 ? 120 - ((slope * (n - 1) + intercept - minValue) / range) * 100 : 50
    
    return `M 20 ${startY} L ${260} ${endY}`
  }

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
            {!title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">Scatter Plot</h3>}
            <p className="text-xs text-slate-500">{values.length} data points</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{maxValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Peak Value</div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="relative h-40 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <svg className="w-full h-full" viewBox="0 0 300 120">
          <defs>
            <linearGradient id="scatterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6"/>
            </linearGradient>
            <filter id="scatterGlow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Grid lines */}
          {showGrid && [0, 25, 50, 75, 100].map((y, i) => (
            <line
              key={i}
              x1="20"
              y1={y + 10}
              x2="280"
              y2={y + 10}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.1"
              className="text-slate-400"
            />
          ))}
          
          {/* Trend line */}
          {showTrendLine && values.length > 1 && (
            <path
              d={generateTrendLine()}
              stroke="#4f46e5"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          )}
          
          {/* Data points */}
          {values.map((value, index) => {
            const x = (index / (values.length - 1)) * 260 + 20
            const y = range > 0 ? 120 - ((value - minValue) / range) * 100 : 50
            const size = Math.max(getPointSize(), Math.min(8, (value / maxValue) * 6 + getPointSize()))
            
            return (
              <g 
                key={index}
                className="cursor-pointer"
                onClick={() => onDataPointClick?.({ label: labels[index], value }, index)}
                onMouseEnter={() => onDataPointHover?.({ label: labels[index], value }, index)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={size}
                  fill="url(#scatterGradient)"
                  opacity="0.7"
                  filter="url(#scatterGlow)"
                  className="drop-shadow-sm hover:opacity-100 transition-opacity duration-200"
                />
                {showLabels && (
                  <text
                    x={x}
                    y={y - size - 5}
                    textAnchor="middle"
                    className="text-xs fill-slate-600 font-medium"
                  >
                    {value}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{minValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Minimum</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{maxValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Maximum</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{range.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Range</div>
        </div>
      </div>
    </div>
  )
}
