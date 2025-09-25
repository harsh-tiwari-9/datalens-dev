export const METRICS = [
  { name: "AVG", type: "aggregate" },
  { name: "COUNT", type: "aggregate" },
  { name: "MAX", type: "aggregate" },
  { name: "MIN", type: "aggregate" },
  { name: "SUM", type: "aggregate" }
]

export const DATASETS = [
  "light_table",
  "druid-test"
]

export interface Metric {
  name: string
  type: string
}

export interface Column {
  name: string
  type: string
}
