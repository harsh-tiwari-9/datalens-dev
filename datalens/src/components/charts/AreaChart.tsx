    "use client"

import React from 'react'
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ChartProps } from './types'

interface AreaChartProps extends ChartProps {
  showPoints?: boolean
  showGrid?: boolean
  smooth?: boolean
  showTrend?: boolean
  gradient?: boolean
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  config = {},
  className = '',
  showPoints = true,
  showGrid = true,
  smooth = true,
  showTrend = true,
  gradient = true,
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config
  
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const range = maxValue - minValue
  const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length
  
  // Calculate trend
  const trend = values.length > 1 ? (values[values.length - 1] - values[0]) / values.length : 0
  
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="size-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="size-4 text-red-500" />
    return <Minus className="size-4 text-gray-500" />
  }
  
  const getTrendColor = () => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  // Generate SVG path for the area
  const generateAreaPath = () => {
    if (values.length === 0) return ''
    
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * 260 + 20
      const y = range > 0 ? 120 - ((value - minValue) / range) * 100 : 50
      return `${x},${y}`
    })
    
    const linePath = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point}`
    ).join(' ')
    
    return `${linePath} L ${(values.length - 1) / (values.length - 1) * 260 + 20} 120 L 20 120 Z`
  }

  // Generate line path
  const generateLinePath = () => {
    if (values.length === 0) return ''
    
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * 260 + 20
      const y = range > 0 ? 120 - ((value - minValue) / range) * 100 : 50
      return `${x},${y}`
    })
    
    return points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point}`
    ).join(' ')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Activity className="size-4 text-white" />
          </div>
          <div>
            {title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            {!title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">Area Chart</h3>}
            <p className="text-xs text-slate-500">
              {trend > 0 ? '↗️' : trend < 0 ? '↘️' : '→'} 
              {trend > 0 ? 'Increasing' : trend < 0 ? 'Decreasing' : 'Stable'} trend
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{avgValue.toFixed(1)}</div>
          <div className="text-xs text-slate-500">Average</div>
          {showTrend && (
            <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Chart */}
      <div className="relative h-40 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <svg className="w-full h-full" viewBox="0 0 300 120">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8"/>
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4"/>
            </linearGradient>
            <filter id="areaGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
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
          
          {/* Area */}
          {gradient && (
            <path
              d={generateAreaPath()}
              fill="url(#areaGradient)"
              filter="url(#areaGlow)"
              className="drop-shadow-sm"
            />
          )}
          
          {/* Line */}
          <path
            d={generateLinePath()}
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {showPoints && values.map((value, index) => {
            const x = (index / (values.length - 1)) * 260 + 20
            const y = range > 0 ? 120 - ((value - minValue) / range) * 100 : 50
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
                  r="3"
                  fill="white"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  className="drop-shadow-sm hover:r-4 transition-all duration-200"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#4f46e5"
                />
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
