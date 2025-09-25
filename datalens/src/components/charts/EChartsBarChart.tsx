"use client"

import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { ChartProps } from './types'

interface EChartsBarChartProps extends ChartProps {
  orientation?: 'vertical' | 'horizontal'
  showTrend?: boolean
  showPercentage?: boolean
  maxBars?: number
}

export const EChartsBarChart: React.FC<EChartsBarChartProps> = ({
  data,
  config = {},
  className = '',
  orientation = 'vertical',
  showTrend = true,
  showPercentage = true,
  maxBars = 20,
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config

  // Optimize data for performance
  const optimizedData = useMemo(() => {
    if (values.length > maxBars) {
      console.warn(`Large dataset detected (${values.length} bars). Limiting to ${maxBars} bars for performance.`)
      
      // Sort by value and take top N
      const sortedData = labels.map((label, index) => ({ label, value: values[index] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, maxBars)
      
      return {
        labels: sortedData.map(item => item.label),
        values: sortedData.map(item => item.value)
      }
    }
    
    return { labels, values }
  }, [labels, values, maxBars])

  // Calculate statistics
  const stats = useMemo(() => {
    const maxValue = Math.max(...optimizedData.values)
    const total = optimizedData.values.reduce((sum, val) => sum + val, 0)
    const avg = total / optimizedData.values.length
    const trend = optimizedData.values.length > 1 
      ? optimizedData.values[optimizedData.values.length - 1] - optimizedData.values[0]
      : 0
    
    return { maxValue, total, avg, trend }
  }, [optimizedData.values])

  // ECharts configuration
  const option = useMemo(() => {
    return {
      title: {
        text: title || 'Bar Chart',
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
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: theme === 'dark' ? '#333' : '#ccc',
        textStyle: {
          color: theme === 'dark' ? '#fff' : '#333'
        },
        formatter: (params: any) => {
          const dataPoint = params[0]
          const value = dataPoint.value
          const label = optimizedData.labels[dataPoint.dataIndex]
          const percentage = ((value / stats.total) * 100).toFixed(1)
          
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${label}</div>
              <div style="color: #4f46e5; font-size: 18px; font-weight: bold;">${value.toLocaleString()}</div>
              <div style="color: #666; font-size: 12px; margin-top: 4px;">
                ${percentage}% of total
              </div>
            </div>
          `
        }
      },
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
        }
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
        }
      },
      series: [
        {
          name: 'Value',
          type: 'bar',
          data: optimizedData.values,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#4f46e5' },
                { offset: 1, color: '#8b5cf6' }
              ]
          },
          borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#6366f1' },
                  { offset: 1, color: '#a855f7' }
                ]
              },
              shadowBlur: 10,
              shadowColor: 'rgba(79, 70, 229, 0.5)'
            }
          },
          animationDelay: (idx: number) => idx * 100
        }
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      backgroundColor: 'transparent'
    }
  }, [optimizedData, title, subtitle, theme, stats.total])

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
            {stats.avg.toFixed(1)}
          </div>
          <div className="text-xs text-slate-500">Average</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.total.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Total</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {optimizedData.labels.length}
          </div>
          <div className="text-xs text-slate-500">Categories</div>
        </div>
      </div>

      {/* ECharts Container */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <ReactECharts
          option={option}
          style={{ height: '400px', width: '100%' }}
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
