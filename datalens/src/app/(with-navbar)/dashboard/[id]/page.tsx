"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useOnboardingApi, useIotAnalyticsApi } from "@/hooks/useApi"
import { ChartRenderer } from "@/components/charts/ChartRenderer"
import { ChartData } from "@/components/charts/types"
import { ArrowLeft, RefreshCw } from "lucide-react"

interface Widget {
  id: string
  name: string
  service: string | null
  chartType: string
  query: string
  createdDate: string
}

interface WidgetInfo {
  id: string
  name: string
  chartType: string
  query: string
}

interface Dashboard {
  id: string
  name: string
  description: string | null
  widgetIds: string[]
}

export default function DashboardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dashboardId = params.id as string
  
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [widgetInfo, setWidgetInfo] = useState<WidgetInfo[]>([])
  const [widgetData, setWidgetData] = useState<Record<string, ChartData>>({})
  const [widgetLoading, setWidgetLoading] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const onboardingApi = useOnboardingApi()
  const iotApi = useIotAnalyticsApi()

  useEffect(() => {
    if (dashboardId) {
      fetchDashboardDetails()
    }
  }, [dashboardId])

  const fetchDashboardDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First, get the dashboard details
      const dashboardResponse = await iotApi.request(
        `/jviz/analytics/druid/dashboard?skip=0&limit=0`,
        { method: "GET" }
      )
      
      if (dashboardResponse && Array.isArray(dashboardResponse.data)) {
        const foundDashboard = dashboardResponse.data.find((d: any) => d.id === dashboardId)
        if (foundDashboard) {
          setDashboard(foundDashboard)
          await fetchWidgets(foundDashboard.widgetIds)
        } else {
          setError("Dashboard not found")
        }
      } else {
        setError("Failed to fetch dashboard details")
      }
    } catch (error) {
      console.error("Error fetching dashboard details:", error)
      setError("Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  const fetchWidgets = async (widgetIds: string[]) => {
    try {
      // Fetch all widgets at once
      const response = await onboardingApi.request(
        `/jviz/onboard/widget/druid/widget?skip=0&limit=0`,
        { method: "GET" }
      )
      
      if (response && Array.isArray(response.data)) {
        // Filter widgets by the provided widgetIds
        const widgetsData = response.data.filter((w: any) => widgetIds?.includes(w.id))
        
        // Create widget info array with only query and chartType
        const widgetInfoArray: WidgetInfo[] = widgetsData.map((widget: any) => ({
          id: widget.id,
          name: widget.name || `Widget ${widget.id}`,
          chartType: widget.chartType,
          query: widget.query
        }))
        
        setWidgetInfo(widgetInfoArray)
        console.log("Widget Info Array:", widgetInfoArray)
        
        // Execute queries for all widgets
        for (const widget of widgetInfoArray) {
          await executeWidgetQuery(widget)
        }
      }
    } catch (error) {
      console.error("Error fetching widgets:", error)
    }
  }

  const executeWidgetQuery = async (widget: WidgetInfo) => {
    try {
      setWidgetLoading(prev => ({ ...prev, [widget.id]: true }))
      console.log(`Executing query for widget ${widget.name}:`, widget.query)
      
      const response = await iotApi.request(
        "/jviz/analytics/druid/query",
        {
          method: "POST",
          body: { queryBody: widget.query }
        }
      )
      
      if (response && typeof response === 'object') {
        let processedData: any[] = []
        
        if (Array.isArray(response)) {
          processedData = response
        } else if (response?.data && Array.isArray(response.data)) {
          processedData = response.data
        }
        
        // Convert the query result to chart data format
        const chartData = convertToChartData(processedData, widget.chartType)
        setWidgetData(prev => ({
          ...prev,
          [widget.id]: chartData
        }))
        
        console.log(`Query executed successfully for ${widget.name}. ${processedData.length} rows processed.`)
      }
    } catch (error) {
      console.error(`Error executing query for widget ${widget.name}:`, error)
      // Set empty data on error
      setWidgetData(prev => ({
        ...prev,
        [widget.id]: { labels: [], values: [] }
      }))
    } finally {
      setWidgetLoading(prev => ({ ...prev, [widget.id]: false }))
    }
  }

  const convertToChartData = (data: any[], chartType: string): ChartData => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        values: []
      }
    }

    // Get the first row to understand the structure
    const firstRow = data[0]
    const columns = Object.keys(firstRow)
    
    // For time series charts, look for time-related columns
    if (chartType === 'line' || chartType === 'area' || chartType === 'bar') {
      const timeColumn = columns.find(col => 
        col.toLowerCase().includes('time') || 
        col.toLowerCase().includes('date') ||
        col === '__time' ||
        col === 'time_group'
      )
      
      const valueColumn = columns.find(col => 
        col !== timeColumn && 
        (typeof firstRow[col] === 'number' || !isNaN(Number(firstRow[col])))
      )
      
      if (timeColumn && valueColumn) {
        return {
          labels: data.map(row => {
            const timeValue = row[timeColumn]
            // Convert timestamp to readable format
            if (typeof timeValue === 'number' || typeof timeValue === 'string') {
              try {
                const date = new Date(timeValue)
                if (!isNaN(date.getTime())) {
                  return date.toLocaleDateString()
                }
              } catch (e) {
                // Fallback to string representation
              }
            }
            return String(timeValue)
          }),
          values: data.map(row => {
            const val = row[valueColumn]
            return typeof val === 'number' ? val : (Number(val) || 0)
          })
        }
      }
    }
    
    // For pie charts, use first two columns
    if (chartType === 'pie') {
      const labelColumn = columns[0]
      const valueColumn = columns[1]
      
      if (labelColumn && valueColumn) {
        return {
          labels: data.map(row => String(row[labelColumn] || 'Unknown')),
          values: data.map(row => {
            const val = row[valueColumn]
            return typeof val === 'number' ? val : (Number(val) || 0)
          })
        }
      }
    }
    
    // Default: use first two columns
    const labelColumn = columns[0]
    const valueColumn = columns[1] || columns[0]
    
    return {
      labels: data.map(row => String(row[labelColumn] || 'Unknown')),
      values: data.map(row => {
        const val = row[valueColumn]
        return typeof val === 'number' ? val : (Number(val) || 0)
      })
    }
  }

  const refreshDashboard = () => {
    if (dashboard) {
      fetchWidgets(dashboard.widgetIds)
    }
  }

  // Debug function to log widget info
  const logWidgetInfo = () => {
    console.log("Current Widget Info Array:", widgetInfo)
    console.log("Widget Info as JSON:", JSON.stringify(widgetInfo, null, 2))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Dashboard not found</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{dashboard.name}</h1>
            {dashboard.description && (
              <p className="text-muted-foreground mt-1">{dashboard.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshDashboard} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {widgetInfo.map((widget) => (
          <Card key={widget.id} className="shadow-lg h-[680px]">
            <CardHeader>
              <CardTitle className="text-lg">{widget.name}</CardTitle>
              <p className="text-sm text-muted-foreground capitalize">
                {widget.chartType} Chart
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {widgetLoading[widget.id] ? (
                  <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600" />
                      <p className="text-sm text-muted-foreground">Loading chart...</p>
                    </div>
                  </div>
                ) : widgetData[widget.id] ? (
                  <ChartRenderer
                    chartType={widget.chartType}
                    data={widgetData[widget.id]}
                    config={{
                      title: widget.name,
                      responsive: true,
                      height: 200
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">No data available</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {widgetInfo.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No charts found in this dashboard</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
