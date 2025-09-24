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

interface ChartType {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  deprecated?: boolean
  icon: React.ReactNode
  preview: React.ReactNode
}

const chartTypes: ChartType[] = [
  {
    id: "big-number-trend",
    name: "Big Number with Trendline",
    description: "Display a key metric with trend indicator",
    category: "KPI",
    tags: ["Popular", "KPI"],
    icon: <TrendingUp className="size-4" />,
    preview: (
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">215</div>
        <div className="text-sm text-green-600 dark:text-green-400">+70% WoW</div>
        <div className="w-16 h-8 bg-blue-500 rounded-sm mt-1"></div>
      </div>
    )
  },
  {
    id: "big-number",
    name: "Big Number",
    description: "Display a single key metric",
    category: "KPI",
    tags: ["Popular", "KPI"],
    icon: <Target className="size-4" />,
    preview: (
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">80.7M</div>
      </div>
    )
  },
  {
    id: "table",
    name: "Table",
    description: "Display data in tabular format",
    category: "Table",
    tags: ["Popular", "Table"],
    icon: <Table className="size-4" />,
    preview: (
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs">
        <div className="grid grid-cols-3 gap-1">
          <div className="p-1 bg-white dark:bg-slate-700 rounded">Name</div>
          <div className="p-1 bg-white dark:bg-slate-700 rounded">Value</div>
          <div className="p-1 bg-white dark:bg-slate-700 rounded">Status</div>
        </div>
      </div>
    )
  },
  {
    id: "pivot-table",
    name: "Pivot Table",
    description: "Interactive pivot table for data analysis",
    category: "Table",
    tags: ["Advanced-Analytics", "Table"],
    icon: <Layers className="size-4" />,
    preview: (
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs">
        <div className="grid grid-cols-2 gap-1">
          <div className="p-1 bg-white dark:bg-slate-700 rounded">Pivot</div>
          <div className="p-1 bg-white dark:bg-slate-700 rounded">Data</div>
        </div>
      </div>
    )
  },
  {
    id: "line-chart",
    name: "Line Chart",
    description: "Show trends over time",
    category: "Evolution",
    tags: ["Popular", "Evolution"],
    icon: <LineChart className="size-4" />,
    preview: (
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
        <div className="w-16 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
      </div>
    )
  },
  {
    id: "area-chart",
    name: "Area Chart",
    description: "Show data trends with filled areas",
    category: "Evolution",
    tags: ["Popular", "Evolution"],
    icon: <Activity className="size-4" />,
    preview: (
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
        <div className="w-16 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded"></div>
      </div>
    )
  },
  {
    id: "bar-chart",
    name: "Bar Chart",
    description: "Compare values across categories",
    category: "Ranking",
    tags: ["Popular", "Ranking"],
    icon: <BarChart3 className="size-4" />,
    preview: (
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
        <div className="flex items-end gap-1 h-12">
          <div className="w-3 bg-yellow-500 rounded-t"></div>
          <div className="w-3 bg-green-500 rounded-t h-8"></div>
          <div className="w-3 bg-yellow-500 rounded-t h-6"></div>
        </div>
      </div>
    )
  },
//   {
//     id: "scatter-plot",
//     name: "Scatter Plot",
//     description: "Show relationship between two variables",
//     category: "Correlation",
//     tags: ["Advanced-Analytics", "Correlation"],
//     icon: <Scatter3D className="size-4" />,
//     preview: (
//       <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
//         <div className="w-16 h-12 bg-slate-200 dark:bg-slate-700 rounded relative">
//           <div className="absolute w-2 h-2 bg-blue-500 rounded-full top-2 left-2"></div>
//           <div className="absolute w-2 h-2 bg-blue-500 rounded-full top-4 left-6"></div>
//           <div className="absolute w-2 h-2 bg-blue-500 rounded-full top-6 left-4"></div>
//         </div>
//       </div>
//     )
//   },
  {
    id: "pie-chart",
    name: "Pie Chart",
    description: "Show parts of a whole",
    category: "Part of a Whole",
    tags: ["Popular", "Part of a Whole"],
    icon: <PieChart className="size-4" />,
    preview: (
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
      </div>
    )
  },
  {
    id: "bar-chart-legacy",
    name: "Bar Chart (legacy)",
    description: "Legacy bar chart implementation",
    category: "Ranking",
    tags: ["Legacy"],
    deprecated: true,
    icon: <BarChart3 className="size-4" />,
    preview: (
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded relative">
        <div className="w-16 h-12 bg-gradient-to-r from-yellow-500 to-green-500 rounded"></div>
        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded">DEPRECATED</div>
      </div>
    )
  },
  {
    id: "world-map",
    name: "World Map",
    description: "Geographic data visualization",
    category: "Map",
    tags: ["Map", "Geographic"],
    icon: <Globe className="size-4" />,
    preview: (
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
        <div className="w-16 h-12 bg-blue-200 dark:bg-blue-800 rounded relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-600 rounded"></div>
        </div>
      </div>
    )
  },
  {
    id: "waterfall-chart",
    name: "Waterfall Chart",
    description: "Show cumulative effect of values",
    category: "Evolution",
    tags: ["Advanced-Analytics", "Evolution"],
    icon: <Zap className="size-4" />,
    preview: (
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
        <div className="flex items-end gap-1 h-12">
          <div className="w-2 bg-red-500 rounded-t h-4"></div>
          <div className="w-2 bg-green-500 rounded-t h-8"></div>
          <div className="w-2 bg-red-500 rounded-t h-6"></div>
        </div>
      </div>
    )
  }
]

