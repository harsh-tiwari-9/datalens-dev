"use client"

import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { ChartProps } from './types'

interface EChartsAreaChartProps extends ChartProps {
  showPoints?: boolean
  showGrid?: boolean
  smooth?: boolean
  showTrend?: boolean
  gradient?: boolean
  maxDataPoints?: number
}

export const EChartsAreaChart: React.FC<EChartsAreaChartProps> = ({
  data,
  config = {},
  className = '',
  showPoints = true,
  showGrid = true,
  smooth = true,
  showTrend = true,
  gradient = true,
  maxDataPoints = 10000,
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
    const trend = optimizedData.values.length > 1 
      ? optimizedData.values[optimizedData.values.length - 1] - optimizedData.values[0]
      : 0
    
    return { maxValue, minValue, avgValue, trend }
  }, [optimizedData.values])

  // ECharts configuration
  const option = useMemo(() => {
    return {
      title: {
        text: title || 'Area Chart',
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
          const dataPoint = params[0]
          const value = dataPoint.value
          const label = optimizedData.labels[dataPoint.dataIndex]
          
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${label}</div>
              <div style="color: #4f46e5; font-size: 18px; font-weight: bold;">${value.toLocaleString()}</div>
              <div style="color: #666; font-size: 12px; margin-top: 4px;">
                Index: #${dataPoint.dataIndex + 1}
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
      series: [
        {
          name: 'Value',
          type: 'line',
          data: optimizedData.values,
          smooth: smooth,
          symbol: showPoints ? 'circle' : 'none',
          symbolSize: 6,
          lineStyle: {
            width: 3,
            color: '#4f46e5'
          },
          itemStyle: {
            color: '#4f46e5',
            borderColor: '#fff',
            borderWidth: 2
          },
          areaStyle: gradient ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(79, 70, 229, 0.6)' },
                { offset: 1, color: 'rgba(79, 70, 229, 0.1)' }
              ]
            }
          } : {
            color: 'rgba(79, 70, 229, 0.3)'
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: '#4f46e5',
              borderColor: '#fff',
              borderWidth: 3,
              shadowBlur: 10,
              shadowColor: 'rgba(79, 70, 229, 0.5)'
            }
          }
        }
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      backgroundColor: 'transparent'
    }
  }, [optimizedData, title, subtitle, theme, showPoints, showGrid, smooth, gradient])

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
            {optimizedData.values.length}
          </div>
          <div className="text-xs text-slate-500">Data Points</div>
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
