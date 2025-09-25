"use client"

import React from 'react'
import { Target } from 'lucide-react'
import { ChartProps } from './types'

interface RadarChartProps extends ChartProps {
  showGrid?: boolean
  showPoints?: boolean
  showLabels?: boolean
  maxAxes?: number
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  config = {},
  className = '',
  showGrid = true,
  showPoints = true,
  showLabels = true,
  maxAxes = 8,
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config
  
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const range = maxValue - minValue
  
  // Limit axes for better visualization
  const displayData = {
    labels: labels.slice(0, maxAxes),
    values: values.slice(0, maxAxes)
  }
  
  const centerX = 150
  const centerY = 150
  const radius = 60
  const numAxes = displayData.labels.length
  
  // Calculate points for radar chart
  const calculatePoints = () => {
    return displayData.values.map((value, index) => {
      const angle = (index * 2 * Math.PI) / numAxes - Math.PI / 2
      const normalizedValue = range > 0 ? (value - minValue) / range : 0.5
      const pointRadius = radius * normalizedValue
      
      return {
        x: centerX + pointRadius * Math.cos(angle),
        y: centerY + pointRadius * Math.sin(angle),
        value,
        label: displayData.labels[index],
        angle
      }
    })
  }

  const points = calculatePoints()
  
  // Generate path for the radar area
  const generateAreaPath = () => {
    if (points.length === 0) return ''
    
    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ')
    
    return `${pathData} Z`
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
            {!title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">Radar Chart</h3>}
            <p className="text-xs text-slate-500">{displayData.labels.length} dimensions</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{maxValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Peak Value</div>
        </div>
      </div>
      
      {/* Radar Chart */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <div className="relative w-80 h-80">
            <svg className="w-full h-full" viewBox="0 0 300 300">
              <defs>
                <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4"/>
                </linearGradient>
                <filter id="radarGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Grid circles */}
              {showGrid && [0.2, 0.4, 0.6, 0.8, 1].map((scale, index) => (
                <circle
                  key={index}
                  cx={centerX}
                  cy={centerY}
                  r={radius * scale}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.1"
                  className="text-slate-400"
                />
              ))}
              
              {/* Grid lines */}
              {showGrid && points.map((_, index) => {
                const angle = (index * 2 * Math.PI) / numAxes - Math.PI / 2
                const endX = centerX + radius * Math.cos(angle)
                const endY = centerY + radius * Math.sin(angle)
                
                return (
                  <line
                    key={index}
                    x1={centerX}
                    y1={centerY}
                    x2={endX}
                    y2={endY}
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.1"
                    className="text-slate-400"
                  />
                )
              })}
              
              {/* Area */}
              <path
                d={generateAreaPath()}
                fill="url(#radarGradient)"
                opacity="0.3"
                filter="url(#radarGlow)"
                className="drop-shadow-sm"
              />
              
              {/* Border line */}
              <path
                d={generateAreaPath()}
                fill="none"
                stroke="url(#radarGradient)"
                strokeWidth="2"
                filter="url(#radarGlow)"
                className="drop-shadow-sm"
              />
              
              {/* Data points */}
              {showPoints && points.map((point, index) => (
                <g 
                  key={index}
                  className="cursor-pointer"
                  onClick={() => onDataPointClick?.({ label: point.label, value: point.value }, index)}
                  onMouseEnter={() => onDataPointHover?.({ label: point.label, value: point.value }, index)}
                >
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="white"
                    stroke="#4f46e5"
                    strokeWidth="2"
                    className="drop-shadow-md hover:r-6 transition-all duration-200"
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="2"
                    fill="#4f46e5"
                  />
                </g>
              ))}
              
              {/* Axis labels */}
              {showLabels && points.map((point, index) => {
                const labelRadius = radius + 20
                const labelX = centerX + labelRadius * Math.cos(point.angle)
                const labelY = centerY + labelRadius * Math.sin(point.angle)
                
                return (
                  <text
                    key={index}
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium fill-slate-600 dark:fill-slate-300"
                  >
                    {point.label}
                  </text>
                )
              })}
            </svg>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Dimension Values</div>
        <div className="grid grid-cols-2 gap-2">
          {points.map((point, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              onClick={() => onDataPointClick?.({ label: point.label, value: point.value }, index)}
              onMouseEnter={() => onDataPointHover?.({ label: point.label, value: point.value }, index)}
            >
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {point.label}
              </span>
              <span className="text-sm text-slate-500">
                {point.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
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
