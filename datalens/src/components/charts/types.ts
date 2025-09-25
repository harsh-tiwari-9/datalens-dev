// Chart Data Types
export interface ChartDataPoint {
  label: string
  value: number
  [key: string]: any
}

export interface ChartData {
  labels: string[]
  values: number[]
  datasets?: Array<{
    label: string
    data: number[]
    color?: string
  }>
  metadata?: {
    total?: number
    average?: number
    min?: number
    max?: number
    trend?: 'up' | 'down' | 'stable'
  }
}

export interface ChartConfig {
  type?: string
  title?: string
  subtitle?: string
  showLegend?: boolean
  showGrid?: boolean
  showTooltips?: boolean
  colors?: string[]
  height?: number
  width?: number
  responsive?: boolean
  animation?: boolean
  theme?: 'light' | 'dark'
}

export interface ChartProps {
  data: ChartData
  config?: ChartConfig
  className?: string
  onDataPointClick?: (dataPoint: ChartDataPoint, index: number) => void
  onDataPointHover?: (dataPoint: ChartDataPoint, index: number) => void
}

// Chart-specific interfaces
export interface TimeSeriesDataPoint extends ChartDataPoint {
  timestamp: Date
  value: number
}

export interface ScatterDataPoint {
  x: number
  y: number
  size?: number
  label?: string
  color?: string
}

export interface HeatmapDataPoint {
  x: string
  y: string
  value: number
  color?: string
}

export interface FunnelStage {
  label: string
  value: number
  percentage: number
  color?: string
}

export interface TreemapNode {
  name: string
  value: number
  children?: TreemapNode[]
  color?: string
}

export interface RadarDataPoint {
  axis: string
  value: number
  maxValue?: number
}

export interface BubbleDataPoint {
  x: number
  y: number
  size: number
  label: string
  color?: string
}
