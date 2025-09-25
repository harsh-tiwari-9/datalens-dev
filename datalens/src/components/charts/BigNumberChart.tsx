"use client"

import React from 'react'
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ChartProps } from './types'

interface BigNumberChartProps extends ChartProps {
  showTrend?: boolean
  showComparison?: boolean
  format?: 'number' | 'currency' | 'percentage'
  precision?: number
  prefix?: string
  suffix?: string
}

export const BigNumberChart: React.FC<BigNumberChartProps> = ({
  data,
  config = {},
  className = '',
  showTrend = true,
  showComparison = true,
  format = 'number',
  precision = 1,
  prefix = '',
  suffix = '',
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config
  
  const total = values.reduce((sum, val) => sum + val, 0)
  const avg = values.length > 0 ? total / values.length : 0
  const max = Math.max(...values)
  const min = Math.min(...values)
  
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

  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)
      case 'percentage':
        return `${value.toFixed(precision)}%`
      default:
        return `${prefix}${value.toLocaleString()}${suffix}`
    }
  }

  const formatCompactValue = (value: number) => {
    if (value >= 1000000) {
      return `${prefix}${(value / 1000000).toFixed(1)}M${suffix}`
    } else if (value >= 1000) {
      return `${prefix}${(value / 1000).toFixed(1)}K${suffix}`
    }
    return formatValue(value)
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
            {!title && <h3 className="font-semibold text-slate-900 dark:text-slate-100">Key Metric</h3>}
            <p className="text-xs text-slate-500">
              {trend > 0 ? '↗️' : trend < 0 ? '↘️' : '→'} 
              {trend > 0 ? 'Increasing' : trend < 0 ? 'Decreasing' : 'Stable'} trend
            </p>
          </div>
        </div>
        {showTrend && (
          <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{trend > 0 ? '+' : ''}{trend.toFixed(precision)}</span>
          </div>
        )}
      </div>
      
      {/* Main Metric */}
      <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
        <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
          {formatCompactValue(total)}
        </div>
        <div className="text-sm text-slate-500">Total Value</div>
        {showTrend && (
          <div className={`flex items-center justify-center gap-1 text-xs mt-2 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>Trend: {trend > 0 ? '+' : ''}{trend.toFixed(precision)} per period</span>
          </div>
        )}
      </div>
      
      {/* Detailed Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCompactValue(avg)}</div>
          <div className="text-sm text-slate-500">Average</div>
        </div>
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCompactValue(max)}</div>
          <div className="text-sm text-slate-500">Maximum</div>
        </div>
        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCompactValue(min)}</div>
          <div className="text-sm text-slate-500">Minimum</div>
        </div>
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{values.length}</div>
          <div className="text-sm text-slate-500">Data Points</div>
        </div>
      </div>
      
      {/* Comparison Stats */}
      {showComparison && values.length > 1 && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Performance Analysis</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500">Growth Rate</div>
              <div className={`font-bold ${getTrendColor()}`}>
                {trend > 0 ? '+' : ''}{((trend / avg) * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-slate-500">Volatility</div>
              <div className="font-bold text-slate-700 dark:text-slate-300">
                {((max - min) / avg * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
