"use client"

import React from 'react'
import { BarChart3 } from 'lucide-react'
import { ChartProps } from './types'

interface TreemapChartProps extends ChartProps {
  showValues?: boolean
  showLabels?: boolean
  maxNodes?: number
  minSize?: number
}

export const TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  config = {},
  className = '',
  showValues = true,
  showLabels = true,
  maxNodes = 12,
  minSize = 4,
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config
  
  const total = values.reduce((sum, val) => sum + val, 0)
  const maxValue = Math.max(...values)
  
  // Limit nodes for better visualization
  const displayData = {
    labels: labels.slice(0, maxNodes),
    values: values.slice(0, maxNodes)
  }
  
  const colors = [
    'bg-indigo-500',
    'bg-blue-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-purple-500',
    'bg-gray-500',
    'bg-slate-500'
  ]

  // Calculate treemap layout (simplified grid layout)
  const calculateLayout = () => {
    const nodes = displayData.values.map((value, index) => ({
      label: displayData.labels[index],
      value,
      percentage: (value / total) * 100,
      color: colors[index % colors.length]
    })).sort((a, b) => b.value - a.value)

    // Simple grid layout
    const cols = Math.ceil(Math.sqrt(nodes.length))
    const rows = Math.ceil(nodes.length / cols)
    
    return nodes.map((node, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      const width = 100 / cols
      const height = 100 / rows
      
      return {
        ...node,
        x: col * width,
        y: row * height,
        width,
        height
      }
    })
  }

  const layout = calculateLayout()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="size-4 text-white" />
          </div>
          <div>
            {title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            {!title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">Tree Map</h3>}
            <p className="text-xs text-slate-500">Total: {total.toLocaleString()} records</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{maxValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Largest Node</div>
        </div>
      </div>
      
      {/* Treemap */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <div className="relative h-64 w-full">
          {layout.map((node, index) => (
            <div
              key={index}
              className={`absolute ${node.color} rounded border border-white dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity duration-200 flex flex-col justify-center items-center text-white text-xs font-medium`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: `${node.width}%`,
                height: `${node.height}%`,
                minHeight: `${minSize}rem`
              }}
              onClick={() => onDataPointClick?.({ label: node.label, value: node.value }, index)}
              onMouseEnter={() => onDataPointHover?.({ label: node.label, value: node.value }, index)}
            >
              {showLabels && (
                <div className="text-center p-1">
                  <div className="truncate max-w-full" title={node.label}>
                    {node.label}
                  </div>
                  {showValues && (
                    <div className="text-xs opacity-90">
                      {node.value.toLocaleString()}
                    </div>
                  )}
                  <div className="text-xs opacity-75">
                    {node.percentage.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Node Details</div>
        <div className="grid grid-cols-2 gap-2">
          {layout.slice(0, 8).map((node, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 p-2 bg-white dark:bg-slate-700 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              onClick={() => onDataPointClick?.({ label: node.label, value: node.value }, index)}
              onMouseEnter={() => onDataPointHover?.({ label: node.label, value: node.value }, index)}
            >
              <div className={`w-3 h-3 rounded ${node.color}`}></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {node.label}
                </div>
                <div className="text-xs text-slate-500">
                  {node.value.toLocaleString()} ({node.percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{total.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Total Value</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{layout.length}</div>
          <div className="text-xs text-slate-500">Nodes</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{maxValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Largest</div>
        </div>
      </div>
    </div>
  )
}
