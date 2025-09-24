import {
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

export interface ChartType {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  deprecated?: boolean
  icon: React.ReactNode
  preview: string // Image path instead of JSX
}

export const CHART_TYPES: ChartType[] = [
  // KPI Charts
  {
    id: "big-number",
    name: "Big Number",
    description: "Display a single key metric",
    category: "KPI",
    tags: ["Popular", "KPI"],
    icon: <Target className="size-4" />,
    preview: "/big-number.png"
  },
  {
    id: "big-number-trend",
    name: "Big Number with Trendline",
    description: "Display a key metric with trend indicator",
    category: "KPI",
    tags: ["Popular", "KPI"],
    icon: <TrendingUp className="size-4" />,
    preview: "/big-number-trend.png"
  },

  // Basic Charts
  {
    id: "bar-chart",
    name: "Bar Chart",
    description: "Compare values across categories",
    category: "Basic",
    tags: ["Popular", "Basic"],
    icon: <BarChart3 className="size-4" />,
    preview: "/bar-chart.png"
  },
  {
    id: "line-chart",
    name: "Line Chart",
    description: "Show trends over time",
    category: "Basic",
    tags: ["Popular", "Basic"],
    icon: <LineChart className="size-4" />,
    preview: "/big-number.png"
  },
  {
    id: "pie-chart",
    name: "Pie Chart",
    description: "Show parts of a whole",
    category: "Basic",
    tags: ["Popular", "Basic"],
    icon: <PieChart className="size-4" />,
    preview: "/big-number.png"
  },
  {
    id: "area-chart",
    name: "Area Chart",
    description: "Show data trends with filled areas",
    category: "Basic",
    tags: ["Popular", "Basic"],
    icon: <Activity className="size-4" />,
    preview: "/big-number.png"
  },

  // Advanced Charts
  {
    id: "scatter-plot",
    name: "Scatter Plot",
    description: "Show relationship between two variables",
    category: "Advanced",
    tags: ["Advanced-Analytics", "Advanced"],
    icon: <Target className="size-4" />,
    preview: "/big-number.png"
  },
  {
    id: "multi-line",
    name: "Multi Line Chart",
    description: "Compare multiple trends over time",
    category: "Advanced",
    tags: ["Advanced-Analytics", "Advanced"],
    icon: <LineChart className="size-4" />,
    preview: "/big-number.png"
  },
  {
    id: "bubble-chart",
    name: "Bubble Chart",
    description: "Show relationships with size and position",
    category: "Advanced",
    tags: ["Advanced-Analytics", "Advanced"],
    icon: <Target className="size-4" />,
    preview: "/big-number.png"
  },
  {
    id: "heatmap",
    name: "Heatmap",
    description: "Show data density with color intensity",
    category: "Advanced",
    tags: ["Advanced-Analytics", "Advanced"],
    icon: <Map className="size-4" />,
    preview: "/big-number.png"
  },

  // Specialized Charts
  {
    id: "funnel-chart",
    name: "Funnel Chart",
    description: "Show conversion through stages",
    category: "Specialized",
    tags: ["Specialized", "Conversion"],
    icon: <Zap className="size-4" />,
    preview: "/big-number.png"
  },
  {
    id: "radar-chart",
    name: "Radar Chart",
    description: "Compare multiple variables in a circular format",
    category: "Specialized",
    tags: ["Specialized", "Multi-variable"],
    icon: <Target className="size-4" />,
    preview: "/big-number.png"
  },
  {
    id: "time-series",
    name: "Time Series",
    description: "Analyze data points over time intervals",
    category: "Specialized",
    tags: ["Specialized", "Time"],
    icon: <TrendingUp className="size-4" />,
    preview: "/big-number.png"
  },
  {
    id: "histogram",
    name: "Histogram",
    description: "Show distribution of data values",
    category: "Specialized",
    tags: ["Specialized", "Distribution"],
    icon: <BarChart3 className="size-4" />,
    preview: "/big-number.png"
  },
  {
    id: "graph-chart",
    name: "Graph Chart",
    description: "Show relationships between nodes and edges",
    category: "Specialized",
    tags: ["Specialized", "Network"],
    icon: <Globe className="size-4" />,
    preview: "/big-number.png"
  }
]

export const CATEGORIES = [
  "KPI",
  "Basic", 
  "Advanced",
  "Specialized"
]

export const DATASETS = [
  "light_table",
  "druid-test"
]