const categories = [
  "Correlation",
  "Distribution", 
  "Evolution",
  "Flow",
  "KPI",
  "Map",
  "Part of a Whole",
  "Ranking",
  "Table"
]

const recommendedTags = [
  { name: "Popular", active: true },
  { name: "ECharts", active: false },
  { name: "Advanced-Analytics", active: false }
]

interface CreateChartModalProps {
  isOpen: boolean
  onClose: () => void
  onChartSelect: (chartType: ChartType) => void
}

export default function CreateChartModal({ isOpen, onClose, onChartSelect }: CreateChartModalProps) {
  const [selectedDataset, setSelectedDataset] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All charts")
  const [selectedTags, setSelectedTags] = useState<string[]>(["Popular"])
  const [expandedSections, setExpandedSections] = useState({
    recommended: true,
    category: true
  })

  const filteredCharts = chartTypes.filter(chart => {
    const matchesSearch = chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chart.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "All charts" || chart.category === selectedCategory
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => chart.tags.includes(tag))
    
    return matchesSearch && matchesCategory && matchesTags
  })

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

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
      <DialogContent className="max-w-none sm:max-w-none w-[95vw] h-[90vh] p-0">
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

                {/* Recommended Tags */}
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
                    Recommended tags
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2">
                    {recommendedTags.map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => toggleTag(tag.name)}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedTags.includes(tag.name)
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* Category */}
                <Collapsible 
                  open={expandedSections.category}
                  onOpenChange={() => toggleSection('category')}
                >
                  <CollapsibleTrigger className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    {expandedSections.category ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                    Category
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
                    {categories.map((category) => (
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
                      <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Choose a dataset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dataset1">Sample Dataset 1</SelectItem>
                          <SelectItem value="dataset2">Sample Dataset 2</SelectItem>
                          <SelectItem value="dataset3">Sample Dataset 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="link" className="text-indigo-600 dark:text-indigo-400 p-0 h-auto">
                      <ExternalLink className="size-4 mr-1" />
                      Add a dataset or view instructions
                    </Button>
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
                  <div className="grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-6">
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
                              {chart.preview}
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
      </DialogContent>
    </Dialog>
  )
}
