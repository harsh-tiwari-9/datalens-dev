"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Download, BarChart3, Eye } from "lucide-react"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { useIotAnalyticsApi } from "@/hooks/useApi"
import { toast } from "sonner"
import CreateChartModal from "@/components/create-chart-modal"
import { ChartType } from "@/constants/chart-types"
import { DATASETS } from "@/constants/chart-creation"
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

interface Column {
  name: string;
  type: string;
}

export default function SqlLabPage() {
  const [theme, setTheme] = useState<"vs" | "vs-dark">("vs")
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([])
  const [resultColumns, setResultColumns] = useState<string[]>([])
  const [showChartModal, setShowChartModal] = useState(false)
  const [selectedRowData, setSelectedRowData] = useState<any[]>([])
  const [showRowModal, setShowRowModal] = useState(false)
  const iotApi = useIotAnalyticsApi()
  const getColumnsApi = useIotAnalyticsApi()

  useEffect(() => {
    try {
      const isDark = document.documentElement.classList.contains("dark")
      setTheme(isDark ? "vs-dark" : "vs")
    } catch {}
  }, [])

  const fetchTableColumns = async (tableName: string) => {
    try {
      const response = await getColumnsApi.request(
        `/jviz/analytics/druid/custom-list-keys?tableName=${tableName}`,
        { method: 'GET' }
      )
      if (response && typeof response === 'object') {
        const data = (response as any)?.data
        if (data?.list && Array.isArray(data.list)) {
          const columnsData = data.list.map((col: string) => ({
            name: col,
          }))
          setColumns(columnsData)
          console.log("columnsData:::", columnsData)
          console.log("columns:::", columns)
          toast.success(`Loaded ${columnsData.length} columns from ${tableName}`)
        } else {
          setColumns([])
          toast.warning('No columns found for this table')
        }
      } else {
        setColumns([])
        toast.error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching table columns:', error)
      setColumns([])
      toast.error('Failed to fetch table columns')
    }
  }

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName)
    fetchTableColumns(tableName)
    setQuery(`Enter query to fetch data from "${tableName}" `)
  }

  const executeQuery = async () => {
    if(query.toLowerCase().includes("select *")) {
      toast.error("Please enter columns to query from the table.")
      return
    } else if(query.toLowerCase().includes("delete") || query.toLowerCase().includes("update") || query.toLowerCase().includes("insert") || query.toLowerCase().includes("alter") || query.toLowerCase().includes("drop") || query.toLowerCase().includes("create") || query.toLowerCase().includes("truncate") || query.toLowerCase().includes("rename") || query.toLowerCase().includes("grant") || query.toLowerCase().includes("revoke") || query.toLowerCase().includes("alter") || query.toLowerCase().includes("drop") || query.toLowerCase().includes("create") || query.toLowerCase().includes("truncate") || query.toLowerCase().includes("rename") || query.toLowerCase().includes("grant") || query.toLowerCase().includes("revoke")) {
      toast.error("Following SQL commands are not supported: delete, update, insert, alter, drop, create, truncate, rename, grant, revoke.")
      return
    }
    try {
      const response = await iotApi.request(
        "/jviz/analytics/druid/query",
        {
          method: "POST",
          body: { queryBody: query}
        }
      )

      if (response && typeof response === 'object') {
        const data = (response as any)  
        if (Array.isArray(data)) {
          // If response is array of rows
          setResults(data)
          if (data.length > 0) {
            setResultColumns(Object.keys(data[0]))
          } else {
            setResultColumns([])
          }
          toast.success(`Query executed successfully. ${data.length} rows returned.`)
        } else if (data?.data && Array.isArray(data.data)) {
          // If response has data property
          setResults(data.data)
          if (data.data.length > 0) {
            setResultColumns(Object.keys(data.data[0]))
          } else {
            setResultColumns([])
          }
          toast.success(`Query executed successfully. ${data.data.length} rows returned.`)
        } else {
          setResults([])
          setResultColumns([])
          toast.warning("No data returned from query")
        }
      } else {
        setResults([])
        setResultColumns([])
        toast.error("Invalid response format")
      }
    } catch (error) {
      console.error('Error executing query:', error)
      setResults([])
      setResultColumns([])
      toast.error("Failed to execute query")
    }
  }

  const copyToClipboard = async () => {
    if (results.length === 0) return
    
    try {
      // Convert results to CSV format
      const csvContent = [
        resultColumns.join(','),
        ...results.map(row => 
          resultColumns.map(col => {
            const value = row[col] !== null && row[col] !== undefined ? String(row[col]) : ''
            // Escape commas and quotes in CSV
            return `"${value.replace(/"/g, '""')}"`
          }).join(',')
        )
      ].join('\n')
      
      await navigator.clipboard.writeText(csvContent)
      toast.success("Data copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const downloadData = () => {
    if (results.length === 0) return

    if(results.length > 10000) {
      toast.error("Only 10,000 rows can be downloaded at a time.")
      return
    }
    
    try {
      // Convert results to CSV format
      const csvContent = [
        resultColumns.join(','),
        ...results.map(row => 
          resultColumns.map(col => {
            const value = row[col] !== null && row[col] !== undefined ? String(row[col]) : ''
            // Escape commas and quotes in CSV
            return `"${value.replace(/"/g, '""')}"`
          }).join(',')
        )
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `query-results-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success("Data downloaded successfully!")
    } catch (error) {
      toast.error("Failed to download data")
    }
  }

  const createChart = () => {
    if (results.length === 0) return
    
    setShowChartModal(true)
  }

  const analyzeDataForChartType = (data: any[], columns: string[]) => {
    if (data.length === 0) return null
    
    const sampleRow = data[0]
    const numericColumns = columns.filter(col => {
      const value = sampleRow[col]
      return typeof value === 'number' || !isNaN(Number(value))
    })
    
    const textColumns = columns.filter(col => {
      const value = sampleRow[col]
      return typeof value === 'string' && isNaN(Number(value))
    })
    
    const dateColumns = columns.filter(col => {
      const value = sampleRow[col]
      return value && typeof value === 'string' && (value.includes('T') || value.includes('-') || value.includes('/'))
    })
    

    if (numericColumns.length === 1 && textColumns.length >= 1) {
      return 'bar-chart' 
    } else if (numericColumns.length >= 2 && textColumns.length >= 1) {
      return 'line-chart' 
    } else if (numericColumns.length === 2) {
      return 'scatter-plot' 
    } else if (textColumns.length >= 1 && numericColumns.length === 1) {
      return 'pie-chart'
    } else if (dateColumns.length >= 1 && numericColumns.length >= 1) {
      return 'line-chart'
    }
    
    return 'bar-chart'
  }

  const handleChartSelect = (chartType: ChartType) => {
    if (results.length === 0) return
    
    // Navigate to create-chart page with the query results as data
    const queryParam = encodeURIComponent(query)
    const chartName = `${chartType.name} from SQL Lab`
    
    // Create a URL with the chart type and query data
    const url = `/create-chart?chartType=${chartType.id}&chartName=${encodeURIComponent(chartName)}&query=${queryParam}&fromSqlLab=true`
    window.location.href = url
  }

  function handleQueryChange(value: string) {
    console.log("value:::", value)
    setQuery(value)
  }

  function handleViewRow(row: any) {
    try {
      if (row.ext) {
        const extData = JSON.parse(row.ext)
        if (Array.isArray(extData)) {
          setSelectedRowData(extData)
          setShowRowModal(true)
        } else {
          toast.error("Ext data is not an array")
        }
      } else {
        toast.warning("No ext data found in this row")
      }
    } catch (error) {
      console.error('Error parsing ext data:', error)
      toast.error("Failed to parse ext data")
    }
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-xl border bg-background">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="text-sm font-semibold">Tables</h3>
            {/* <Button size="icon" variant="ghost" className="text-indigo-600 dark:text-indigo-400"><List className="size-4" /></Button> */}
          </div>
          <div className="p-3 space-y-2">
            {DATASETS.map((t) => (
              <div 
                key={t} 
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors ${
                  selectedTable === t 
                    ? 'bg-indigo-500 text-white' 
                    : 'hover:bg-indigo-500/10'
                }`}
                onClick={() => handleTableSelect(t)}
              >
                <span className={`inline-flex size-5 items-center justify-center rounded-sm border text-xs ${
                  selectedTable === t 
                    ? 'border-white text-white' 
                    : 'text-muted-foreground'
                }`}>▦</span>
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 border-t">
            <div className="flex items-center justify-between p-3">
              <p className="text-sm font-semibold">Columns</p>
              <div className="flex items-center gap-1">
                {/* <Button size="icon" variant="ghost"><Filter className="size-4" /></Button>
                <Button size="icon" variant="ghost"><SlidersHorizontal className="size-4" /></Button> */}
              </div>
            </div>
            <div className="max-h-[360px] space-y-0.5 overflow-auto px-3 pb-3">
              {iotApi.loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-muted-foreground">Loading columns...</div>
                </div>
              ) : columns.length > 0 ? (
                console.log("columns:::", columns),
                columns.map((col) => (
                  <div key={col.name} className="grid grid-cols-2 gap-2 rounded-md border px-2 py-1.5 text-sm">
                    <span>{col.name}</span>
                    <span className="text-muted-foreground">{col.type}</span>
                  </div>
                ))
              ) : selectedTable ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-muted-foreground">No columns found</div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-muted-foreground">Select a table to view columns</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="space-y-6">
          {/* SQL Editor */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="text-sm">SQL Editor</CardTitle>
              <Button 
                className="rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={executeQuery}
                disabled={iotApi.loading}
              >
                {iotApi.loading ? "Running..." : "Run"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-background">
                <MonacoEditor
                  height="240px"
                  defaultLanguage="sql"
                  theme={theme}
                  value={query}
                  onChange={(value) => handleQueryChange(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm">Results</CardTitle>
              <div className="flex items-center gap-2">
                {results.length > 0 && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={copyToClipboard}
                      className="text-xs"
                    >
                      <Copy className="size-3 mr-1" />
                      Copy
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={downloadData}
                      className="text-xs"
                    >
                      <Download className="size-3 mr-1" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={createChart}
                      className="text-xs"
                    >
                      <BarChart3 className="size-3 mr-1" />
                      Create Chart
                    </Button>
                  </>
                )}
                {/* <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost"><Filter className="size-4" /></Button>
                  <Button size="icon" variant="ghost"><List className="size-4" /></Button>
                </div> */}
              </div>
            </CardHeader>
            <CardContent>
                <div className="max-h-[400px] overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                  {results.length > 0 ? (
                    <div className="max-w-[900px] overflow-x-auto">
                      <table className="w-full text-left text-sm min-w-full">
                        <thead className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">
                          <tr>
                            {resultColumns.map((col) => (
                              <th key={col} className="px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap border-r border-slate-200 dark:border-slate-600 last:border-r-0">
                                {col}
                              </th>
                            ))}
                            <th key="action" className="px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap border-r border-slate-200 dark:border-slate-600 last:border-r-0">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {results.map((row, index) => (
                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150">
                              {resultColumns.map((col) => (
                                <td key={col} className="px-4 py-3 whitespace-nowrap text-slate-900 dark:text-slate-100 border-r border-slate-100 dark:border-slate-700 last:border-r-0 font-mono text-xs">
                                  <span className="inline-block max-w-xs truncate" title={row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}>
                                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                                  </span>
                                </td>
                              ))}
                              <td key="action" className="px-4 py-3 whitespace-nowrap text-slate-900 dark:text-slate-100 border-r border-slate-100 dark:border-slate-700 last:border-r-0 font-mono text-xs">
                                <Button size="sm" variant="outline" className="text-xs" onClick={() => handleViewRow(row)}>
                                  <Eye className="size-3 mr-1" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-muted-foreground">
                      {iotApi.loading ? "Executing query..." : "No results to display. Run a query to see results."}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      
      {/* Chart Creation Modal */}
      <CreateChartModal
        isOpen={showChartModal}
        onClose={() => setShowChartModal(false)}
        onChartSelect={handleChartSelect}
        suggestedChartType={analyzeDataForChartType(results, resultColumns)}
        dataPreview={results.slice(0, 5)} // Show first 5 rows as preview
      />

      {/* Row Data Modal */}
      {showRowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Row Data (ext field)</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRowModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </Button>
            </div>
            <div className="p-4 overflow-auto max-h-[60vh]">
              <div className="space-y-4">
                {selectedRowData.map((item, index) => (
                  <Card key={index} className="border border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">JSON Object {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded border overflow-x-auto">
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


