"use client"

import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { ChartProps } from './types'

interface EChartsPieChartProps extends ChartProps {
  showLegend?: boolean
  showCenterValue?: boolean
  maxSlices?: number
  innerRadius?: number
  outerRadius?: number
}

export const EChartsPieChart: React.FC<EChartsPieChartProps> = ({
  data,
  config = {},
  className = '',
  showLegend = true,
  showCenterValue = true,
  maxSlices = 10,
  innerRadius = 0,
  outerRadius = 80,
  onDataPointClick,
  onDataPointHover
}) => {
  const { labels, values, metadata } = data
  const { title, subtitle, theme = 'light' } = config

  // Optimize data for performance
  const optimizedData = useMemo(() => {
    if (values.length > maxSlices) {
      console.warn(`Large dataset detected (${values.length} slices). Limiting to ${maxSlices} slices for performance.`)
      
      // Sort by value and take top N, group others as "Others"
      const sortedData = labels.map((label, index) => ({ label, value: values[index] }))
        .sort((a, b) => b.value - a.value)
      
      const topData = sortedData.slice(0, maxSlices - 1)
      const othersData = sortedData.slice(maxSlices - 1)
      const othersValue = othersData.reduce((sum, item) => sum + item.value, 0)
      
      const result = [...topData]
      if (othersValue > 0) {
        result.push({ label: 'Others', value: othersValue })
      }
      
      return {
        labels: result.map(item => item.label),
        values: result.map(item => item.value)
      }
    }
    
    return { labels, values }
  }, [labels, values, maxSlices])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = optimizedData.values.reduce((sum, val) => sum + val, 0)
    const maxValue = Math.max(...optimizedData.values)
    const avg = total / optimizedData.values.length
    
    return { total, maxValue, avg }
  }, [optimizedData.values])

  // Prepare data for ECharts
  const chartData = useMemo(() => {
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
        text: title || 'Pie Chart',
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
          const percentage = ((params.value / stats.total) * 100).toFixed(1)
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${params.name}</div>
              <div style="color: #4f46e5; font-size: 18px; font-weight: bold;">${params.value.toLocaleString()}</div>
              <div style="color: #666; font-size: 12px; margin-top: 4px;">
                ${percentage}% of total
              </div>
            </div>
          `
        }
      },
      legend: showLegend ? {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
        textStyle: {
          color: theme === 'dark' ? '#ccc' : '#666'
        }
      } : undefined,
      series: [
        {
          name: 'Data',
          type: 'pie',
          radius: [`${innerRadius}%`, `${outerRadius}%`],
          center: ['50%', '50%'],
          data: chartData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            formatter: (params: any) => {
              const percentage = ((params.value / stats.total) * 100).toFixed(1)
              return `${params.name}\n${percentage}%`
            },
            fontSize: 12,
            color: theme === 'dark' ? '#ccc' : '#666'
          },
          labelLine: {
            show: true
          },
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: (idx: number) => idx * 100
        }
      ],
      backgroundColor: 'transparent'
    }
  }, [chartData, title, subtitle, theme, showLegend, innerRadius, outerRadius, stats.total])

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
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.total.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Total Value</div>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {optimizedData.labels.length}
          </div>
          <div className="text-xs text-slate-500">Categories</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.maxValue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Largest</div>
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
