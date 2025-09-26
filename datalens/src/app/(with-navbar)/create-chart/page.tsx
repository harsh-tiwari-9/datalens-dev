"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIotAnalyticsApi, useOnboardingApi } from "@/hooks/useApi"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Play, Save, MoreHorizontal, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { METRICS, DATASETS, Metric, Column } from "@/constants/chart-creation"
import { ChartRenderer } from "@/components/charts/ChartRenderer"
import { ChartData, ChartConfig } from "@/components/charts/types"

export default function CreateChartPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { request: apiRequest } = useIotAnalyticsApi()
  const { request: onboardingRequest } = useOnboardingApi()
  
  console.log('CreateChartPage component rendered')
  
  const [chartName, setChartName] = useState("")
  const [columns, setColumns] = useState<Column[]>([])
  const [selectedDataset, setSelectedDataset] = useState("")
  const [selectedChartType, setSelectedChartType] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editChartId, setEditChartId] = useState("")
  const [editQuery, setEditQuery] = useState("")
  
  // Chart configuration
  const [xAxis, setXAxis] = useState("")
  const [metrics, setMetrics] = useState<string[]>([])
  const [metricColumns, setMetricColumns] = useState<{[key: string]: string}>({})
  const [dimensions, setDimensions] = useState<string[]>([])
  const [filters, setFilters] = useState<string[]>([])
  const [rowLimit, setRowLimit] = useState(10000)
  const [sortBy, setSortBy] = useState("")
  
  // Chart preview
  const [chartData, setChartData] = useState<any[] | null>(null)
  const [queryResult, setQueryResult] = useState<any[] | null>(null)
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  
  // Timer state
  const [displayTime, setDisplayTime] = useState<string>("00:00:00.00")
  const queryStartTimeRef = useRef<number | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Memoized chart configuration to prevent re-renders
  const chartConfig: ChartConfig = useMemo(() => ({
    type: selectedChartType.toLowerCase(),
    title: chartName || `${selectedChartType} Chart`,
    subtitle: `Dataset: ${selectedDataset}`,
    showLegend: true,
    showGrid: true,
    showTooltips: true,
    theme: 'light'
  }), [selectedChartType, chartName, selectedDataset])

  useEffect(() => {
    const dataset = searchParams.get('dataset')
    const chartType = searchParams.get('chartType')
    const edit = searchParams.get('edit')
    const chartId = searchParams.get('chartId')
    const chartName = searchParams.get('chartName')
    const query = searchParams.get('query')
    const fromSqlLab = searchParams.get('fromSqlLab')
    
    console.log('Create Chart Page - Dataset:', dataset, 'ChartType:', chartType, 'Edit:', edit, 'FromSqlLab:', fromSqlLab)
    console.log('Current URL:', window.location.href)
    console.log('Search params:', searchParams.toString())
    
    // Handle SQL Lab mode
    if (fromSqlLab === 'true' && chartType && query) {
      setIsEditMode(false)
      setChartName(chartName ? decodeURIComponent(chartName) : '')
      setSelectedChartType(chartType)
      setEditQuery(decodeURIComponent(query))
      
      // Use the first available dataset as default for SQL Lab
      const defaultDataset = DATASETS[0] || 'druid-test'
      setSelectedDataset(defaultDataset)
      fetchColumns(defaultDataset)
      
      // Auto-execute the query from SQL Lab
      setTimeout(() => {
        executeEditQuery(decodeURIComponent(query))
      }, 1000)
    }
    // Handle edit mode
    else if (edit === 'true' && chartId && chartName && chartType) {
      setIsEditMode(true)
      setEditChartId(chartId)
      setChartName(decodeURIComponent(chartName))
      setSelectedChartType(chartType)
      if (query) {
        setEditQuery(decodeURIComponent(query))
      }
      
      // For edit mode, we need to determine the dataset from the query or use a default
      // Since we don't have dataset in the URL for edit mode, we'll use the first available dataset
      const defaultDataset = DATASETS[0] || 'druid-test'
      setSelectedDataset(defaultDataset)
      fetchColumns(defaultDataset)
      
      // Parse query and populate form fields in edit mode
      if (query) {
        parseQueryForEditMode(decodeURIComponent(query))
      }
      
      // Auto-execute the query in edit mode
      setTimeout(() => {
        if (query) {
          executeEditQuery(decodeURIComponent(query))
        }
      }, 1000)
    } else if (dataset && chartType) {
      setIsEditMode(false)
      setSelectedDataset(dataset)
      setSelectedChartType(chartType)
      fetchColumns(dataset)
    } else {
      console.log('Missing dataset or chartType, redirecting to home')
      router.push('/home')
    }
  }, [searchParams, router])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [])

  const fetchColumns = async (dataset: string) => {
    try {
      setLoading(true)
      const response = await apiRequest(`/jviz/analytics/druid/custom-list-keys?tableName=${dataset}`)
      if (response?.data?.list) {
        const columnList = response.data.list.map((col: string) => ({
          name: col,
          type: col.includes('__time') ? 'time' : col.includes('$') ? 'json' : 'string'
        }))
        setColumns(columnList)
      }
    } catch (error) {
      console.error('Error fetching columns:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseQueryForEditMode = useCallback((query: string) => {
    console.log('Parsing query for edit mode:', query)
    
    try {
      // Extract SELECT columns
      const selectMatch = query.match(/SELECT\s+(.*?)\s+FROM/i)
      if (selectMatch) {
        const selectClause = selectMatch[1]
        const columns = selectClause.split(',').map(col => col.trim().replace(/"/g, ''))
        
        // Find time-based columns
        const timeColumns = columns.filter(col => 
          col.includes('__time') || 
          col.includes('time_group') || 
          col.includes('TIME_FLOOR')
        )
        
        // Find metric columns (aggregations)
        const metricColumns = columns.filter(col => 
          col.includes('SUM(') || 
          col.includes('COUNT(') || 
          col.includes('AVG(') || 
          col.includes('MAX(') || 
          col.includes('MIN(') ||
          col.includes('total') ||
          col.includes('count')
        )
        
        // Set X-axis to first time column or first column
        if (timeColumns.length > 0) {
          const timeCol = timeColumns[0].replace(/TIME_FLOOR\(([^,]+).*\)/i, '$1').replace(/"/g, '')
          setXAxis(timeCol)
        } else if (columns.length > 0) {
          const firstCol = columns[0].replace(/TIME_FLOOR\(([^,]+).*\)/i, '$1').replace(/"/g, '')
          setXAxis(firstCol)
        }
        
        // Set dimensions (non-aggregated columns)
        const dimensionColumns = columns.filter(col => 
          !col.includes('SUM(') && 
          !col.includes('COUNT(') && 
          !col.includes('AVG(') && 
          !col.includes('MAX(') && 
          !col.includes('MIN(') &&
          !col.includes('TIME_FLOOR')
        ).map(col => col.replace(/"/g, ''))
        
        if (dimensionColumns.length > 0) {
          setDimensions(dimensionColumns)
        }
        
        // Set metrics based on aggregations found
        const foundMetrics: string[] = []
        if (columns.some(col => col.includes('COUNT('))) foundMetrics.push('COUNT')
        if (columns.some(col => col.includes('SUM('))) foundMetrics.push('SUM')
        if (columns.some(col => col.includes('AVG('))) foundMetrics.push('AVG')
        if (columns.some(col => col.includes('MAX('))) foundMetrics.push('MAX')
        if (columns.some(col => col.includes('MIN('))) foundMetrics.push('MIN')
        
        if (foundMetrics.length > 0) {
          setMetrics(foundMetrics)
        }
        
        console.log('Parsed query fields:', {
          xAxis,
          dimensions: dimensionColumns,
          metrics: foundMetrics,
          timeColumns,
          metricColumns
        })
      }
      
      // Extract WHERE conditions for filters
      const whereMatch = query.match(/WHERE\s+(.*?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|$)/i)
      if (whereMatch) {
        const whereClause = whereMatch[1]
        const filterColumns = whereClause.split('AND').map(condition => {
          const match = condition.match(/"([^"]+)"/)
          return match ? match[1] : null
        }).filter((col): col is string => col !== null)
        
        if (filterColumns.length > 0) {
          setFilters(filterColumns)
        }
      }
      
    } catch (error) {
      console.error('Error parsing query:', error)
    }
  }, [])

  const executeEditQuery = async (query: string) => {
    try {
      setLoading(true)
      startStopwatch()
      
      console.log('Executing edit query:', query)
      
      const response = await apiRequest('/jviz/analytics/druid/query', {
        method: 'POST',
        body: { queryBody: query }
      })
      
      console.log('Edit Query Response:', response)
      
      // Process the response data
      let processedData: any[] = []
      
      if (response && typeof response === 'object') {
        const data = response as any
        if (Array.isArray(data)) {
          processedData = data
        } else if (data?.data && Array.isArray(data.data)) {
          processedData = data.data
        }
      }
      
      // Performance optimization: Limit data size for UI
      const maxDataPoints = 10000
      if (processedData.length > maxDataPoints) {
        console.warn(`Large dataset detected (${processedData.length} rows). Limiting to ${maxDataPoints} rows for performance.`)
        processedData = processedData.slice(0, maxDataPoints)
      }
      
      // Use requestAnimationFrame to prevent UI blocking
      requestAnimationFrame(() => {
        setQueryResult(processedData)
        setChartData(processedData)
        console.log(`Edit query executed successfully. ${processedData.length} rows processed.`)
      })
      
      // Stop stopwatch
      stopStopwatch()
      console.log(`Edit query completed in ${displayTime}`)
      
    } catch (error) {
      console.error('Error executing edit query:', error)
      setQueryResult([])
      setChartData(null)
      
      // Stop stopwatch even on error
      stopStopwatch()
      console.log(`Edit query failed after ${displayTime}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDatasetChange = (newDataset: string) => {
    setSelectedDataset(newDataset)
    setColumns([]) // Clear existing columns
    setMetrics([]) // Clear selected metrics
    setDimensions([]) // Clear selected dimensions
    setFilters([]) // Clear selected filters
    fetchColumns(newDataset)
  }

  const handleMetricToggle = (metric: string) => {
    // Check if dimensions are selected before allowing metrics
    if (dimensions.length === 0 && !metrics.includes(metric)) {
      toast.error('Please select dimensions first before adding metrics')
      return
    }

    setMetrics(prev => {
      if (prev.includes(metric)) {
        // Remove metric and its column selection
        const newMetrics = prev.filter(m => m !== metric)
        const newMetricColumns = { ...metricColumns }
        delete newMetricColumns[metric]
        setMetricColumns(newMetricColumns)
        return newMetrics
      } else {
        // Add metric with default column selection from dimensions
        // Find the first non-string dimension for SUM/AVG metrics
        let defaultColumn = dimensions.length > 0 ? dimensions[0] : (xAxis || 'id')
        
        if (metric === 'SUM' || metric === 'AVG') {
          // For SUM/AVG, try to find a non-string dimension
          const nonStringDimension = dimensions.find(dim => {
            const columnInfo = columns.find(col => col.name === dim)
            return columnInfo?.type !== 'string' && columnInfo?.type !== 'json'
          })
          
          if (nonStringDimension) {
            defaultColumn = nonStringDimension
          } else {
            // If no non-string dimension found, use the first dimension but show warning
            const columnInfo = columns.find(col => col.name === defaultColumn)
            const isStringColumn = columnInfo?.type === 'string' || columnInfo?.type === 'json'
            
            if (isStringColumn) {
              toast.warning(`${metric} applied to string column "${defaultColumn}". Consider using COUNT, MAX, or MIN for better results.`)
            }
          }
        }
        
        setMetricColumns(prev => ({ ...prev, [metric]: defaultColumn }))
        return [...prev, metric]
      }
    })
  }

  const handleMetricColumnChange = (metric: string, column: string) => {
    // Check if metric is compatible with the selected column
    const columnInfo = columns.find(col => col.name === column)
    const isStringColumn = columnInfo?.type === 'string' || columnInfo?.type === 'json'
    
    if (isStringColumn && (metric === 'SUM' || metric === 'AVG')) {
      toast.warning(`${metric} applied to string column "${column}". Consider using COUNT, MAX, or MIN for better results.`)
    }
    
    setMetricColumns(prev => ({ ...prev, [metric]: column }))
  }

  const handleDimensionToggle = (column: string) => {
    setDimensions(prev => {
      const isAdding = !prev.includes(column)
      const newDimensions = isAdding 
        ? [...prev, column]
        : prev.filter(d => d !== column)
      
      // If adding a dimension and no metrics exist, add a default metric
      if (isAdding && metrics.length === 0) {
        setMetrics(['COUNT'])
        setMetricColumns(prev => ({ ...prev, 'COUNT': column }))
      }
      
      // If removing a dimension, remove any metrics that were using that column
      if (!isAdding) {
        const metricsToRemove = Object.entries(metricColumns)
          .filter(([_, col]) => col === column)
          .map(([metric, _]) => metric)
        
        if (metricsToRemove.length > 0) {
          setMetrics(prevMetrics => prevMetrics.filter(m => !metricsToRemove.includes(m)))
          const newMetricColumns = { ...metricColumns }
          metricsToRemove.forEach(metric => delete newMetricColumns[metric])
          setMetricColumns(newMetricColumns)
        }
      }
      
      // If all dimensions are cleared, clear all metrics
      if (newDimensions.length === 0) {
        setMetrics([])
        setMetricColumns({})
      }
      
      return newDimensions
    })
  }

  const handleFilterToggle = (column: string) => {
    setFilters(prev => 
      prev.includes(column) 
        ? prev.filter(f => f !== column)
        : [...prev, column]
    )
  }

  const handleDragStart = (columnName: string) => {
    setDraggedColumn(columnName)
  }

  const handleDragEnd = () => {
    setDraggedColumn(null)
  }

  const handleDrop = (target: 'dimensions' | 'filters' | 'xaxis', e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedColumn) return

    if (target === 'xaxis') {
      setXAxis(draggedColumn)
    } else if (target === 'dimensions') {
      if (!dimensions.includes(draggedColumn)) {
        setDimensions(prev => {
          const newDimensions = [...prev, draggedColumn]
          
          // If no metrics exist, add a default metric for this dimension
          if (metrics.length === 0) {
            setMetrics(['COUNT'])
            setMetricColumns(prev => ({ ...prev, 'COUNT': draggedColumn }))
          }
          
          return newDimensions
        })
      }
    } else if (target === 'filters') {
      if (!filters.includes(draggedColumn)) {
        setFilters(prev => [...prev, draggedColumn])
      }
    }
    setDraggedColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, target: string) => {
    e.preventDefault()
    setDragOverTarget(target)
  }

  const handleDragLeave = () => {
    setDragOverTarget(null)
  }

  // Format time display
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const ms = Math.floor((milliseconds % 1000) / 10) // Get centiseconds
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  // Start stopwatch
  const startStopwatch = () => {
    const startTime = Date.now()
    queryStartTimeRef.current = startTime
    setDisplayTime("00:00:00.00")
    
    // Clear any existing interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    
    // Update timer every 10ms for smooth display
    timerIntervalRef.current = setInterval(() => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      setDisplayTime(formatTime(elapsed))
    }, 10)
  }

  // Stop stopwatch
  const stopStopwatch = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }

  const generateQuery = () => {
    let query = "SELECT "
    const selectParts: string[] = []
    
    // Add X-axis (if specified) - this is the primary dimension
    if (xAxis) {
      if (xAxis.includes('$')) {
        // Handle JSON columns with JSON_VALUE
        selectParts.push(`JSON_VALUE("ext", '${xAxis}') as ${xAxis.replace(/[\[\].]/g, '_')}`)
      } else {
        selectParts.push(`"${xAxis}"`)
      }
    }
    
    // Add other dimensions (excluding x-axis to avoid duplication)
    const uniqueDimensions = dimensions.filter(d => d !== xAxis)
    if (uniqueDimensions.length > 0) {
      selectParts.push(...uniqueDimensions.map(d => {
        if (d.includes('$')) {
          // Handle JSON columns with JSON_VALUE
          return `JSON_VALUE("ext", '${d}') as ${d.replace(/[\[\].]/g, '_')}`
        } else {
          return `"${d}"`
        }
      }))
    }
    
    // Add metrics - these need to reference actual columns and dimensions
    if (metrics.length > 0 && dimensions.length > 0) {
      const metricExpressions = metrics.map(metric => {
        // For metrics, we need to specify which columns to aggregate
        // Use the metric column mapping to get the correct dimension column
        
        if (metric === "COUNT") {
          return "COUNT(*) as count_total"
        }
        
        // For other metrics (SUM, AVG, MAX, MIN), use the selected column from dimensions
        const metricColumn = metricColumns[metric] || dimensions[0]
        
        // Check if the column is a string type (not suitable for numeric aggregation)
        const columnInfo = columns.find(col => col.name === metricColumn)
        const isStringColumn = columnInfo?.type === 'string' || columnInfo?.type === 'json'
        
        if (isStringColumn && (metric === 'SUM' || metric === 'AVG')) {
          // For string columns, only allow COUNT, MAX, MIN
          console.warn(`Cannot apply ${metric} to string column ${metricColumn}. Using COUNT instead.`)
          toast.warning(`${metric} cannot be applied to string column "${metricColumn}". Using COUNT(*) instead.`)
          return "COUNT(*) as count_total"
        }
        
        // Handle JSON columns properly
        if (metricColumn.includes('$')) {
          // For JSON columns, use JSON_VALUE function
          // The column name is the path (e.g., "$[0].astID" -> "$[0].astID")
          // We need to use the full path as it appears in the column name
          return `${metric}(CAST(JSON_VALUE("ext", '${metricColumn}') AS DOUBLE)) as ${metric.toLowerCase()}_total`
        } else if (isStringColumn) {
          // For string columns, only allow COUNT, MAX, MIN
          if (metric === 'MAX' || metric === 'MIN') {
            return `${metric}("${metricColumn}") as ${metric.toLowerCase()}_total`
          } else {
            return "COUNT(*) as count_total"
          }
        } else {
          // For numeric columns, allow all aggregations
          return `${metric}("${metricColumn}") as ${metric.toLowerCase()}_total`
        }
      })
      selectParts.push(...metricExpressions)
    }
    
    // If no dimensions or metrics, add a basic count
    if (selectParts.length === 0) {
      selectParts.push("COUNT(*) as total_count")
    }
    
    query += selectParts.join(", ")
    query += ` FROM "${selectedDataset}"`
    
    // Add WHERE clause for filters
    const whereConditions: string[] = []
    
    // Add time-based filters if x-axis is a time column
    if (xAxis && xAxis.includes('__time')) {
      // Add default time range (last 30 days)
      whereConditions.push(`"${xAxis}" >= CURRENT_TIMESTAMP - INTERVAL '365' DAY`)
    }
    
    // Add column-based filters
    if (filters.length > 0) {
      const filterConditions = filters.map(filter => {
        // Basic filter - you might want to make this more sophisticated
        return `"${filter}" IS NOT NULL`
      })
      whereConditions.push(...filterConditions)
    }
    
    if (whereConditions.length > 0) {
      query += " WHERE " + whereConditions.join(" AND ")
    }
    
    // Add GROUP BY clause - only group by if we have aggregations AND dimensions
    if (metrics.length > 0 && dimensions.length > 0) {
      const groupByColumns = new Set<string>()
      
      // Add X-axis if it exists
      if (xAxis) {
        groupByColumns.add(xAxis)
      }
      
      // Add all dimensions (excluding x-axis to avoid duplicates)
      dimensions.forEach(d => {
        if (d !== xAxis) {
          groupByColumns.add(d)
        }
      })
      
      // Only add GROUP BY if we have columns to group by
      if (groupByColumns.size > 0) {
        const groupByList = Array.from(groupByColumns).map(col => {
          if (col.includes('$')) {
            // Handle JSON columns in GROUP BY
            return `JSON_VALUE("ext", '${col}')`
          } else {
            return `"${col}"`
          }
        })
        query += " GROUP BY " + groupByList.join(", ")
      }
    }
    
    // Add ORDER BY clause - only if user has explicitly set sortBy
    if (sortBy) {
      if (xAxis) {
        if (xAxis.includes('$')) {
          query += ` ORDER BY JSON_VALUE("ext", '${xAxis}') ASC`
        } else {
          query += ` ORDER BY "${xAxis}" ASC`
        }
      } else if (uniqueDimensions.length > 0) {
        const firstDim = uniqueDimensions[0]
        if (firstDim.includes('$')) {
          query += ` ORDER BY JSON_VALUE("ext", '${firstDim}') ASC`
        } else {
          query += ` ORDER BY "${firstDim}" ASC`
        }
      }
    }
    
    // Add row limit
    query += ` LIMIT ${rowLimit}`
    
    return query
  }

  const handleCreateChart = async () => {
    try {
      setLoading(true)
      startStopwatch()
      
      const query = generateQuery()
      console.log('Generated Query:', query)
      
      const response = await apiRequest('/jviz/analytics/druid/query', {
        method: 'POST',
        body: { queryBody: query }
      })
      
      console.log('Query Response:', response)
      
      // Optimize data processing with performance checks
      let processedData: any[] = []
      
      if (response && typeof response === 'object') {
        const data = response as any
        if (Array.isArray(data)) {
          processedData = data
        } else if (data?.data && Array.isArray(data.data)) {
          processedData = data.data
        }
      }
      
      // Performance optimization: Limit data size for UI
      const maxDataPoints = 10000 // Limit to prevent UI hanging
      if (processedData.length > maxDataPoints) {
        console.warn(`Large dataset detected (${processedData.length} rows). Limiting to ${maxDataPoints} rows for performance.`)
        processedData = processedData.slice(0, maxDataPoints)
      }
      
      // Use requestAnimationFrame to prevent UI blocking
      requestAnimationFrame(() => {
        setQueryResult(processedData)
        setChartData(processedData)
        console.log(`Query executed successfully. ${processedData.length} rows processed.`)
      })
      
      // Stop stopwatch
      stopStopwatch()
      console.log(`Query completed in ${displayTime}`)
      
    } catch (error) {
      console.error('Error creating chart:', error)
      setQueryResult([])
      setChartData(null)
      
      // Stop stopwatch even on error
      stopStopwatch()
      console.log(`Query failed after ${displayTime}`)
    } finally {
      setLoading(false)
    }
  }

  const isCreateButtonDisabled = !chartName || dimensions.length === 0 || metrics.length === 0 || (metrics.some(m => m !== "COUNT" && !metricColumns[m]))

  // Save chart function
  const handleSaveChart = async () => {
    try {
      setSaving(true)
      
      if (!chartName.trim()) {
        toast.error('Please enter a chart name')
        return
      }

      const query = isEditMode ? editQuery : generateQuery()
      
      const saveData = {
        queryBody: {
          name: chartName,
          chartType: selectedChartType.toLowerCase(),
          query: query
        }
      }

      console.log('Saving chart with data:', saveData)
      
      const response = await onboardingRequest('/jviz/onboard/widget/druid/query?hqBpId=test', {
        method: 'POST',
        body: saveData
      })
      
      console.log('Save chart response:', response)
      
      // Check if response is successful
      if (response) {
        toast.success(isEditMode ? 'Chart updated successfully!' : 'Chart saved successfully!')
        // Redirect to charts page after successful save
        router.push('/charts')
      }
      
    } catch (error) {
      console.error('Error saving chart:', error)
      toast.error(isEditMode ? 'Failed to update chart. Please try again.' : 'Failed to save chart. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Chart rendering logic
  const renderChart = useCallback(() => {
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
      return null
    }

    const data = chartData
    const chartType = selectedChartType.toLowerCase()

    // Extract data for different chart types
    const getChartData = (): ChartData => {
      if (data.length === 0) return { labels: [], values: [] }

      // Handle edit mode data structure
      if (isEditMode) {
        console.log('Edit mode data processing:', { data: data.slice(0, 2), isEditMode })
        
        // For edit mode, look for common time-based patterns
        const timeColumns = ['time_group', '__time', 'time', 'timestamp']
        const valueColumns = ['totaltest', 'total_count', 'count_total', 'sum_total', 'avg_total', 'max_total', 'min_total']
        
        const timeColumn = timeColumns.find(col => data[0].hasOwnProperty(col))
        const valueColumn = valueColumns.find(col => data[0].hasOwnProperty(col)) || 
                          Object.keys(data[0]).find(key => 
                            key !== timeColumn && 
                            typeof data[0][key] === 'number' && 
                            !key.includes('_group')
                          )
        
        console.log('Edit mode column detection:', { timeColumn, valueColumn, availableColumns: Object.keys(data[0]) })
        
        if (timeColumn && valueColumn) {
          const labels = data.map(row => {
            const timeValue = row[timeColumn]
            if (timeValue && timeValue.includes('T')) {
              const time = new Date(timeValue)
              return time.toLocaleDateString() + ' ' + time.toLocaleTimeString()
            }
            return String(timeValue || 'Unknown')
          })
          const values = data.map(row => parseFloat(row[valueColumn]) || 0)
          console.log('Edit mode processed data:', { labels: labels.slice(0, 3), values: values.slice(0, 3) })
          return { labels, values }
        }
        
        // Fallback for edit mode - use first two columns
        const columns = Object.keys(data[0])
        if (columns.length >= 2) {
          const labels = data.map(row => String(row[columns[0]] || 'Unknown'))
          const values = data.map(row => parseFloat(row[columns[1]]) || 0)
          console.log('Edit mode fallback data:', { labels: labels.slice(0, 3), values: values.slice(0, 3) })
          return { labels, values }
        }
      }

      // For time-based charts, use __time column
      if (xAxis && xAxis.includes('__time')) {
        const labels = data.map(row => {
          const time = new Date(row.__time)
          return time.toLocaleDateString() + ' ' + time.toLocaleTimeString()
        })
        const values = data.map(row => {
          // Get the first metric value
          const metricKey = Object.keys(row).find(key => 
            key.includes('_total') || key.includes('count')
          )
          return metricKey ? parseFloat(row[metricKey]) || 0 : 0
        })
        return { labels, values }
      }

      // For categorical charts, use x-axis or first dimension
      const labelColumn = xAxis || (dimensions.length > 0 ? dimensions[0] : Object.keys(data[0])[0])
      
      // Handle JSON column aliases in the data
      const actualLabelColumn = labelColumn.includes('$') 
        ? labelColumn.replace(/[\[\].]/g, '_') 
        : labelColumn
      
      const labels = data.map(row => String(row[actualLabelColumn] || row[labelColumn] || 'Unknown'))
      const values = data.map(row => {
        const metricKey = Object.keys(row).find(key => 
          key.includes('_total') || key.includes('count')
        )
        return metricKey ? parseFloat(row[metricKey]) || 0 : 0
      })
      return { labels, values }
    }

    const processedChartData = getChartData()
    
    return (
      <ChartRenderer
        chartType={chartType}
        data={processedChartData}
        config={chartConfig}
        onDataPointClick={(dataPoint, index) => {
          console.log('Data point clicked:', dataPoint, 'at index:', index)
        }}
        onDataPointHover={(dataPoint, index) => {
          console.log('Data point hovered:', dataPoint, 'at index:', index)
        }}
      />
    )
  }, [chartData, selectedChartType, chartName, selectedDataset, isEditMode, xAxis, dimensions])





  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded flex items-center justify-center">
                <div className="w-4 h-4 bg-indigo-600 rounded"></div>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {selectedDataset} • {selectedChartType}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span>{displayTime}</span>
            </div>
            <Button 
              onClick={isEditMode ? () => executeEditQuery(editQuery) : handleCreateChart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditMode ? 'Executing...' : 'Creating...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="size-4" />
                  {isEditMode ? 'EXECUTE QUERY' : 'CREATE CHART'}
                </div>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSaveChart}
              disabled={saving || !chartName.trim()}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                  {isEditMode ? 'Updating...' : 'Saving...'}
                </div>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  {isEditMode ? 'UPDATE CHART' : 'SAVE'}
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <Input
            placeholder="Add the name of the chart"
            value={chartName}
            onChange={(e) => setChartName(e.target.value)}
            className="text-lg font-medium border-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Panel - Data Source */}
        <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-400 rounded"></div>
                <span className="font-medium">Chart Source</span>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </div>
            <Select value={selectedDataset} onValueChange={handleDatasetChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                {DATASETS.map((dataset) => (
                  <SelectItem key={dataset} value={dataset}>
                    {dataset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Horizontal line separator */}
          <div className="border-t border-slate-200 dark:border-slate-700"></div>

          <div className="p-4">
            {/* <Input
              placeholder="Search Metrics & Columns"
              className="mb-4"
            /> */}
            
            {/* Metrics Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Metrics</span>
                <span className="text-xs text-slate-500">Showing {METRICS.length} of {METRICS.length}</span>
              </div>
              <div className="space-y-2">
                {METRICS.map((metric) => (
                  <div
                    key={metric.name}
                    className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                    onClick={() => handleMetricToggle(metric.name)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-400 rounded"></div>
                      <span className="text-sm">{metric.name}</span>
                    </div>
                    {metrics.includes(metric.name) && (
                      <Badge variant="secondary" className="text-xs">Selected</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Horizontal line separator */}
            <div className="border-t border-slate-200 dark:border-slate-700"></div>

            {/* Columns Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Columns</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{columns.length} columns</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => fetchColumns(selectedDataset)}
                    disabled={loading}
                  >
                    <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              <div className="h-86 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 dark:scrollbar-thumb-slate-600 dark:scrollbar-track-slate-800">
                <div className="space-y-1">
                {loading ? (
                  <div className="text-center py-4 text-sm text-slate-500">Loading columns...</div>
                ) : columns.length === 0 ? (
                  <div className="text-center py-4 text-sm text-slate-500">No columns available</div>
                ) : (
                  columns.map((column) => (
                    <div
                      key={column.name}
                      draggable
                      onDragStart={() => handleDragStart(column.name)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-move group text-sm ${
                        draggedColumn === column.name ? 'opacity-50' : ''
                      }`}
                      onClick={() => {
                        // Add to dimensions by default, or cycle through options
                        if (!dimensions.includes(column.name)) {
                          setDimensions(prev => {
                            const newDimensions = [...prev, column.name]
                            
                            // If no metrics exist, add a default metric for this dimension
                            if (metrics.length === 0) {
                              setMetrics(['COUNT'])
                              setMetricColumns(prev => ({ ...prev, 'COUNT': column.name }))
                            }
                            
                            return newDimensions
                          })
                        } else {
                          // Remove from dimensions
                          setDimensions(prev => {
                            const newDimensions = prev.filter(d => d !== column.name)
                            
                            // If all dimensions are cleared, clear all metrics
                            if (newDimensions.length === 0) {
                              setMetrics([])
                              setMetricColumns({})
                            }
                            
                            return newDimensions
                          })
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-3 h-3 rounded flex-shrink-0 ${
                          column.type === 'time' ? 'bg-blue-400' : 
                          column.type === 'json' ? 'bg-green-400' : 'bg-slate-400'
                        }`}></div>
                        <span className="text-sm truncate">{column.name}</span>
                        <span className="text-xs text-slate-400 flex-shrink-0">({column.type})</span>
                      </div>
                      {/* <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDimensions(prev => prev.includes(column.name) ? prev.filter(d => d !== column.name) : [...prev, column.name])
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          D
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setFilters(prev => prev.includes(column.name) ? prev.filter(f => f !== column.name) : [...prev, column.name])
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          F
                        </Button>
                      </div> */}
                    </div>
                  ))
                )}
                </div>
              </div>
              {/* Horizontal line at the end */}
              {/* <div className="border-t border-slate-200 dark:border-slate-700 mt-2"></div> */}
            </div>
          </div>
        </div>

        {/* Center Panel - Chart Configuration */}
        <div className="w-84 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 flex flex-col h-full">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-medium">{selectedChartType}</span>
            </div>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* X-Axis */}
            <div>
              <Label className="text-sm font-medium mb-2 block">X-AXIS</Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-3 min-h-[45px] transition-colors ${
                  dragOverTarget === 'xaxis' 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                onDrop={(e) => handleDrop('xaxis', e)}
                onDragOver={(e) => handleDragOver(e, 'xaxis')}
                onDragLeave={handleDragLeave}
              >
                {xAxis ? (
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => setXAxis("")}
                  >
                    {xAxis} ×
                  </Badge>
                ) : (
                  <span className="text-slate-500">+ Drop a column here for X-axis</span>
                )}
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <Label className="text-sm font-medium mb-2 block">DIMENSIONS</Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-3 min-h-[45px] transition-colors ${
                  dragOverTarget === 'dimensions' 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                onDrop={(e) => handleDrop('dimensions', e)}
                onDragOver={(e) => handleDragOver(e, 'dimensions')}
                onDragLeave={handleDragLeave}
              >
                {dimensions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {dimensions.map((dimension) => (
                      <Badge 
                        key={dimension}
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => setDimensions(prev => prev.filter(d => d !== dimension))}
                      >
                        {dimension} ×
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500">+ Drop columns here or click</span>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                METRIC {dimensions.length === 0 && <span className="text-red-500 text-xs">(Select Dimension to add Metric)</span>}
              </Label>
              <div className={`border-2 border-dashed rounded-lg p-4 min-h-[45px] ${
                dimensions.length === 0 
                  ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                  : 'border-slate-300 dark:border-slate-600'
              }`}>
                {metrics.length > 0 ? (
                  <div className="space-y-2">
                    {metrics.map((metric) => (
                      <div key={metric} className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className="cursor-pointer"
                          onClick={() => handleMetricToggle(metric)}
                        >
                          {metric} ×
                        </Badge>
                        {metric !== "COUNT" && (
                          <Select 
                            value={metricColumns[metric] || ''} 
                            onValueChange={(value) => handleMetricColumnChange(metric, value)}
                          >
                            <SelectTrigger className="w-32 h-6 text-xs">
                              <SelectValue placeholder="Column" />
                            </SelectTrigger>
                            <SelectContent>
                              {dimensions
                                .filter(dimension => {
                                  // For SUM/AVG, filter out string columns
                                  if (metric === 'SUM' || metric === 'AVG') {
                                    const columnInfo = columns.find(col => col.name === dimension)
                                    return columnInfo?.type !== 'string' && columnInfo?.type !== 'json'
                                  }
                                  return true
                                })
                                .map((dimension) => (
                                <SelectItem key={dimension} value={dimension} className="text-xs">
                                  {dimension}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <span className="text-xs text-slate-500">
                          on {metricColumns[metric] || 'dimension'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500">
                    {dimensions.length === 0 
                      ? 'Select dimensions first to add metrics' 
                      : '+ Drop a column/metric here or click'
                    }
                  </span>
                )}
              </div>
            </div>

            {/* Row Limit */}
            <div>
              <Label className="text-sm font-medium mb-2 block">ROW LIMIT</Label>
              <Input
                type="number"
                value={rowLimit}
                onChange={(e) => setRowLimit(Number(e.target.value))}
                className="w-32"
              />
            </div>
            
            {/* Horizontal line separator */}
            <div className="border-t border-slate-200 dark:border-slate-700"></div>

            {/* Sort By */}
            <div>
              <Label className="text-sm font-medium mb-2 block">SORT BY METRIC</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!sortBy}
                  onChange={(e) => setSortBy(e.target.checked ? "metric" : "")}
                  className="rounded"
                />
                <span className="text-sm">Sort by metric</span>
              </div>
            </div>

            {/* Filters */}
            <div>
              <Label className="text-sm font-medium mb-2 block">FILTERS</Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-3 min-h-[45px] transition-colors ${
                  dragOverTarget === 'filters' 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                onDrop={(e) => handleDrop('filters', e)}
                onDragOver={(e) => handleDragOver(e, 'filters')}
                onDragLeave={handleDragLeave}
              >
                {filters.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                      <Badge 
                        key={filter}
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => setFilters(prev => prev.filter(f => f !== filter))}
                      >
                        {filter} ×
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500">+ Drop columns here or click</span>
                )}
              </div>
            </div>

            {/* Test Query Buttons */}
            {/* <div className="pt-2 space-y-2">
              <Button
                onClick={testQueryGeneration}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Test Current Query
              </Button>
              <Button
                onClick={testScenarios}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Test Scenarios
              </Button>
            </div> */}

          </div>
        </div>

        {/* Right Panel - Chart Preview */}
        <div className="flex-1 bg-white dark:bg-slate-800 p-6 flex flex-col h-full">
          <div className="mb-4 flex-1 flex flex-col">
            <div className="text-sm font-medium mb-2">Chart Preview</div>
            {chartData ? (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg overflow-y-auto flex-1">
                {renderChart()}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-medium mb-1">
                    {isEditMode ? 'Chart preview will appear here' : 'Add required control values to preview chart'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isEditMode 
                      ? 'Click "Execute Query" to run the chart query and see the preview.'
                      : 'Select values in highlighted field(s) in the control panel. Then run the query by clicking on the "Create chart" button.'
                    }
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Query Preview */}
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">{isEditMode ? 'Chart Query' : 'Generated Query'}</div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 max-h-32 overflow-y-auto">
              <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {isEditMode ? editQuery : generateQuery()}
              </pre>
            </div>
          </div>

          {/* Query Results */}
          {/* {queryResult && Array.isArray(queryResult) && queryResult.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Query Results ({queryResult.length} rows)</div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 max-h-40 overflow-y-auto">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <div className="grid grid-cols-1 gap-1">
                    {queryResult.slice(0, 5).map((row, index) => (
                      <div key={index} className="flex items-center justify-between p-1 bg-white dark:bg-slate-800 rounded text-xs">
                        <span className="font-mono">
                          {Object.entries(row).map(([key, value]) => (
                            <span key={key} className="mr-2">
                              <span className="text-slate-500">{key}:</span> {String(value)}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                    {queryResult.length > 5 && (
                      <div className="text-center text-slate-500 text-xs py-1">
                        ... and {queryResult.length - 5} more rows
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
      
      {/* Horizontal line at the bottom of the page */}
      <div className="border-t border-slate-200 dark:border-slate-700"></div>
    </div>
  )
}
