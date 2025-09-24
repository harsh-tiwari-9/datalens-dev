"use client"

import { useState } from "react"
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
import { CHART_TYPES, CATEGORIES, DATASETS, type ChartType } from "@/constants/chart-types"

// Chart types and constants are now imported from @/constants/chart-types


interface CreateChartModalProps {
  isOpen: boolean
  onClose: () => void
  onChartSelect: (chartType: ChartType) => void
}

export default function CreateChartModal({ isOpen, onClose, onChartSelect }: CreateChartModalProps) {
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
    onChartSelect(chart)
    onClose()
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
                {/* Step 1: Choose Dataset */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    1 Choose a dataset
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
                    2 Choose chart type
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
                          className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 dark:border-slate-700"
                          onClick={() => handleChartSelect(chart)}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Preview */}
                              <div className="aspect-video bg-slate-50 dark:bg-slate-800 rounded-md overflow-hidden">
                                <img 
                                  src={chart.preview} 
                                  alt={`${chart.name} preview`}
                                  className="w-full h-full object-cover"
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