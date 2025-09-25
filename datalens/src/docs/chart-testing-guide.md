# Chart Testing Guide

Based on your data structure, here are different combinations to test various chart formations:

## 📊 **Data Structure Analysis**

Your data contains:
- **Regular columns**: `__time`, `ver`, `pld`, `svc`, `aid`, `eid`, `dvm`, `evt`, `evc`, `seqid`
- **JSON column**: `ext` with nested data like `$[0].astID`, `$[0].fassts.d0001`, etc.

## 🎯 **Testing Scenarios**

### **1. Basic Charts (Single Dimension + Metric)**

#### **Scenario A: Service Analysis**
- **X-Axis**: `svc`
- **Metrics**: `COUNT`
- **Expected**: Bar chart showing count of records per service
- **Query**: `SELECT "svc", COUNT(*) as count_total FROM "druid-test" GROUP BY "svc"`

#### **Scenario B: Event Analysis**
- **X-Axis**: `evt`
- **Metrics**: `COUNT`
- **Expected**: Bar chart showing count of events
- **Query**: `SELECT "evt", COUNT(*) as count_total FROM "druid-test" GROUP BY "evt"`

#### **Scenario C: Device Analysis**
- **X-Axis**: `dvm`
- **Metrics**: `COUNT`
- **Expected**: Bar chart showing count per device
- **Query**: `SELECT "dvm", COUNT(*) as count_total FROM "druid-test" GROUP BY "dvm"`

### **2. Time-Based Charts**

#### **Scenario D: Time Series Analysis**
- **X-Axis**: `__time`
- **Metrics**: `COUNT`
- **Expected**: Line chart showing count over time
- **Query**: `SELECT "__time", COUNT(*) as count_total FROM "druid-test" GROUP BY "__time"`

#### **Scenario E: Time + Service**
- **X-Axis**: `__time`
- **Dimensions**: `svc`
- **Metrics**: `COUNT`
- **Expected**: Multi-line chart showing count per service over time

### **3. JSON Field Aggregation**

#### **Scenario F: JSON Sum Analysis**
- **X-Axis**: `svc`
- **Metrics**: `SUM`
- **Metric Column**: `$[0].astID`
- **Expected**: Bar chart showing sum of astID per service
- **Query**: `SELECT "svc", SUM(CAST(JSON_VALUE("ext", '$[0].astID') AS DOUBLE)) as sum_total FROM "druid-test" GROUP BY "svc"`

#### **Scenario G: JSON Average Analysis**
- **X-Axis**: `evt`
- **Metrics**: `AVG`
- **Metric Column**: `$[0].fassts.d0001`
- **Expected**: Bar chart showing average of d0001 per event

#### **Scenario H: JSON Max Analysis**
- **X-Axis**: `dvm`
- **Metrics**: `MAX`
- **Metric Column**: `$[0].fassts.d0002`
- **Expected**: Bar chart showing maximum d0002 per device

### **4. Multi-Dimensional Charts**

#### **Scenario I: Service + Event Analysis**
- **X-Axis**: `svc`
- **Dimensions**: `evt`
- **Metrics**: `COUNT`
- **Expected**: Grouped bar chart showing count by service and event

#### **Scenario J: Device + Event Analysis**
- **X-Axis**: `dvm`
- **Dimensions**: `evt`, `eid`
- **Metrics**: `COUNT`
- **Expected**: Complex grouped chart

### **5. Filtered Charts**

#### **Scenario K: Filtered by Event**
- **X-Axis**: `svc`
- **Metrics**: `COUNT`
- **Filters**: `evt`
- **Expected**: Bar chart showing count per service, filtered by event type

#### **Scenario L: Filtered by Device**
- **X-Axis**: `evt`
- **Metrics**: `SUM`
- **Metric Column**: `$[0].fassts.d0001`
- **Filters**: `dvm`
- **Expected**: Bar chart showing sum per event, filtered by device

### **6. Complex Aggregations**

#### **Scenario M: Multiple Metrics**
- **X-Axis**: `svc`
- **Metrics**: `COUNT`, `SUM`, `AVG`
- **Metric Columns**: 
  - `SUM`: `$[0].fassts.d0001`
  - `AVG`: `$[0].fassts.d0002`
- **Expected**: Multi-metric bar chart

#### **Scenario N: Time + JSON Aggregation**
- **X-Axis**: `__time`
- **Metrics**: `SUM`
- **Metric Column**: `$[0].fassts.d0001`
- **Expected**: Time series line chart showing sum over time

### **7. Special Chart Types**

#### **Scenario O: Pie Chart**
- **X-Axis**: `evt`
- **Metrics**: `COUNT`
- **Expected**: Pie chart showing distribution of events

#### **Scenario P: Heatmap**
- **X-Axis**: `svc`
- **Dimensions**: `evt`
- **Metrics**: `COUNT`
- **Expected**: Heatmap showing count by service and event

#### **Scenario Q: Big Number**
- **Metrics**: `COUNT`
- **Expected**: Big number display showing total count

## 🧪 **Testing Steps**

1. **Start with basic scenarios** (A, B, C)
2. **Test time-based charts** (D, E)
3. **Test JSON aggregations** (F, G, H)
4. **Test multi-dimensional** (I, J)
5. **Test filtered charts** (K, L)
6. **Test complex aggregations** (M, N)
7. **Test special chart types** (O, P, Q)

## 📝 **Expected Results**

Each scenario should generate:
- **Valid SQL query**
- **Proper chart visualization**
- **Correct data extraction**
- **Appropriate chart type**

## 🔧 **Debugging Tips**

- Check console for generated queries
- Verify JSON paths are correct
- Ensure GROUP BY clauses are proper
- Validate metric column selections
- Test with different chart types

## 🎨 **Chart Type Recommendations**

- **Bar Charts**: Categorical data (svc, evt, dvm)
- **Line Charts**: Time series data (__time)
- **Pie Charts**: Distribution data (evt, svc)
- **Area Charts**: Time series with trends
- **Scatter Plots**: Correlation analysis
- **Heatmaps**: Multi-dimensional data
- **Big Numbers**: Summary statistics
