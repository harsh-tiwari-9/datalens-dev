# DataLens Query Examples

This guide provides comprehensive examples of the powerful querying capabilities available in DataLens.

## 🎯 **Basic Query Types**

### 1. **Simple Count Queries**
```sql
-- Count all records
SELECT COUNT(*) as total_count FROM "light_table"

-- Count with grouping
SELECT "service_name", COUNT(*) as count_total 
FROM "light_table" 
GROUP BY "service_name" 
LIMIT 10000
```

### 2. **Time Series Analysis**
```sql
-- Daily metrics over time
SELECT "__time", COUNT(*) as count_total 
FROM "light_table" 
WHERE "__time" >= CURRENT_TIMESTAMP - INTERVAL '365' DAY 
GROUP BY "__time" 
ORDER BY "__time" ASC 
LIMIT 10000

-- Hourly breakdown
SELECT DATE_TRUNC('hour', "__time") as hour, COUNT(*) as count_total 
FROM "light_table" 
WHERE "__time" >= CURRENT_TIMESTAMP - INTERVAL '7' DAY 
GROUP BY DATE_TRUNC('hour', "__time") 
ORDER BY hour ASC 
LIMIT 10000
```

### 3. **Aggregation Queries**
```sql
-- Sum of values
SELECT "service_name", SUM("value") as sum_total 
FROM "light_table" 
GROUP BY "service_name" 
LIMIT 10000

-- Average values
SELECT "service_name", AVG("value") as avg_total 
FROM "light_table" 
GROUP BY "service_name" 
LIMIT 10000

-- Multiple aggregations
SELECT "service_name", 
       COUNT(*) as count_total,
       SUM("value") as sum_total,
       AVG("value") as avg_total,
       MAX("value") as max_total,
       MIN("value") as min_total
FROM "light_table" 
GROUP BY "service_name" 
LIMIT 10000
```

## 🔍 **Advanced Query Patterns**

### 4. **JSON Data Extraction**
```sql
-- Extract from JSON columns
SELECT "service_name", 
       SUM(CAST(JSON_VALUE("ext", '$[0].astID') AS DOUBLE)) as astid_sum,
       AVG(CAST(JSON_VALUE("ext", '$[0].voltage') AS DOUBLE)) as voltage_avg
FROM "light_table" 
WHERE "ext" IS NOT NULL 
GROUP BY "service_name" 
LIMIT 10000

-- Complex JSON path extraction
SELECT "service_name",
       JSON_VALUE("ext", '$[0].metrics.performance') as performance,
       JSON_VALUE("ext", '$[0].metrics.efficiency') as efficiency
FROM "light_table" 
WHERE JSON_VALUE("ext", '$[0].metrics') IS NOT NULL 
LIMIT 10000
```

### 5. **Filtering and Conditions**
```sql
-- Filter by specific values
SELECT "service_name", COUNT(*) as count_total 
FROM "light_table" 
WHERE "status" = 'active' 
  AND "value" > 100 
GROUP BY "service_name" 
LIMIT 10000

-- Date range filtering
SELECT "__time", COUNT(*) as count_total 
FROM "light_table" 
WHERE "__time" >= '2024-01-01' 
  AND "__time" <= '2024-12-31' 
GROUP BY "__time" 
ORDER BY "__time" ASC 
LIMIT 10000

-- Multiple conditions
SELECT "service_name", "status", COUNT(*) as count_total 
FROM "light_table" 
WHERE "value" > 50 
  AND "status" IN ('active', 'running') 
  AND "service_name" IS NOT NULL 
GROUP BY "service_name", "status" 
LIMIT 10000
```

