"use client"

import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { ChartProps } from './types'

interface EChartsRadarChartProps extends ChartProps {
  showValues?: boolean
  showLabels?: boolean
  maxIndicators?: number
}

export const EChartsRadarChart: React.FC<EChartsRadarChartProps> = ({
  data,
  config = {},
  className = '',
  showValues = true,
  showLabels = true,
  maxIndicators = 10,
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config

  // Optimize data for performance
  const optimizedData = useMemo(() => {
    if (values.length > maxIndicators) {
      console.warn(`Large dataset detected (${values.length} indicators). Limiting to ${maxIndicators} indicators for performance.`)
      
      // Sort by value and take top N
      const sortedData = labels.map((label, index) => ({ label, value: values[index] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, maxIndicators)
      
      return {
        labels: sortedData.map(item => item.label),
        values: sortedData.map(item => item.value)
      }
    }
    
    return { labels, values }
  }, [labels, values, maxIndicators])

  // Calculate statistics
  const stats = useMemo(() => {
    const maxValue = Math.max(...optimizedData.values)
    const minValue = Math.min(...optimizedData.values)
    const avgValue = optimizedData.values.reduce((sum, val) => sum + val, 0) / optimizedData.values.length
    const range = maxValue - minValue
    
    return { maxValue, minValue, avgValue, range }
  }, [optimizedData.values])

  // Prepare radar data
  const radarData = useMemo(() => {
    return optimizedData.labels.map((label, index) => ({
      name: label,
      value: optimizedData.values[index],
      itemStyle: {
        color: `hsl(${(index * 137.5) % 360}, 70%, 60%)`
      }
    }))
  }, [optimizedData])

  // ECharts configuration
  const option = useMemo(() => {
    return {
      title: {
        text: title || 'Radar Chart',
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
        trigger: 'item',
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: theme === 'dark' ? '#333' : '#ccc',
        textStyle: {
          color: theme === 'dark' ? '#fff' : '#333'
        },
        formatter: (params: any) => {
          const percentage = ((params.value / stats.maxValue) * 100).toFixed(1)
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${params.name}</div>
              <div style="color: #4f46e5; font-size: 18px; font-weight: bold;">${params.value.toLocaleString()}</div>
              <div style="color: #666; font-size: 12px; margin-top: 4px;">
                ${percentage}% of max
              </div>
            </div>
          `
        }
      },
      radar: {
        indicator: optimizedData.labels.map(label => ({
          name: label,
          max: stats.maxValue
        })),
        axisName: {
          color: theme === 'dark' ? '#ccc' : '#666'
        },
        splitLine: {
          lineStyle: {
            color: theme === 'dark' ? '#444' : '#ddd'
          }
        },
        splitArea: {
          areaStyle: {
            color: theme === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)'
          }
        }
      },
      series: [
        {
          name: 'Data',
          type: 'radar',
          data: [
            {
              value: optimizedData.values,
              name: 'Values',
              itemStyle: {
                color: '#4f46e5'
              },
              areaStyle: {
                color: 'rgba(79, 70, 229, 0.3)'
              },
              lineStyle: {
                color: '#4f46e5',
                width: 3
              }
            }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(79, 70, 229, 0.5)'
            }
          },
          animation: true,
          animationDuration: 1000,
          animationEasing: 'cubicOut'
        }
      ],
      backgroundColor: 'transparent'
    }
  }, [radarData, title, subtitle, theme, optimizedData, stats.maxValue])

  // Event handlers
  const onChartClick = (params: any) => {
    if (onDataPointClick) {
      onDataPointClick(
        { 
          label: params.name, 
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
          label: params.name, 
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
            {optimizedData.labels.length}
          </div>
          <div className="text-xs text-slate-500">Indicators</div>
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
