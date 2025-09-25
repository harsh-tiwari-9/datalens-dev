"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useIotAnalyticsApi } from "@/hooks/useApi"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Play, Save, MoreHorizontal } from "lucide-react"

interface Column {
  name: string
  type: string
}

interface Metric {
  name: string
  type: string
}

const METRICS = [
  { name: "AVG", type: "aggregate" },
  { name: "COUNT", type: "aggregate" },
  { name: "COUNT_DISTINCT", type: "aggregate" },
  { name: "MAX", type: "aggregate" },
  { name: "MIN", type: "aggregate" },
  { name: "SUM", type: "aggregate" }
]

export default function CreateChartPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { request: apiRequest } = useIotAnalyticsApi()
  
  console.log('CreateChartPage component rendered')
  
  const [chartName, setChartName] = useState("")
  const [columns, setColumns] = useState<Column[]>([])
  const [selectedDataset, setSelectedDataset] = useState("")
  const [selectedChartType, setSelectedChartType] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Chart configuration
  const [xAxis, setXAxis] = useState("")
  const [metrics, setMetrics] = useState<string[]>([])
  const [dimensions, setDimensions] = useState<string[]>([])
  const [filters, setFilters] = useState<string[]>([])
  const [rowLimit, setRowLimit] = useState(10000)
  const [sortBy, setSortBy] = useState("")
  
  // Chart preview
  const [chartData, setChartData] = useState(null)
  const [queryResult, setQueryResult] = useState(null)

  useEffect(() => {
    const dataset = searchParams.get('dataset')
    const chartType = searchParams.get('chartType')
    
    console.log('Create Chart Page - Dataset:', dataset, 'ChartType:', chartType)
    console.log('Current URL:', window.location.href)
    console.log('Search params:', searchParams.toString())
    
    if (dataset && chartType) {
      setSelectedDataset(dataset)
      setSelectedChartType(chartType)
      fetchColumns(dataset)
    } else {
      console.log('Missing dataset or chartType, redirecting to home')
      router.push('/home')
    }
  }, [searchParams, router])

  const fetchColumns = async (dataset: string) => {
    try {
      setLoading(true)
      const response = await apiRequest(`/jviz/analytics/druid/table/${dataset}/columns`)
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

  const handleMetricToggle = (metric: string) => {
    setMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    )
  }

  const handleDimensionToggle = (column: string) => {
    setDimensions(prev => 
      prev.includes(column) 
        ? prev.filter(d => d !== column)
        : [...prev, column]
    )
  }

  const handleFilterToggle = (column: string) => {
    setFilters(prev => 
      prev.includes(column) 
        ? prev.filter(f => f !== column)
        : [...prev, column]
    )
  }

  const generateQuery = () => {
    let query = "SELECT "
    
    // Add dimensions
    if (dimensions.length > 0) {
      query += dimensions.join(", ") + ", "
    }
    
    // Add metrics
    if (metrics.length > 0) {
      const metricExpressions = metrics.map(metric => {
        if (metric === "COUNT") return "COUNT(*)"
        if (metric === "COUNT_DISTINCT") return "COUNT(DISTINCT *)"
        return `${metric}(*)`
      })
      query += metricExpressions.join(", ")
    }
    
    query += ` FROM "${selectedDataset}"`
    
    // Add filters
    if (filters.length > 0) {
      query += " WHERE " + filters.map(filter => `${filter} IS NOT NULL`).join(" AND ")
    }
    
    // Add row limit
    query += ` LIMIT ${rowLimit}`
    
    return query
  }

  const handleCreateChart = async () => {
    try {
      setLoading(true)
      const query = generateQuery()
      console.log('Generated Query:', query)
      
      const response = await apiRequest('/jviz/analytics/druid/query', {
        method: 'POST',
        body: { queryBody: query }
      })
      if (response?.data) {
        setQueryResult(response.data)
        setChartData(response.data)
      }
    } catch (error) {
      console.error('Error creating chart:', error)
    } finally {
      setLoading(false)
    }
  }

  const isCreateButtonDisabled = !chartName || metrics.length === 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 -mx-4 -my-28">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
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
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>00:00:00.00</span>
            </div>
            <Button variant="outline" size="sm">
              <Save className="size-4 mr-2" />
              SAVE
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </div>
        
        {/* Chart Name Input */}
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
        <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-400 rounded"></div>
                <span className="font-medium">Chart Source</span>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {selectedDataset}
            </div>
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <Input
              placeholder="Search Metrics & Columns"
              className="mb-4"
            />
            
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

            {/* Columns Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Columns</span>
                <span className="text-xs text-slate-500">Showing {columns.length} of {columns.length}</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4 text-sm text-slate-500">Loading columns...</div>
                ) : (
                  columns.map((column) => (
                    <div
                      key={column.name}
                      className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-400 rounded"></div>
                        <span className="text-sm">{column.name}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="size-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Chart Configuration */}
        <div className="flex-1 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-600">{selectedChartType}</span>
              </div>
              <span className="font-medium">{selectedChartType}</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* X-Axis */}
            <div>
              <Label className="text-sm font-medium mb-2 block">DIMENSIONS</Label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 min-h-[60px]">
                {xAxis ? (
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => setXAxis("")}
                  >
                    {xAxis} ×
                  </Badge>
                ) : (
                  <span className="text-slate-500">+ Drop columns here or click</span>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div>
              <Label className="text-sm font-medium mb-2 block">METRIC</Label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 min-h-[60px]">
                {metrics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {metrics.map((metric) => (
                      <Badge 
                        key={metric}
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => handleMetricToggle(metric)}
                      >
                        {metric} ×
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500">+ Drop a column/metric here or click</span>
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
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 min-h-[60px]">
                {filters.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                      <Badge 
                        key={filter}
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => handleFilterToggle(filter)}
                      >
                        {filter} ×
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500">+ Drop columns/metrics here or click</span>
                )}
              </div>
            </div>

            {/* Create Chart Button */}
            <div className="pt-4">
              <Button
                onClick={handleCreateChart}
                disabled={isCreateButtonDisabled || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Chart...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Play className="size-4" />
                    CREATE CHART
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Chart Preview */}
        <div className="w-80 bg-white dark:bg-slate-800 p-6">
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Chart Preview</div>
            {chartData ? (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Chart rendered successfully
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-medium mb-1">Add required control values to preview chart</div>
                  <div className="text-xs text-slate-500">
                    Select values in highlighted field(s) in the control panel. Then run the query by clicking on the "Create chart" button.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Query Results */}
          {queryResult && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Query Results</div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 max-h-32 overflow-y-auto">
                <pre className="text-xs text-slate-600 dark:text-slate-400">
                  {JSON.stringify(queryResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
