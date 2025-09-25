"use client"

import React, { useState, useRef } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Minus, Filter, Download, Settings, Maximize2 } from 'lucide-react'
import { ChartProps } from './types'
import { Tooltip } from './Tooltip'

interface BarChartProps extends ChartProps {
  orientation?: 'vertical' | 'horizontal'
  showTrend?: boolean
  showPercentage?: boolean
  maxBars?: number
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  config = {},
  className = '',
  orientation = 'horizontal',
  showTrend = true,
  showPercentage = true,
  maxBars = 10,
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config
  
  // Enhanced state management
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'original'>('original')
  const [filteredData, setFilteredData] = useState<{labels: string[], values: number[]}>({ labels, values })
  const chartRef = useRef<HTMLDivElement>(null)
  
  // Enhanced data processing
  const processData = () => {
    let processedLabels = [...labels]
    let processedValues = [...values]
    
    // Apply sorting
    if (sortOrder !== 'original') {
      const sortedIndices = processedValues
        .map((value, index) => ({ value, index }))
        .sort((a, b) => sortOrder === 'asc' ? a.value - b.value : b.value - a.value)
      
      processedLabels = sortedIndices.map(item => processedLabels[item.index])
      processedValues = sortedIndices.map(item => item.value)
    }
    
    // Limit number of bars
    return {
      labels: processedLabels.slice(0, maxBars),
      values: processedValues.slice(0, maxBars)
    }
  }
  
  const displayData = processData()
  const maxValue = Math.max(...displayData.values)
  const total = displayData.values.reduce((sum, val) => sum + val, 0)
  const avg = total / displayData.values.length
  
  // Calculate trend
  const trend = displayData.values.length > 1 
    ? displayData.values[displayData.values.length - 1] - displayData.values[0]
    : 0
  
  // Enhanced event handlers
  const handleMouseEnter = (index: number, event: React.MouseEvent) => {
    setHoveredIndex(index)
    setTooltipPosition({ x: event.clientX, y: event.clientY })
    setShowTooltip(true)
    onDataPointHover?.({ label: displayData.labels[index], value: displayData.values[index] }, index)
  }
  
  const handleMouseLeave = () => {
    setHoveredIndex(null)
    setShowTooltip(false)
  }
  
  const handleClick = (index: number) => {
    onDataPointClick?.({ label: displayData.labels[index], value: displayData.values[index] }, index)
  }
  
  const handleSort = (order: 'asc' | 'desc' | 'original') => {
    setSortOrder(order)
  }
  
  const handleExport = () => {
    const csvContent = [
      ['Label', 'Value', 'Percentage'],
      ...displayData.labels.map((label, index) => [
        label,
        displayData.values[index].toString(),
        ((displayData.values[index] / total) * 100).toFixed(2) + '%'
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'chart'}_data.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  
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

  return (
    <div className={`space-y-4 ${className}`} ref={chartRef}>
      {/* Enhanced Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="size-4 text-white" />
          </div>
          <div>
            {title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            {!title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">Bar Chart</h3>}
            <p className="text-xs text-slate-500">Total: {total.toLocaleString()} records</p>
          </div>
        </div>
        
        {/* Enhanced Controls */}
        <div className="flex items-center gap-3">
          {/* Sort Controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => handleSort('original')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                sortOrder === 'original' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Original
            </button>
            <button
              onClick={() => handleSort('desc')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                sortOrder === 'desc' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              ↓ High
            </button>
            <button
              onClick={() => handleSort('asc')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                sortOrder === 'asc' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              ↑ Low
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleExport}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Export Data"
            >
              <Download className="size-4" />
            </button>
            <button
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="size-4" />
            </button>
            <button
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="size-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{maxValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Peak Value</div>
          {showTrend && (
            <div className={`flex items-center gap-1 text-xs ${getTrendColor()} mt-1`}>
              {getTrendIcon()}
              <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{avg.toFixed(1)}</div>
          <div className="text-xs text-slate-500">Average</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{total.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Total</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{displayData.labels.length}</div>
          <div className="text-xs text-slate-500">Categories</div>
        </div>
      </div>
      
      {/* Enhanced Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="space-y-4">
          {displayData.labels.map((label, index) => {
            const value = displayData.values[index]
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
            const valuePercentage = total > 0 ? (value / total) * 100 : 0
            const isAboveAverage = value > avg
            const isHovered = hoveredIndex === index
            
            return (
              <div 
                key={index} 
                className={`group cursor-pointer transition-all duration-200 ${
                  isHovered ? 'transform scale-[1.02]' : ''
                }`}
                onClick={() => handleClick(index)}
                onMouseEnter={(e) => handleMouseEnter(index, e)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      isAboveAverage 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg' 
                        : 'bg-gradient-to-r from-slate-400 to-slate-500'
                    } ${isHovered ? 'scale-110' : ''}`}></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-48">
                      {label}
                    </span>
                    {isHovered && (
                      <div className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {value.toLocaleString()}
                    </div>
                    {showPercentage && (
                      <div className="text-xs text-slate-500">
                        {valuePercentage.toFixed(1)}% of total
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        isAboveAverage 
                          ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' 
                          : 'bg-gradient-to-r from-slate-400 to-slate-500'
                      } ${isHovered ? 'shadow-lg' : ''}`}
                      style={{ 
                        width: `${percentage}%`,
                        animationDelay: `${index * 50}ms`,
                        boxShadow: isHovered ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none'
                      }}
                    />
                  </div>
                  {isHovered && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-100 transition-opacity duration-300 rounded-full"></div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Enhanced Tooltip */}
      {showTooltip && hoveredIndex !== null && (
        <Tooltip
          dataPoint={{ label: displayData.labels[hoveredIndex], value: displayData.values[hoveredIndex] }}
          index={hoveredIndex}
          position={tooltipPosition}
          visible={showTooltip}
          chartType="bar-chart"
          total={total}
          percentage={total > 0 ? (displayData.values[hoveredIndex] / total) * 100 : 0}
        />
      )}
    </div>
  )
}
