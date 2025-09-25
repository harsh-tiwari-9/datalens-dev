# Query Building Logic Guide

## 🎯 **How Superset Builds Queries**

### **1. Core Components**

Superset's query building follows this pattern:

```
User Input → Query Builder → SQL Generation → Execution
```

**Key Elements:**
- **Metrics**: Aggregations (SUM, COUNT, AVG, MAX, MIN, COUNT_DISTINCT)
- **Dimensions**: Grouping columns (categorical data)
- **Filters**: WHERE conditions (data filtering)
- **Time Range**: Temporal filtering (__time column)
- **Sorting**: ORDER BY clauses
- **Limits**: LIMIT clauses

### **2. Query Structure Pattern**

```sql
SELECT 
  [dimensions],
  [metrics]
FROM [dataset]
WHERE [filters] AND [time_range]
GROUP BY [dimensions]
ORDER BY [sort_columns]
LIMIT [row_limit]
```

## 🛠️ **Our Implementation Strategy**

### **Step 1: User Selection Mapping**

| User Selection | SQL Component | Example |
|----------------|---------------|---------|
| X-Axis | SELECT + GROUP BY | `__time` |
| Dimensions | SELECT + GROUP BY | `category`, `region` |
| Metrics | SELECT (aggregated) | `SUM(amount)`, `COUNT(*)` |
| Filters | WHERE | `category = 'A'` |
| Time Range | WHERE | `__time >= '2024-01-01'` |

### **Step 2: Query Generation Logic**

```typescript
const generateQuery = () => {
  // 1. Build SELECT clause
  const selectParts = []
  
  // Add X-axis (time dimension)
  if (xAxis) selectParts.push(xAxis)
  
  // Add other dimensions
  const otherDimensions = dimensions.filter(d => d !== xAxis)
  selectParts.push(...otherDimensions)
  
  // Add metrics (aggregations)
  const metrics = metrics.map(metric => `${metric}(column) as ${metric}_value`)
  selectParts.push(...metrics)
  
  // 2. Build WHERE clause
  const whereConditions = []
  
  // Time filtering
  if (xAxis.includes('__time')) {
    whereConditions.push(`"${xAxis}" >= CURRENT_TIMESTAMP - INTERVAL '30' DAY`)
  }
  
  // Column filters
  filters.forEach(filter => {
    whereConditions.push(`"${filter}" IS NOT NULL`)
  })
  
  // 3. Build GROUP BY
  const groupByColumns = [xAxis, ...otherDimensions].filter(Boolean)
  
  // 4. Build ORDER BY
  const orderBy = xAxis ? `ORDER BY "${xAxis}" ASC` : ''
  
  // 5. Add LIMIT
  const limit = `LIMIT ${rowLimit}`
  
  return `SELECT ${selectParts.join(', ')} FROM "${dataset}" WHERE ${whereConditions.join(' AND ')} GROUP BY ${groupByColumns.join(', ')} ${orderBy} ${limit}`
}
```

### **Step 3: Chart Type Specific Logic**

Different chart types require different query structures:

#### **Line Charts**
```sql
SELECT 
  __time,
  SUM(amount) as total_amount
FROM dataset
WHERE __time >= '2024-01-01'
GROUP BY __time
ORDER BY __time ASC
```

#### **Bar Charts**
```sql
SELECT 
  category,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM dataset
GROUP BY category
ORDER BY total_amount DESC
```

#### **Pie Charts**
```sql
SELECT 
  category,
  COUNT(*) as count
FROM dataset
GROUP BY category
ORDER BY count DESC
```

#### **Big Number**
```sql
SELECT 
  COUNT(*) as total_count,
  SUM(amount) as total_amount
FROM dataset
```

## 🔧 **Advanced Features**

### **1. Metric Column Selection**

Instead of generic `SUM(*)`, allow users to select which columns to aggregate:

```typescript
interface MetricConfig {
  metric: string;        // SUM, COUNT, AVG, etc.
  column: string;        // Which column to aggregate
  alias: string;         // Custom alias
}

// Example: SUM(amount) as total_sales
const metricExpression = `${metric}(${column}) as ${alias}`
```

### **2. Advanced Filtering**

```typescript
interface FilterConfig {
  column: string;
  operator: '=' | '!=' | '>' | '<' | 'LIKE' | 'IN';
  value: string | number | string[];
}

// Example: category IN ('A', 'B', 'C')
const filterExpression = `"${column}" ${operator} ${formatValue(value)}`
```

### **3. Time Granularity**

```typescript
const timeGranularity = {
  'PT1H': 'HOUR',
  'PT1D': 'DAY', 
  'PT1W': 'WEEK',
  'PT1M': 'MONTH'
}

// Example: TIME_FLOOR(__time, 'PT1H')
const timeExpression = `TIME_FLOOR("${xAxis}", '${granularity}')`
```

## 📊 **Chart-Specific Query Patterns**

### **Time Series Charts**
- **X-Axis**: Time column (__time)
- **Metrics**: Aggregated values
- **Grouping**: Time granularity
- **Example**: Sales over time

### **Categorical Charts**
- **X-Axis**: Category column
- **Metrics**: Aggregated values
- **Grouping**: Category
- **Example**: Sales by region

### **Multi-dimensional Charts**
- **X-Axis**: Primary dimension
- **Dimensions**: Secondary groupings
- **Metrics**: Multiple aggregations
- **Example**: Sales by region and product

## 🚀 **Implementation Tips**

### **1. Query Validation**
```typescript
const validateQuery = (config) => {
  const errors = []
  
  if (!config.metrics.length) {
    errors.push('At least one metric is required')
  }
  
  if (config.chartType === 'line' && !config.xAxis) {
    errors.push('X-axis is required for line charts')
  }
  
  return errors
}
```

### **2. Query Optimization**
```typescript
const optimizeQuery = (query) => {
  // Add indexes hints
  // Optimize time ranges
  // Limit result sets
  // Add appropriate filters
}
```

### **3. Error Handling**
```typescript
const executeQuery = async (query) => {
  try {
    const result = await apiRequest('/query', { body: { query } })
    return result
  } catch (error) {
    if (error.message.includes('syntax')) {
      throw new Error('Invalid SQL syntax')
    }
    if (error.message.includes('timeout')) {
      throw new Error('Query timeout - try reducing data range')
    }
    throw error
  }
}
```

## 🎨 **UI/UX Considerations**

### **1. Real-time Query Preview**
- Show generated SQL as user makes selections
- Highlight syntax errors
- Suggest optimizations

### **2. Smart Defaults**
- Auto-select time column for time series
- Suggest common metrics
- Set reasonable time ranges

### **3. Validation Feedback**
- Real-time validation
- Clear error messages
- Helpful suggestions

This approach gives you a robust, Superset-like query building system that's both powerful and user-friendly!
