"use client"

import { useEffect, useState  } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useIotAnalyticsApi, useOnboardingApi } from "@/hooks/useApi"
import { DATASETS } from "@/constants/chart-creation"

export default function HomePage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<any[]>([])
  const [dashboardCount, setDashboardCount] = useState(0)
  const [chartsCount, setChartsCount] = useState(0)
  const [datasetCount, setDatasetCount] = useState(0)
  const iotApi = useIotAnalyticsApi()
  const onboardingApi = useOnboardingApi()


  useEffect(() => {
    fetchDashboardData()
    fetchChartCount()
    fetchDatasetCount()
  }, [])

  const fetchDatasetCount = () => {
    try {
      console.log("DATASETS:::", DATASETS.length)
      setDatasetCount(DATASETS.length);
      animateCounter(DATASETS.length, 'dataset');
    } catch (error) {
      console.error('Error fetching datasets:', error)
      setDatasetCount(0);
      animateCounter(0, 'dataset');
    }
  }

  const fetchChartCount = async () => {
    try {
      const response = await onboardingApi.request(
        "/jviz/onboard/widget/druid/widget?skip=0&limit=0",
        {
          method: "GET"
        }
      )

      if (response && response.data && Array.isArray(response.data)) {
        setChartsCount(response.data.length);
        animateCounter(response.data.length, 'chart');
      } else {
        setChartsCount(0);
        animateCounter(0, 'chart');
      }
    } catch (error) {
      console.error('Error fetching charts:', error)
      setChartsCount(0);
    }
  }

  const fetchDashboardData = async () => {
    try {
      const response = await iotApi.request("/jviz/analytics/druid/dashboard?skip=0&limit=0", 
        { method: "GET" }
      )

      if(response && response.data && Array.isArray(response.data)) {
        setDashboardData(response.data)
        // Animate counter to actual count
        animateCounter(response.data.length, 'dashboard')
      } else {
        setDashboardData([])
        animateCounter(0, 'dashboard')
      }
      console.log("response:::", response)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  const animateCounter = (targetCount: number, cardType: string) => {
    const duration = 800 // 0.8 seconds
    const startTime = Date.now()
    const startCount = dashboardCount

    const updateCounter = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.round(startCount + (targetCount - startCount) * easeOutQuart)

      if(cardType == 'dashboard') {
        setDashboardCount(currentCount)
      } else if(cardType == 'chart') {
        setChartsCount(currentCount)
      } else if(cardType == 'dataset') {
        setDatasetCount(currentCount)
      }
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      }
    }
    
    requestAnimationFrame(updateCounter)
  }

  return (
    <> 
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-500/10 via-transparent to-indigo-500/5 p-8 md:p-10">
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Jio DataLens</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
            Your data, crafted into real-time insights
          </h1>
          <p className="mt-3 max-w-[48rem] text-muted-foreground">
            Build dashboards, explore datasets, and collaborate across teams. Beautiful defaults with
            a crisp indigo aesthetic, in light or dark mode.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button className="rounded-full">Create dashboard</Button>
            <Button variant="outline" className="rounded-full">New chart</Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 size-[18rem] rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-400/20" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-[22rem] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/10" />
      </section>

      <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Dashboards Card with Wavy Line Chart */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold tracking-tight">{dashboardCount}</p>
                {/* <p className="text-xs text-muted-foreground">+3 this week</p> */}
              </div>
              <div className="w-24 h-16">
                <svg viewBox="0 0 96 64" className="w-full h-full">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8"/>
                    </linearGradient>
                  </defs>
                  <path
                    d="M8,48 Q20,32 32,40 T56,24 T80,16 T88,8"
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    className="opacity-90"
                  />
                  <circle cx="88" cy="8" r="3" fill="#6366f1" />
                  <circle cx="8" cy="48" r="2" fill="#6366f1" opacity="0.6" />
                  <circle cx="32" cy="40" r="2" fill="#6366f1" opacity="0.6" />
                  <circle cx="56" cy="24" r="2" fill="#6366f1" opacity="0.6" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Charts Card with Bar Chart */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold tracking-tight">{chartsCount}</p>
              </div>
              <div className="w-24 h-16 flex items-end gap-1">
                <div className="w-4 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t h-12"></div>
                <div className="w-4 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t h-8"></div>
                <div className="w-4 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t h-14"></div>
                <div className="w-4 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t h-6"></div>
                <div className="w-4 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t h-10"></div>
                <div className="w-4 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t h-9"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Datasets Card with Pie Chart */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Datasets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold tracking-tight">{datasetCount}</p>
              </div>
              <div className="w-20 h-16">
                <svg viewBox="0 0 80 64" className="w-full h-full">
                  <circle cx="40" cy="32" r="24" fill="#e5e7eb" />
                  <path d="M40 8 A24 24 0 0 1 64 32 L40 32 Z" fill="#6366f1" />
                  <path d="M64 32 A24 24 0 0 1 40 56 L40 32 Z" fill="#8b5cf6" />
                  <path d="M40 56 A24 24 0 0 1 16 32 L40 32 Z" fill="#06b6d4" />
                  <circle cx="40" cy="32" r="8" fill="white" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Queries Card with Area Chart */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold tracking-tight">{chartsCount}</p>
                {/* <p className="text-xs text-muted-foreground"></p> */}
              </div>
              <div className="w-24 h-16">
                <svg viewBox="0 0 96 64" className="w-full h-full">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path
                    d="M8,48 Q20,32 32,40 T56,24 T80,16 T88,8 L88,64 L8,64 Z"
                    fill="url(#areaGradient)"
                  />
                  <path
                    d="M8,48 Q20,32 32,40 T56,24 T80,16 T88,8"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-6">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Recent dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
               {dashboardData.map((d) => (
                 <div
                  key={d.id} 
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => {
                    router.push(`/dashboard/${d.id}`)
                  }}
                >
                  <div>
                      <p className="font-medium">{d.name}</p>
                    </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  )
}