### 6. **Time-based Analysis**
```sql
-- Daily aggregations
SELECT DATE_TRUNC('day', "__time") as date, 
       COUNT(*) as daily_count,
       AVG("value") as daily_avg
FROM "light_table" 
WHERE "__time" >= CURRENT_TIMESTAMP - INTERVAL '30' DAY 
GROUP BY DATE_TRUNC('day', "__time") 
ORDER BY date ASC 
LIMIT 10000

-- Weekly trends
SELECT DATE_TRUNC('week', "__time") as week, 
       COUNT(*) as weekly_count
FROM "light_table" 
WHERE "__time" >= CURRENT_TIMESTAMP - INTERVAL '12' WEEK 
GROUP BY DATE_TRUNC('week', "__time") 
ORDER BY week ASC 
LIMIT 10000

-- Monthly summaries
SELECT DATE_TRUNC('month', "__time") as month, 
       COUNT(*) as monthly_count,
       SUM("value") as monthly_sum
FROM "light_table" 
WHERE "__time" >= CURRENT_TIMESTAMP - INTERVAL '12' MONTH 
GROUP BY DATE_TRUNC('month', "__time") 
ORDER BY month ASC 
LIMIT 10000
```

## 📊 **Chart-Specific Query Examples**

### 7. **Bar Chart Queries**
```sql
-- Service distribution
SELECT "service_name", COUNT(*) as count_total 
FROM "light_table" 
GROUP BY "service_name" 
ORDER BY count_total DESC 
LIMIT 20

-- Top performing services
SELECT "service_name", AVG("value") as avg_performance 
FROM "light_table" 
WHERE "value" > 0 
GROUP BY "service_name" 
ORDER BY avg_performance DESC 
LIMIT 10
```

### 8. **Line Chart Queries**
```sql
-- Performance over time
SELECT "__time", AVG("value") as avg_value 
FROM "light_table" 
WHERE "__time" >= CURRENT_TIMESTAMP - INTERVAL '7' DAY 
GROUP BY "__time" 
ORDER BY "__time" ASC 
LIMIT 10000

-- Service performance trends
SELECT "__time", "service_name", AVG("value") as avg_value 
FROM "light_table" 
WHERE "__time" >= CURRENT_TIMESTAMP - INTERVAL '30' DAY 
  AND "service_name" IN ('service1', 'service2', 'service3')
GROUP BY "__time", "service_name" 
ORDER BY "__time" ASC 
LIMIT 10000
```

### 9. **Pie Chart Queries**
```sql
-- Status distribution
SELECT "status", COUNT(*) as count_total 
FROM "light_table" 
GROUP BY "status" 
ORDER BY count_total DESC 
LIMIT 10

-- Category breakdown
SELECT "category", COUNT(*) as count_total 
FROM "light_table" 
WHERE "category" IS NOT NULL 
GROUP BY "category" 
ORDER BY count_total DESC 
LIMIT 15
```

### 10. **Heatmap Queries**
```sql
-- Service vs Status heatmap
SELECT "service_name", "status", COUNT(*) as count_total 
FROM "light_table" 
GROUP BY "service_name", "status" 
ORDER BY "service_name", "status" 
LIMIT 10000

-- Time vs Service heatmap
SELECT DATE_TRUNC('hour', "__time") as hour, 
       "service_name", 
       COUNT(*) as count_total 
FROM "light_table" 
WHERE "__time" >= CURRENT_TIMESTAMP - INTERVAL '24' HOUR 
GROUP BY DATE_TRUNC('hour', "__time"), "service_name" 
ORDER BY hour, "service_name" 
LIMIT 10000
```

## 🚀 **Advanced Analytics Queries**

### 11. **Statistical Analysis**
```sql
-- Service performance statistics
SELECT "service_name",
       COUNT(*) as count_total,
       AVG("value") as mean_value,
       STDDEV("value") as stddev_value,
       MIN("value") as min_value,
       MAX("value") as max_value,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "value") as median_value
FROM "light_table" 
WHERE "value" IS NOT NULL 
GROUP BY "service_name" 
ORDER BY mean_value DESC 
LIMIT 10000
```

### 12. **Comparative Analysis**
```sql
-- Compare services by performance
SELECT "service_name",
       COUNT(*) as total_requests,
       COUNT(CASE WHEN "value" > 100 THEN 1 END) as high_performance_count,
       ROUND(COUNT(CASE WHEN "value" > 100 THEN 1 END) * 100.0 / COUNT(*), 2) as high_performance_percentage
FROM "light_table" 
GROUP BY "service_name" 
ORDER BY high_performance_percentage DESC 
LIMIT 10000
```

