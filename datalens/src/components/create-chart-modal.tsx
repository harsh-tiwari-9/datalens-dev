"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  BarChart3,
  LineChart,
  PieChart,
  Map,
  TrendingUp,
  Table,
  Activity,
  Target,
  Layers,
  Globe,
  Zap
} from "lucide-react"
import { CHART_TYPES, CATEGORIES, type ChartType } from "@/constants/chart-types"
import { DATASETS } from "@/constants/chart-creation"

// Chart types and constants are now imported from @/constants/chart-types


interface CreateChartModalProps {
  isOpen: boolean
  onClose: () => void
  onChartSelect?: (chartType: ChartType) => void
  suggestedChartType?: string | null
  dataPreview?: any[]
}

export default function CreateChartModal({ isOpen, onClose, onChartSelect, suggestedChartType, dataPreview }: CreateChartModalProps) {
  const router = useRouter()
  const [selectedDataset, setSelectedDataset] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All charts")
  const [expandedSections, setExpandedSections] = useState({
    recommended: true
  })

  const filteredCharts = CHART_TYPES.filter(chart => {
    const matchesSearch = chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chart.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "All charts" || chart.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })


  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleChartSelect = (chart: ChartType) => {
    console.log('Chart selected:', chart.id, 'Dataset:', selectedDataset)
    if (selectedDataset) {
      const url = `/create-chart?dataset=${selectedDataset}&chartType=${chart.id}`
      // console.log('Navigating to:', url)
      
      // Close modal first
      onClose()
      
      // Use Next.js router for client-side navigation
      router.push(url)
    } else {
      console.log('No dataset selected, calling onChartSelect')
      onChartSelect?.(chart)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-none w-[95vw] h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold">Create a new chart</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Left Sidebar */}
            <div className="w-96 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6 overflow-y-auto">
              <div className="space-y-8">
                {/* All Charts */}
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <BarChart3 className="size-4" />
                  All charts
                </div>

                {/* Category Quick Filters */}
                <Collapsible 
                  open={expandedSections.recommended}
                  onOpenChange={() => toggleSection('recommended')}
                >
                  <CollapsibleTrigger className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    {expandedSections.recommended ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                    Quick filters
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2">
                    <button
                      onClick={() => setSelectedCategory("All charts")}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === "All charts"
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      All charts
                    </button>
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === category
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>


              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="space-y-8">
                {/* Data Preview Section (only show if coming from SQL Lab) */}
                {dataPreview && dataPreview.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                      Data Preview
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {dataPreview.length} rows of data from your query
                      </div>
                      <div className="max-h-32 overflow-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              {Object.keys(dataPreview[0]).map((col) => (
                                <th key={col} className="text-left p-1 font-medium">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {dataPreview.slice(0, 3).map((row, idx) => (
                              <tr key={idx} className="border-b">
                                {Object.values(row).map((value, colIdx) => (
                                  <td key={colIdx} className="p-1 text-slate-600 dark:text-slate-400">
                                    {String(value).length > 20 ? String(value).substring(0, 20) + '...' : String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested Chart Type */}
                {suggestedChartType && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                      Recommended Chart Type
                    </h3>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="size-4 text-indigo-600" />
                        <span className="font-medium text-indigo-900 dark:text-indigo-100">
                          Based on your data, we recommend:
                        </span>
                      </div>
                      <div className="text-sm text-indigo-700 dark:text-indigo-300">
                        {CHART_TYPES.find(chart => chart.id === suggestedChartType)?.name || 'Bar Chart'} - 
                        {CHART_TYPES.find(chart => chart.id === suggestedChartType)?.description || 'Best suited for your data structure'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Choose Dataset */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    {dataPreview ? '2' : '1'} Choose a dataset
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <select 
                        value={selectedDataset} 
                        onChange={(e) => setSelectedDataset(e.target.value)}
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Choose a dataset</option>
                        {DATASETS.map((dataset) => (
                          <option key={dataset} value={dataset}>
                            {dataset}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Step 2: Choose Chart Type */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    {dataPreview ? '3' : '2'} Choose chart type
                  </h3>
                  
                  {/* Search */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 size-4" />
                    <Input
                      placeholder="Search all charts"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>

                  {/* Chart Grid */}
                  <div className="min-h-[400px]">
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {filteredCharts.map((chart) => (
                        <Card 
                          key={chart.id}
                          className={`cursor-pointer hover:shadow-md transition-shadow ${
                            suggestedChartType === chart.id 
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                          onClick={() => handleChartSelect(chart)}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Preview */}
                              <div className="aspect-video bg-white dark:bg-slate-900 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 p-2">
                                <img 
                                  src={chart.preview} 
                                  alt={`${chart.name} preview`}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    // Fallback to a placeholder if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const nextElement = target.nextElementSibling as HTMLElement;
                                    if (nextElement) {
                                      nextElement.style.display = 'flex';
                                    }
                                  }}
                                />
                                <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm" style={{display: 'none'}}>
                                  Preview not available
                                </div>
                              </div>
                              
                              {/* Chart Info */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  {chart.icon}
                                  <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                                    {chart.name}
                                  </h4>
                                  {suggestedChartType === chart.id && (
                                    <Badge className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                      RECOMMENDED
                                    </Badge>
                                  )}
                                  {chart.deprecated && (
                                    <Badge variant="destructive" className="text-xs">
                                      DEPRECATED
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {chart.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}