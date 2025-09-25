"use client"

import React from 'react'
import { LineChart as LineChartIcon } from 'lucide-react'
import { ChartProps } from './types'

interface MultiLineChartProps extends ChartProps {
  showPoints?: boolean
  showArea?: boolean
  showGrid?: boolean
  showLegend?: boolean
  maxLines?: number
}

export const MultiLineChart: React.FC<MultiLineChartProps> = ({
  data,
  config = {},
  className = '',
  showPoints = true,
  showArea = false,
  showGrid = true,
  showLegend = true,
  maxLines = 5,
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, datasets, metadata } = data
  const { title, subtitle, theme = 'light' } = config
  
  // If no datasets provided, create a single dataset from values
  const chartDatasets = datasets || [{
    label: 'Dataset 1',
    data: values,
    color: '#4f46e5'
  }].slice(0, maxLines)
  
  const allValues = chartDatasets.flatMap(ds => ds.data)
  const maxValue = Math.max(...allValues)
  const minValue = Math.min(...allValues)
  const range = maxValue - minValue
  
  const colors = [
    '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'
  ]

  // Generate SVG path for each line
  const generateLinePath = (dataset: any) => {
    if (dataset.data.length === 0) return ''
    
    const points = dataset.data.map((value: number, index: number) => {
      const x = (index / (dataset.data.length - 1)) * 260 + 20
      const y = range > 0 ? 120 - ((value - minValue) / range) * 100 : 50
      return `${x},${y}`
    })
    
    return points.map((point: string, index: number) => 
      `${index === 0 ? 'M' : 'L'} ${point}`
    ).join(' ')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <LineChartIcon className="size-4 text-white" />
          </div>
          <div>
            {title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            {!title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">Multi Line Chart</h3>}
            <p className="text-xs text-slate-500">{chartDatasets.length} datasets</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600">{maxValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Peak Value</div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="relative h-40 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <svg className="w-full h-full" viewBox="0 0 300 120">
          <defs>
            {colors.map((color, index) => (
              <linearGradient key={index} id={`lineGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
                <stop offset="50%" stopColor={color} stopOpacity="0.6"/>
                <stop offset="100%" stopColor={color} stopOpacity="0.4"/>
              </linearGradient>
            ))}
            <filter id="lineGlow">
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
          
          {/* Lines */}
          {chartDatasets.map((dataset, datasetIndex) => (
            <g key={datasetIndex}>
              <path
                d={generateLinePath(dataset)}
                stroke={dataset.color || colors[datasetIndex % colors.length]}
                strokeWidth="2"
                fill="none"
                filter="url(#lineGlow)"
                className="drop-shadow-sm"
              />
              
              {/* Data points */}
              {showPoints && dataset.data.map((value: number, pointIndex: number) => {
                const x = (pointIndex / (dataset.data.length - 1)) * 260 + 20
                const y = range > 0 ? 120 - ((value - minValue) / range) * 100 : 50
                
                return (
                  <g 
                    key={pointIndex}
                    className="cursor-pointer"
                    onClick={() => onDataPointClick?.({ label: labels[pointIndex] || `Point ${pointIndex}`, value }, pointIndex)}
                    onMouseEnter={() => onDataPointHover?.({ label: labels[pointIndex] || `Point ${pointIndex}`, value }, pointIndex)}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r="3"
                      fill="white"
                      stroke={dataset.color || colors[datasetIndex % colors.length]}
                      strokeWidth="2"
                      className="drop-shadow-sm hover:r-4 transition-all duration-200"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="1.5"
                      fill={dataset.color || colors[datasetIndex % colors.length]}
                    />
                  </g>
                )
              })}
            </g>
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      {showLegend && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Datasets</div>
          <div className="flex flex-wrap gap-3">
            {chartDatasets.map((dataset, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 p-2 bg-white dark:bg-slate-700 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                onClick={() => onDataPointClick?.({ label: dataset.label, value: Math.max(...dataset.data) }, index)}
                onMouseEnter={() => onDataPointHover?.({ label: dataset.label, value: Math.max(...dataset.data) }, index)}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: dataset.color || colors[index % colors.length] }}
                ></div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {dataset.label}
                </span>
                <span className="text-xs text-slate-500">
                  (Max: {Math.max(...dataset.data).toLocaleString()})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{chartDatasets.length}</div>
          <div className="text-xs text-slate-500">Datasets</div>
        </div>
      </div>
    </div>
  )
}