### 13. **Trend Analysis**
```sql
-- Performance trends by service
SELECT "service_name",
       DATE_TRUNC('day', "__time") as date,
       AVG("value") as daily_avg,
       LAG(AVG("value")) OVER (PARTITION BY "service_name" ORDER BY DATE_TRUNC('day', "__time")) as prev_day_avg,
       AVG("value") - LAG(AVG("value")) OVER (PARTITION BY "service_name" ORDER BY DATE_TRUNC('day', "__time")) as day_over_day_change
FROM "light_table" 
WHERE "__time" >= CURRENT_TIMESTAMP - INTERVAL '30' DAY 
GROUP BY "service_name", DATE_TRUNC('day', "__time") 
ORDER BY "service_name", date 
LIMIT 10000
```

## 🎯 **Real-World Use Cases**

### 14. **IoT Device Monitoring**
```sql
-- Device performance by location
SELECT "location", "device_type", 
       AVG(CAST(JSON_VALUE("ext", '$[0].voltage') AS DOUBLE)) as avg_voltage,
       COUNT(*) as device_count
FROM "light_table" 
WHERE JSON_VALUE("ext", '$[0].voltage') IS NOT NULL 
GROUP BY "location", "device_type" 
ORDER BY avg_voltage DESC 
LIMIT 10000

-- Underperforming devices
SELECT "device_id", "location",
       AVG(CAST(JSON_VALUE("ext", '$[0].voltage') AS DOUBLE)) as avg_voltage,
       COUNT(*) as measurement_count
FROM "light_table" 
WHERE JSON_VALUE("ext", '$[0].voltage') IS NOT NULL 
  AND CAST(JSON_VALUE("ext", '$[0].voltage') AS DOUBLE) < 30
GROUP BY "device_id", "location" 
ORDER BY avg_voltage ASC 
LIMIT 10000
```

### 15. **Business Intelligence**
```sql
-- Revenue by service and time
SELECT "service_name",
       DATE_TRUNC('month', "__time") as month,
       SUM(CAST(JSON_VALUE("ext", '$[0].revenue') AS DOUBLE)) as monthly_revenue
FROM "light_table" 
WHERE JSON_VALUE("ext", '$[0].revenue') IS NOT NULL 
GROUP BY "service_name", DATE_TRUNC('month', "__time") 
ORDER BY month DESC, monthly_revenue DESC 
LIMIT 10000

-- Customer satisfaction trends
SELECT DATE_TRUNC('week', "__time") as week,
       AVG(CAST(JSON_VALUE("ext", '$[0].satisfaction_score') AS DOUBLE)) as avg_satisfaction
FROM "light_table" 
WHERE JSON_VALUE("ext", '$[0].satisfaction_score') IS NOT NULL 
GROUP BY DATE_TRUNC('week', "__time") 
ORDER BY week ASC 
LIMIT 10000
```

## 🔧 **Query Building Tips**

### **Best Practices:**
1. **Always use LIMIT** to prevent overwhelming results
2. **Filter early** with WHERE clauses to improve performance
3. **Use appropriate time ranges** for time-based queries
4. **Group by relevant dimensions** for meaningful aggregations
5. **Handle NULL values** appropriately with IS NOT NULL filters

### **Performance Optimization:**
- Use indexed columns in WHERE clauses
- Limit result sets with appropriate LIMIT values
- Use DATE_TRUNC for time-based grouping
- Filter on time columns early in the query

### **Common Patterns:**
- **Time Series**: Use `__time` column with DATE_TRUNC
- **Grouping**: Use categorical columns in GROUP BY
- **Filtering**: Use WHERE clauses for data selection
- **Aggregation**: Use COUNT, SUM, AVG, MAX, MIN functions
- **JSON Extraction**: Use JSON_VALUE for nested data

This query system supports complex analytics while maintaining simplicity for basic use cases. The visual query builder in DataLens automatically generates these SQL queries based on your chart configuration!
