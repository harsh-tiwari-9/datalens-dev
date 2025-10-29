"use client"

import React from 'react'
import { ChartData, ChartConfig } from './types'
import { EChartsBarChart as BarChart } from './EChartsBarChart'
import { EChartsLineChart as LineChart } from './EChartsLineChart'
import { EChartsPieChart as PieChart } from './EChartsPieChart'
import { EChartsAreaChart as AreaChart } from './EChartsAreaChart'
import { EChartsScatterChart as ScatterChart } from './EChartsScatterChart'
import { EChartsHeatmapChart as HeatmapChart } from './EChartsHeatmapChart'
import { EChartsFunnelChart as FunnelChart } from './EChartsFunnelChart'
import { BigNumberChart } from './BigNumberChart'
import { EChartsTreemapChart as TreemapChart } from './EChartsTreemapChart'
import { EChartsRadarChart as RadarChart } from './EChartsRadarChart'
import { EChartsBubbleChart as BubbleChart } from './EChartsBubbleChart'
import { EChartsMultiLineChart as MultiLineChart } from './EChartsMultiLineChart'

interface ChartRendererProps {
  chartType: string
  data: ChartData
  config?: ChartConfig
  className?: string
  onDataPointClick?: (dataPoint: any, index: number) => void
  onDataPointHover?: (dataPoint: any, index: number) => void
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  chartType,
  data,
  config = {},
  className = '',
  onDataPointClick,
  onDataPointHover
}) => {
  // Validate data
  if (!data || !data.labels || !data.values || data.labels.length === 0 || data.values.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <div className="text-center">
          <div className="text-sm font-medium text-slate-500 mb-1">No data available</div>
          <div className="text-xs text-slate-400">
            Please ensure you have selected metrics and run the query
          </div>
        </div>
      </div>
    )
  }

  // Ensure labels and values have the same length
  const minLength = Math.min(data.labels.length, data.values.length)
  const normalizedData = {
    ...data,
    labels: data.labels.slice(0, minLength),
    values: data.values.slice(0, minLength)
  }

  const commonProps = {
    data: normalizedData,
    config,
    className,
    onDataPointClick,
    onDataPointHover
  }

  // Render chart based on type
  switch (chartType.toLowerCase()) {
    case 'bar-chart':
    case 'bar':
      return <BarChart {...commonProps} />
    
    case 'line-chart':
    case 'line':
      return <LineChart {...commonProps} />
    
    case 'pie-chart':
    case 'pie':
      return <PieChart {...commonProps} />
    
    case 'area-chart':
    case 'area':
      return <AreaChart {...commonProps} />
    
    case 'scatter-plot':
    case 'scatter':
      return <ScatterChart {...commonProps} />
    
    case 'heatmap':
      return <HeatmapChart {...commonProps} />
    
    case 'funnel-chart':
    case 'funnel':
      return <FunnelChart {...commonProps} />
    
    case 'big-number':
      return <BigNumberChart {...commonProps} />
    
    case 'time-series':
      return <LineChart {...commonProps} />
    
    case 'tree-map':
    case 'treemap':
      return <TreemapChart {...commonProps} />
    
    case 'radar-chart':
    case 'radar':
      return <RadarChart {...commonProps} />
    
    case 'bubble-chart':
    case 'bubble':
      return <BubbleChart {...commonProps} />
    
    case 'multi-line':
      return <MultiLineChart {...commonProps} />
    
    default:
      // Default to bar chart
      return <BarChart {...commonProps} />
  }
}
