"use client"

import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { ChartProps } from './types'

interface EChartsMultiLineChartProps extends ChartProps {
  showPoints?: boolean
  showGrid?: boolean
  smooth?: boolean
  showLegend?: boolean
  maxDataPoints?: number
  maxLines?: number
}

export const EChartsMultiLineChart: React.FC<EChartsMultiLineChartProps> = ({
  data,
  config = {},
  className = '',
  showPoints = true,
  showGrid = true,
  smooth = true,
  showLegend = true,
  maxDataPoints = 10000,
  maxLines = 10,
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config

  // Optimize data for performance
  const optimizedData = useMemo(() => {
    if (values.length > maxDataPoints) {
      console.warn(`Large dataset detected (${values.length} points). Sampling to ${maxDataPoints} points for performance.`)
      
      // Sample data for large datasets
      const step = Math.ceil(values.length / maxDataPoints)
      const sampledLabels = labels.filter((_, index) => index % step === 0)
      const sampledValues = values.filter((_, index) => index % step === 0)
      
      return {
        labels: sampledLabels,
        values: sampledValues
      }
    }
    
    return { labels, values }
  }, [labels, values, maxDataPoints])

  // Calculate statistics
  const stats = useMemo(() => {
    const maxValue = Math.max(...optimizedData.values)
    const minValue = Math.min(...optimizedData.values)
    const avgValue = optimizedData.values.reduce((sum, val) => sum + val, 0) / optimizedData.values.length
    const range = maxValue - minValue
    
    return { maxValue, minValue, avgValue, range }
  }, [optimizedData.values])

  // Prepare multi-line data
  const multiLineData = useMemo(() => {
    // For multi-line, we'll create multiple series based on the data
    // This is a simplified version - in a real app, you'd have multiple data series
    const series = []
    const colors = [
      '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ]
    
    // Create multiple lines by splitting the data
    const linesCount = Math.min(maxLines, 5) // Limit to 5 lines for performance
    const pointsPerLine = Math.ceil(optimizedData.values.length / linesCount)
    
    for (let i = 0; i < linesCount; i++) {
      const startIndex = i * pointsPerLine
      const endIndex = Math.min((i + 1) * pointsPerLine, optimizedData.values.length)
      const lineData = optimizedData.values.slice(startIndex, endIndex)
      const lineLabels = optimizedData.labels.slice(startIndex, endIndex)
      
      series.push({
        name: `Series ${i + 1}`,
        type: 'line',
        data: lineData,
        smooth: smooth,
        symbol: showPoints ? 'circle' : 'none',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: colors[i % colors.length]
        },
        itemStyle: {
          color: colors[i % colors.length]
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${colors[i % colors.length]}40` },
              { offset: 1, color: `${colors[i % colors.length]}10` }
            ]
          }
        }
      })
    }
    
    return series
  }, [optimizedData, maxLines, smooth, showPoints])

  // ECharts configuration
  const option = useMemo(() => {
    return {
      title: {
        text: title || 'Multi-Line Chart',
        subtext: subtitle,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: theme === 'dark' ? '#ffffff' : '#333333'
        },
        subtextStyle: {
          fontSize: 12,
          color: theme === 'dark' ? '#cccccc' : '#666666'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: theme === 'dark' ? '#333' : '#ccc',
        textStyle: {
          color: theme === 'dark' ? '#fff' : '#333'
        },
        formatter: (params: any) => {
          let result = `<div style="padding: 8px;">`
          params.forEach((param: any) => {
            result += `
              <div style="margin-bottom: 4px;">
                <span style="color: ${param.color}; font-weight: bold;">●</span>
                <span style="margin-left: 8px; font-weight: bold;">${param.seriesName}</span>
                <span style="color: #4f46e5; font-size: 16px; font-weight: bold; margin-left: 8px;">${param.value.toLocaleString()}</span>
              </div>
            `
          })
          result += `</div>`
          return result
        }
      },
      legend: showLegend ? {
        top: 'bottom',
        left: 'center',
        textStyle: {
          color: theme === 'dark' ? '#ccc' : '#666'
        }
      } : undefined,
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
        backgroundColor: 'transparent'
      },
      xAxis: {
        type: 'category',
        data: optimizedData.labels,
        axisLine: {
          lineStyle: {
            color: theme === 'dark' ? '#444' : '#ddd'
          }
        },
        axisLabel: {
          color: theme === 'dark' ? '#ccc' : '#666',
          rotate: optimizedData.labels.length > 10 ? 45 : 0
        },
        splitLine: showGrid ? {
          show: true,
          lineStyle: {
            color: theme === 'dark' ? '#333' : '#f0f0f0'
          }
        } : { show: false }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: theme === 'dark' ? '#444' : '#ddd'
          }
        },
        axisLabel: {
          color: theme === 'dark' ? '#ccc' : '#666'
        },
        splitLine: showGrid ? {
          show: true,
          lineStyle: {
            color: theme === 'dark' ? '#333' : '#f0f0f0'
          }
        } : { show: false }
      },
      series: multiLineData,
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      backgroundColor: 'transparent'
    }
  }, [multiLineData, title, subtitle, theme, showGrid, showLegend, optimizedData])

  // Event handlers
  const onChartClick = (params: any) => {
    if (onDataPointClick) {
      onDataPointClick(
        { 
          label: optimizedData.labels[params.dataIndex], 
          value: params.value 
        }, 
        params.dataIndex
      )
    }
  }

  const onChartMouseOver = (params: any) => {
    if (onDataPointHover) {
      onDataPointHover(
        { 
          label: optimizedData.labels[params.dataIndex], 
          value: params.value 
        }, 
        params.dataIndex
      )
    }
  }

  return (
    <div className={`w-full h-full ${className}`}>
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.maxValue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Peak Value</div>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.avgValue.toFixed(1)}
          </div>
          <div className="text-xs text-slate-500">Average</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.minValue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Minimum</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {multiLineData.length}
          </div>
          <div className="text-xs text-slate-500">Series</div>
        </div>
      </div>

      {/* ECharts Container */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <ReactECharts
          option={option}
          style={{ height: '500px', width: '100%' }}
          onEvents={{
            click: onChartClick,
            mouseover: onChartMouseOver
          }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </div>
  )
}
