# DataLens Visual Query Builder Guide

This guide shows you how to use the visual query builder to create powerful analytics queries without writing SQL.

## 🎯 **Getting Started**

### **Step 1: Select Your Dataset**
- Choose from available datasets (e.g., `light_table`, `druid-test`)
- The system will automatically fetch available columns

### **Step 2: Configure Your Chart**
- **X-Axis**: Drag columns here for your primary dimension
- **Dimensions**: Add additional grouping columns
- **Metrics**: Select aggregation functions (COUNT, SUM, AVG, MAX, MIN)
- **Filters**: Add conditions to filter your data

## 📊 **Chart Type Examples**

### **1. Bar Chart - Service Distribution**
```
Configuration:
├── X-Axis: "service_name"
├── Metrics: COUNT
├── Filters: None
└── Result: Shows count of records per service

Generated Query:
SELECT "service_name", COUNT(*) as count_total 
FROM "light_table" 
GROUP BY "service_name" 
LIMIT 10000
```

### **2. Line Chart - Performance Over Time**
```
Configuration:
├── X-Axis: "__time"
├── Metrics: AVG("value")
├── Filters: "__time" >= last 30 days
└── Result: Shows average performance over time

Generated Query:
SELECT "__time", AVG("value") as avg_total 
FROM "light_table" 
WHERE "__time" >= CURRENT_TIMESTAMP - INTERVAL '365' DAY 
GROUP BY "__time" 
ORDER BY "__time" ASC 
LIMIT 10000
```

### **3. Pie Chart - Status Distribution**
```
Configuration:
├── X-Axis: "status"
├── Metrics: COUNT
├── Filters: None
└── Result: Shows percentage breakdown by status

Generated Query:
SELECT "status", COUNT(*) as count_total 
FROM "light_table" 
GROUP BY "status" 
LIMIT 10000
```

### **4. Heatmap - Service vs Status**
```
Configuration:
├── X-Axis: "service_name"
├── Dimensions: "status"
├── Metrics: COUNT
├── Filters: None
└── Result: Shows service-status combinations

Generated Query:
SELECT "service_name", "status", COUNT(*) as count_total 
FROM "light_table" 
GROUP BY "service_name", "status" 
LIMIT 10000
```

## 🔧 **Advanced Configurations**

### **5. Multi-Metric Analysis**
```
Configuration:
├── X-Axis: "service_name"
├── Metrics: COUNT, SUM("value"), AVG("value")
├── Filters: "value" > 0
└── Result: Multiple metrics per service

Generated Query:
SELECT "service_name", 
       COUNT(*) as count_total,
       SUM("value") as sum_total,
       AVG("value") as avg_total
FROM "light_table" 
WHERE "value" > 0 
GROUP BY "service_name" 
LIMIT 10000
```

### **6. JSON Data Extraction**
```
Configuration:
├── X-Axis: "service_name"
├── Metrics: SUM("$[0].astID") - JSON column
├── Filters: "ext" IS NOT NULL
└── Result: Sum of astID values from JSON

Generated Query:
SELECT "service_name", 
       SUM(CAST(JSON_VALUE("ext", '$[0].astID') AS DOUBLE)) as sum_total
FROM "light_table" 
WHERE "ext" IS NOT NULL 
GROUP BY "service_name" 
LIMIT 10000
```

### **7. Time-based Filtering**
```
Configuration:
├── X-Axis: "__time"
├── Metrics: COUNT
├── Filters: "__time" >= last 7 days
└── Result: Daily counts for the last week

Generated Query:
SELECT "__time", COUNT(*) as count_total 
FROM "light_table" 
WHERE "__time" >= CURRENT_TIMESTAMP - INTERVAL '365' DAY 
GROUP BY "__time" 
ORDER BY "__time" ASC 
LIMIT 10000
```

## 🎨 **Visual Query Builder Interface**

### **Left Panel - Data Source**
```
┌─ Chart Source ─────────────────┐
│ Dataset: [light_table ▼]       │
│                                 │
│ Metrics:                        │
│ ☑ COUNT                         │
│ ☐ SUM                          │
│ ☐ AVG                          │
│ ☐ MAX                          │
│ ☐ MIN                          │
│                                 │
│ Columns:                        │
│ 🔵 service_name (string)       │
│ 🔵 __time (time)               │
│ 🟢 $[0].astID (json)          │
│ 🟢 $[0].voltage (json)        │
│ 🔵 status (string)             │
└─────────────────────────────────┘
```

