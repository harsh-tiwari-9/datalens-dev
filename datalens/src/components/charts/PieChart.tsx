"use client"

import React from 'react'
import { PieChart as PieChartIcon } from 'lucide-react'
import { ChartProps } from './types'

interface PieChartProps extends ChartProps {
  showLegend?: boolean
  showCenterValue?: boolean
  maxSlices?: number
  innerRadius?: number
  outerRadius?: number
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  config = {},
  className = '',
  showLegend = true,
  showCenterValue = true,
  maxSlices = 8,
  innerRadius = 15,
  outerRadius = 35,
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config
  
  const total = values.reduce((sum, val) => sum + val, 0)
  if (total === 0) return <div className="text-center text-slate-500">No data</div>

  // Limit slices for better visualization
  const displayData = {
    labels: labels.slice(0, maxSlices),
    values: values.slice(0, maxSlices)
  }
  
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  ]

  let cumulativePercentage = 0

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
            <PieChartIcon className="size-4 text-white" />
          </div>
          <div>
            {title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            {!title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">Distribution Analysis</h3>}
            <p className="text-xs text-slate-500">Total: {total.toLocaleString()} records</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-pink-600">{displayData.labels.length}</div>
          <div className="text-xs text-slate-500">Categories</div>
        </div>
      </div>
      
      <div className="flex items-start gap-6">
        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
              <defs>
                {colors.map((color, index) => (
                  <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color.split(' ')[2]} stopOpacity="0.8"/>
                    <stop offset="100%" stopColor={color.split(' ')[5]} stopOpacity="0.6"/>
                  </linearGradient>
                ))}
                <filter id="pieGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {displayData.values.map((value, index) => {
                const percentage = (value / total) * 100
                const startAngle = cumulativePercentage * 3.6
                const endAngle = (cumulativePercentage + percentage) * 3.6
                cumulativePercentage += percentage

                const x1 = 50 + outerRadius * Math.cos((startAngle * Math.PI) / 180)
                const y1 = 50 + outerRadius * Math.sin((startAngle * Math.PI) / 180)
                const x2 = 50 + outerRadius * Math.cos((endAngle * Math.PI) / 180)
                const y2 = 50 + outerRadius * Math.sin((endAngle * Math.PI) / 180)
                const largeArcFlag = percentage > 50 ? 1 : 0

                const pathData = [
                  `M 50 50`,
                  `L ${x1} ${y1}`,
                  `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `Z`
                ].join(' ')

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={`url(#gradient-${index % colors.length})`}
                    filter="url(#pieGlow)"
                    className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => onDataPointClick?.({ label: displayData.labels[index], value }, index)}
                    onMouseEnter={() => onDataPointHover?.({ label: displayData.labels[index], value }, index)}
                  />
                )
              })}
              
              {/* Center circle */}
              <circle
                cx="50"
                cy="50"
                r={innerRadius}
                fill="white"
                className="drop-shadow-md"
              />
              {showCenterValue && (
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-bold fill-slate-700"
                >
                  {total > 1000 ? `${(total/1000).toFixed(1)}k` : total}
                </text>
              )}
            </svg>
          </div>
        </div>
        
        {/* Legend */}
        {showLegend && (
          <div className="space-y-2 flex-1">
            {displayData.labels.map((label, index) => {
              const value = displayData.values[index]
              const percentage = (value / total) * 100
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  onClick={() => onDataPointClick?.({ label, value }, index)}
                  onMouseEnter={() => onDataPointHover?.({ label, value }, index)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm" 
                      style={{ 
                        background: `linear-gradient(135deg, ${colors[index % colors.length].split(' ')[2]} 0%, ${colors[index % colors.length].split(' ')[5]} 100%)`
                      }}
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-32">
                      {label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {value.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
