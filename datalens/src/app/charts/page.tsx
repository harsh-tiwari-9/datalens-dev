"use client"

import { useState, useEffect } from "react"
import Navbar04Page from "@/components/navbar-04/navbar-04"
import { useOnboardingApi } from "@/hooks/useApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  MoreHorizontal, 
  Download,
  Plus,
  CheckSquare,
  Square,
  Calendar as CalendarIcon,
  X
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"

interface Chart {
  id: string
  name: string
  chartType: string
  createdDate: string | null
  service?: string | null
  query?: string
}

// Mock data removed - will fetch from API

export default function ChartsPage() {
  const [charts, setCharts] = useState<Chart[]>([])
  const [selectedCharts, setSelectedCharts] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: "all",
    chartType: [] as string[],
    dateRange: "all"
  })
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined } | undefined>({
    from: undefined,
    to: undefined
  })
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  
  const onboardingApi = useOnboardingApi()

  useEffect(() => {
    fetchCharts()
  }, [])

  const fetchCharts = async () => {
    try {
      setLoading(true)
      const response = await onboardingApi.request(
        "/jviz/onboard/widget/druid/widget?skip=0&limit=0",
        {
          method: "GET"
        }
      )

      if (response && response.data && Array.isArray(response.data)) {
        setCharts(response.data)
      } else {
        setCharts([])
      }
    } catch (error) {
      console.error('Error fetching charts:', error)
      setCharts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCharts = charts.filter(chart => {
    const matchesSearch = chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chart.chartType.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilters = 
      (filters.chartType.length === 0 || filters.chartType.includes(chart.chartType))

    // Date filtering logic
    let matchesDate = true
    if (chart.createdDate) {
      const chartDate = new Date(chart.createdDate)
      
      // Check date range picker
      if (dateRange?.from && dateRange?.to) {
        matchesDate = chartDate >= dateRange.from && chartDate <= dateRange.to
      } else if (dateRange?.from) {
        matchesDate = chartDate >= dateRange.from
      } else if (dateRange?.to) {
        matchesDate = chartDate <= dateRange.to
      }
      
      // Check manual date inputs
      if (fromDate) {
        const from = new Date(fromDate)
        matchesDate = matchesDate && chartDate >= from
      }
      if (toDate) {
        const to = new Date(toDate)
        matchesDate = matchesDate && chartDate <= to
      }
    }

    return matchesSearch && matchesFilters && matchesDate
  })

  const toggleSelectChart = (chartId: string) => {
    setSelectedCharts(prev => 
      prev.includes(chartId) 
        ? prev.filter(id => id !== chartId)
        : [...prev, chartId]
    )
  }

  const selectAllCharts = () => {
    setSelectedCharts(filteredCharts.map(chart => chart.id))
  }

  const clearSelection = () => {
    setSelectedCharts([])
  }

  const toggleChartType = (chartType: string) => {
    setFilters(prev => ({
      ...prev,
      chartType: prev.chartType.includes(chartType)
        ? prev.chartType.filter(type => type !== chartType)
        : [...prev.chartType, chartType]
    }))
  }

  const getAppliedFilters = () => {
    const applied = []
    if (searchTerm) applied.push({ type: 'search', label: `"${searchTerm}"`, value: searchTerm })
    if (filters.chartType.length > 0) applied.push({ type: 'chartType', label: `Types: ${filters.chartType.join(", ")}`, value: filters.chartType })
    if (dateRange?.from || dateRange?.to) {
      const from = dateRange.from ? format(dateRange.from, "MMM dd, yyyy") : "Start"
      const to = dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : "End"
      applied.push({ type: 'dateRange', label: `Date: ${from} - ${to}`, value: dateRange })
    }
    if (fromDate) applied.push({ type: 'fromDate', label: `From: ${format(new Date(fromDate), "MMM dd, yyyy")}`, value: fromDate })
    if (toDate) applied.push({ type: 'toDate', label: `To: ${format(new Date(toDate), "MMM dd, yyyy")}`, value: toDate })
    return applied
  }

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'search':
        setSearchTerm("")
        break
      case 'chartType':
        setFilters(prev => ({ ...prev, chartType: [] }))
        break
      case 'dateRange':
        setDateRange(undefined)
        break
      case 'fromDate':
        setFromDate("")
        break
      case 'toDate':
        setToDate("")
        break
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date"
    
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return "1 day ago"
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
      return `${Math.ceil(diffDays / 365)} years ago`
    } catch {
      return "Invalid date"
    }
  }

  const getChartTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      "bar": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "line": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "area": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      "pie": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "scatter": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    }
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  return (
    <div className="min-h-svh bg-slate-50 dark:bg-slate-900">
      <Navbar04Page />
      
      <div className="pt-20 px-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Charts</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage and organize your data visualizations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="size-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="size-4 mr-2" />
              New Chart
            </Button>
          </div>
        </div>


        {/* Bulk Actions */}
        {selectedCharts.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedCharts.length} chart{selectedCharts.length > 1 ? 's' : ''} selected
                  </span>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear selection
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="size-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Applied Filters */}
              {getAppliedFilters().length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active filters:</span>
                  {getAppliedFilters().map((filter, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium hover:bg-slate-300/60 dark:hover:bg-slate-600/60 transition-colors"
                    >
                      <span>{filter.label}</span>
                      <button
                        onClick={() => removeFilter(filter.type)}
                        className="ml-1 hover:bg-slate-400/20 dark:hover:bg-slate-500/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Filter Row */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 size-4" />
                  <Input
                    placeholder="Search by chart name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Chart Type Dropdown */}
                <div className="min-w-[200px]">
                  <Select 
                    value={filters.chartType.length > 0 ? filters.chartType[0] : "all"} 
                    onValueChange={(value) => {
                      if (value === "all") {
                        setFilters(prev => ({ ...prev, chartType: [] }))
                      } else {
                        setFilters(prev => ({ 
                          ...prev, 
                          chartType: prev.chartType.includes(value) 
                            ? prev.chartType.filter(type => type !== value)
                            : [...prev.chartType, value]
                        }))
                      }
                    }}
                  >
                    <SelectTrigger className="h-11 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20">
                      <SelectValue placeholder="Chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All chart types</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="scatter">Scatter Plot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Picker */}
                <div className="min-w-[250px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 justify-start text-left font-normal border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                            </>
                          ) : (
                            format(dateRange.from, "MMM dd, yyyy")
                          )
                        ) : (
                          <span>Pick date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={1}
                        showOutsideDays={false}
                        fixedWeeks
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setFilters({ type: "all", chartType: [], dateRange: "all" })
                    setDateRange(undefined)
                    setFromDate("")
                    setToDate("")
                  }}
                  className="h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Clear All
                </Button>
              </div>

              {/* Secondary Filter Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* From Date */}
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                    From Date
                  </label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-10 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* To Date */}
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                    To Date
                  </label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-10 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-slate-600 dark:text-slate-400">Loading charts...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="w-12 p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={selectedCharts.length === filteredCharts.length ? clearSelection : selectAllCharts}
                        >
                          {selectedCharts.length === filteredCharts.length ? (
                            <CheckSquare className="size-4" />
                          ) : (
                            <Square className="size-4" />
                          )}
                        </Button>
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-900 dark:text-slate-100">Name</th>
                      <th className="text-left p-4 font-semibold text-slate-900 dark:text-slate-100">Chart Type</th>
                      <th className="text-left p-4 font-semibold text-slate-900 dark:text-slate-100">Created At</th>
                      <th className="text-left p-4 font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredCharts.map((chart) => (
                      <tr key={chart.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSelectChart(chart.id)}
                          >
                            {selectedCharts.includes(chart.id) ? (
                              <CheckSquare className="size-4" />
                            ) : (
                              <Square className="size-4" />
                            )}
                          </Button>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {chart.name}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getChartTypeColor(chart.chartType)}>
                            {chart.chartType.charAt(0).toUpperCase() + chart.chartType.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-600 dark:text-slate-400 text-sm">
                            {chart.createdDate}
                          </span>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuItem>Export</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-6 gap-2">
          <Button variant="outline" size="sm" disabled>
            «
          </Button>
          <Button variant="default" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            »
          </Button>
        </div>
        <div className="text-center mt-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {filteredCharts.length} chart{filteredCharts.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>
    </div>
  )
}