### **Center Panel - Chart Configuration**
```
┌─ Chart Configuration ───────────┐
│ X-AXIS                          │
│ ┌─────────────────────────────┐ │
│ │ service_name ×              │ │
│ └─────────────────────────────┘ │
│                                 │
│ DIMENSIONS                      │
│ ┌─────────────────────────────┐ │
│ │ status ×                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ METRIC                          │
│ ┌─────────────────────────────┐ │
│ │ COUNT                       │ │
│ └─────────────────────────────┘ │
│                                 │
│ FILTERS                         │
│ ┌─────────────────────────────┐ │
│ │ value ×                     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [CREATE CHART]                  │
└─────────────────────────────────┘
```

### **Right Panel - Chart Preview**
```
┌─ Chart Preview ────────────────┐
│ 📊 Bar Chart                    │
│                                 │
│ service1 ████████████ 1,234    │
│ service2 ██████████ 987         │
│ service3 ████████ 654           │
│ service4 ██████ 321             │
│                                 │
│ Generated Query:                │
│ SELECT "service_name",          │
│        COUNT(*) as count_total  │
│ FROM "light_table"              │
│ GROUP BY "service_name"         │
│ LIMIT 10000                     │
└─────────────────────────────────┘
```

## 🚀 **Pro Tips**

### **1. Drag and Drop Interface**
- **Drag columns** from the left panel to configuration areas
- **Click columns** to add them as dimensions
- **Use the D/F buttons** for quick dimension/filter assignment

### **2. Metric Configuration**
- **COUNT**: Works with any column, counts records
- **SUM/AVG/MAX/MIN**: Require numeric columns
- **JSON columns**: Use the `$[0].fieldName` format

### **3. Filtering Strategies**
- **Time filters**: Automatically applied for `__time` columns
- **Value filters**: Use numeric columns for range filtering
- **Null filters**: Automatically exclude NULL values

### **4. Performance Optimization**
- **Limit results**: Use the row limit setting
- **Filter early**: Add filters to reduce data volume
- **Choose appropriate metrics**: COUNT is fastest, complex aggregations are slower

### **5. Chart Type Selection**
- **Bar Charts**: Best for categorical comparisons
- **Line Charts**: Perfect for time series data
- **Pie Charts**: Great for distribution analysis
- **Heatmaps**: Ideal for two-dimensional data
- **Scatter Plots**: Good for correlation analysis

## 📈 **Real-World Examples**

### **Example 1: Service Performance Dashboard**
```
Goal: Monitor service performance over time

Configuration:
├── Chart Type: Line Chart
├── X-Axis: "__time"
├── Metrics: AVG("response_time")
├── Filters: "__time" >= last 30 days
└── Result: Performance trend line
```

### **Example 2: Error Rate Analysis**
```
Goal: Analyze error rates by service

Configuration:
├── Chart Type: Bar Chart
├── X-Axis: "service_name"
├── Metrics: COUNT (where status = 'error')
├── Filters: "status" = 'error'
└── Result: Error count per service
```

### **Example 3: User Activity Heatmap**
```
Goal: Show user activity by hour and day

Configuration:
├── Chart Type: Heatmap
├── X-Axis: "hour"
├── Dimensions: "day_of_week"
├── Metrics: COUNT
└── Result: Activity intensity grid
```

### **Example 4: Revenue Analysis**
```
Goal: Track revenue by service and month

Configuration:
├── Chart Type: Multi-line Chart
├── X-Axis: "month"
├── Dimensions: "service_name"
├── Metrics: SUM("$[0].revenue")
└── Result: Revenue trends by service
```

## 🎯 **Next Steps**

1. **Start Simple**: Begin with basic COUNT queries
2. **Add Filters**: Use time ranges and value filters
3. **Experiment**: Try different chart types
4. **Optimize**: Use appropriate metrics for your data
5. **Scale**: Build complex multi-dimensional analyses

The visual query builder makes complex analytics accessible to everyone while maintaining the power and flexibility of SQL under the hood!
