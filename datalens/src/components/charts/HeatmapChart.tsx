"use client"

import React, { useState, useRef } from 'react'
import { Map, Download, Settings, Maximize2, Filter, ZoomIn, ZoomOut } from 'lucide-react'
import { ChartProps } from './types'
import { Tooltip } from './Tooltip'

interface HeatmapChartProps extends ChartProps {
  showValues?: boolean
  showLegend?: boolean
  colorScheme?: 'red-green' | 'blue-yellow' | 'purple-orange'
  maxCells?: number
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  config = {},
  className = '',
  showValues = true,
  showLegend = true,
  colorScheme = 'red-green',
  maxCells = 16,
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config
  
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const range = maxValue - minValue
  
  // Limit cells for better visualization
  const displayData = {
    labels: labels.slice(0, maxCells),
    values: values.slice(0, maxCells)
  }
  
  const getColorClass = (value: number) => {
    const intensity = range > 0 ? (value - minValue) / range : 0.5
    
    switch (colorScheme) {
      case 'red-green':
        if (intensity > 0.7) return 'bg-red-500'
        if (intensity > 0.4) return 'bg-yellow-500'
        if (intensity > 0.1) return 'bg-green-500'
        return 'bg-slate-300'
      case 'blue-yellow':
        if (intensity > 0.7) return 'bg-blue-500'
        if (intensity > 0.4) return 'bg-yellow-500'
        if (intensity > 0.1) return 'bg-cyan-500'
        return 'bg-slate-300'
      case 'purple-orange':
        if (intensity > 0.7) return 'bg-purple-500'
        if (intensity > 0.4) return 'bg-orange-500'
        if (intensity > 0.1) return 'bg-pink-500'
        return 'bg-slate-300'
      default:
        return 'bg-slate-300'
    }
  }

  const getIntensityColor = (value: number) => {
    const intensity = range > 0 ? (value - minValue) / range : 0.5
    return `opacity-${Math.max(20, Math.min(100, Math.round(intensity * 80) + 20))}`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Map className="size-4 text-white" />
          </div>
          <div>
            {title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            {!title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">Heatmap</h3>}
            <p className="text-xs text-slate-500">{displayData.labels.length} data points</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-red-600">{maxValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Peak Value</div>
        </div>
      </div>
      
      {/* Heatmap Grid */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <div className="grid grid-cols-4 gap-1">
          {displayData.values.map((value, index) => {
            const intensity = range > 0 ? (value - minValue) / range : 0.5
            const colorClass = getColorClass(value)
            
            return (
              <div
                key={index}
                className={`h-8 rounded flex items-center justify-center text-xs font-medium text-white cursor-pointer hover:scale-105 transition-transform duration-200 ${colorClass}`}
                title={`${displayData.labels[index]}: ${value}`}
                onClick={() => onDataPointClick?.({ label: displayData.labels[index], value }, index)}
                onMouseEnter={() => onDataPointHover?.({ label: displayData.labels[index], value }, index)}
              >
                {showValues && Math.round(value)}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Legend */}
      {showLegend && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Intensity Scale</div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-500">Low</div>
            <div className="flex-1 flex gap-1">
              {[0, 0.25, 0.5, 0.75, 1].map((intensity, index) => {
                const value = minValue + (intensity * range)
                const colorClass = getColorClass(value)
                return (
                  <div
                    key={index}
                    className={`h-4 flex-1 rounded ${colorClass}`}
                    title={`${Math.round(value)}`}
                  />
                )
              })}
            </div>
            <div className="text-xs text-slate-500">High</div>
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
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{range.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Range</div>
        </div>
      </div>
    </div>
  )
}
