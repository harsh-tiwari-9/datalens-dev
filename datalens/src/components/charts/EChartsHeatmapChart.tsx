"use client"

import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { ChartProps } from './types'

interface EChartsHeatmapChartProps extends ChartProps {
  showValues?: boolean
  showLegend?: boolean
  colorScheme?: 'red-green' | 'blue-yellow' | 'purple-orange'
  maxCells?: number
}

export const EChartsHeatmapChart: React.FC<EChartsHeatmapChartProps> = ({
  data,
  config = {},
  className = '',
  showValues = true,
  showLegend = true,
  colorScheme = 'red-green',
  maxCells = 1000,
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config

  // Optimize data for performance
  const optimizedData = useMemo(() => {
    if (values.length > maxCells) {
      console.warn(`Large dataset detected (${values.length} cells). Limiting to ${maxCells} cells for performance.`)
      
      // Sample data for large datasets
      const step = Math.ceil(values.length / maxCells)
      const sampledLabels = labels.filter((_, index) => index % step === 0)
      const sampledValues = values.filter((_, index) => index % step === 0)
      
      return {
        labels: sampledLabels,
        values: sampledValues
      }
    }
    
    return { labels, values }
  }, [labels, values, maxCells])

  // Calculate statistics
  const stats = useMemo(() => {
    const maxValue = Math.max(...optimizedData.values)
    const minValue = Math.min(...optimizedData.values)
    const avgValue = optimizedData.values.reduce((sum, val) => sum + val, 0) / optimizedData.values.length
    const range = maxValue - minValue
    
    return { maxValue, minValue, avgValue, range }
  }, [optimizedData.values])

  // Prepare heatmap data
  const heatmapData = useMemo(() => {
    const gridSize = Math.ceil(Math.sqrt(optimizedData.values.length))
    const data: any[] = []
    
    optimizedData.labels.forEach((label, index) => {
      const value = optimizedData.values[index]
      const x = index % gridSize
      const y = Math.floor(index / gridSize)
      
      data.push([x, y, value])
    })
    
    return data
  }, [optimizedData])

  // Get color scheme
  const getColorScheme = () => {
    switch (colorScheme) {
      case 'red-green':
        return ['#ff4444', '#ffaa44', '#ffff44', '#aaff44', '#44ff44']
      case 'blue-yellow':
        return ['#4444ff', '#44aaff', '#44ffff', '#aaff44', '#ffff44']
      case 'purple-orange':
        return ['#aa44ff', '#ff44aa', '#ffaa44', '#aaff44', '#44ffaa']
      default:
        return ['#ff4444', '#ffaa44', '#ffff44', '#aaff44', '#44ff44']
    }
  }

  // ECharts configuration
  const option = useMemo(() => {
    return {
      title: {
        text: title || 'Heatmap',
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
        position: 'top',
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: theme === 'dark' ? '#333' : '#ccc',
        textStyle: {
          color: theme === 'dark' ? '#fff' : '#333'
        },
        formatter: (params: any) => {
          const [x, y, value] = params.data
          const label = optimizedData.labels[x + y * Math.ceil(Math.sqrt(optimizedData.values.length))]
          
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${label || `Cell (${x}, ${y})`}</div>
              <div style="color: #4f46e5; font-size: 18px; font-weight: bold;">${value.toLocaleString()}</div>
              <div style="color: #666; font-size: 12px; margin-top: 4px;">
                Position: (${x}, ${y})
              </div>
            </div>
          `
        }
      },
      grid: {
        height: '50%',
        top: '10%'
      },
      xAxis: {
        type: 'category',
        splitArea: {
          show: true
        },
        axisLine: {
          lineStyle: {
            color: theme === 'dark' ? '#444' : '#ddd'
          }
        },
        axisLabel: {
          color: theme === 'dark' ? '#ccc' : '#666'
        }
      },
      yAxis: {
        type: 'category',
        splitArea: {
          show: true
        },
        axisLine: {
          lineStyle: {
            color: theme === 'dark' ? '#444' : '#ddd'
          }
        },
        axisLabel: {
          color: theme === 'dark' ? '#ccc' : '#666'
        }
      },
      visualMap: {
        min: stats.minValue,
        max: stats.maxValue,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%',
        inRange: {
          color: getColorScheme()
        },
        textStyle: {
          color: theme === 'dark' ? '#ccc' : '#666'
        }
      },
      series: [
        {
          name: 'Heatmap',
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: showValues,
            color: theme === 'dark' ? '#fff' : '#333'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      backgroundColor: 'transparent'
    }
  }, [heatmapData, title, subtitle, theme, showValues, stats, getColorScheme])

  // Event handlers
  const onChartClick = (params: any) => {
    if (onDataPointClick) {
      const [x, y, value] = params.data
      const label = optimizedData.labels[x + y * Math.ceil(Math.sqrt(optimizedData.values.length))]
      
      onDataPointClick(
        { 
          label: label || `Cell (${x}, ${y})`, 
          value: value 
        }, 
        x + y * Math.ceil(Math.sqrt(optimizedData.values.length))
      )
    }
  }

  const onChartMouseOver = (params: any) => {
    if (onDataPointHover) {
      const [x, y, value] = params.data
      const label = optimizedData.labels[x + y * Math.ceil(Math.sqrt(optimizedData.values.length))]
      
      onDataPointHover(
        { 
          label: label || `Cell (${x}, ${y})`, 
          value: value 
        }, 
        x + y * Math.ceil(Math.sqrt(optimizedData.values.length))
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
