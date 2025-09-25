import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
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
                <p className="text-3xl font-bold tracking-tight">24</p>
                <p className="text-xs text-muted-foreground">+3 this week</p>
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
                <p className="text-3xl font-bold tracking-tight">132</p>
                <p className="text-xs text-muted-foreground">12 updated</p>
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
                <p className="text-3xl font-bold tracking-tight">18</p>
                <p className="text-xs text-muted-foreground">4 new connections</p>
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
                <p className="text-3xl font-bold tracking-tight">76</p>
                <p className="text-xs text-muted-foreground">Saved this month</p>
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
              {[
                { name: "Solar", meta: "Updated 2d ago", chartType: "line" },
                { name: "Sales Overview", meta: "Updated 5d ago", chartType: "bar" },
                { name: "IoT Devices", meta: "Updated 1w ago", chartType: "pie" },
                { name: "Customer 360", meta: "Updated 2w ago", chartType: "area" },
                { name: "Ev Dashboard", meta: "Updated 8w ago", chartType: "funnel" },
                { name: "CMP Failure Analysis", meta: "Updated 2w ago", chartType: "heatmap" },

              ].map((d) => (
                <div 
                  key={d.name} 
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  // onClick={() => {
                  //   // TODO: Navigate to dashboard
                  //   console.log(`Opening dashboard: ${d.name}`)
                  // }}
                >
                  <div className="flex items-center gap-3 justify-between w-full">
                    <div>
                      <p className="font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.meta}</p>
                    </div>
                    {/* Random Chart Preview */}
                    <div className="w-12 h-8 opacity-60">
                      {d.chartType === "line" && (
                        <svg viewBox="0 0 48 32" className="w-full h-full">
                          <path d="M4,24 Q12,16 20,20 T36,8 T44,4" fill="none" stroke="#6366f1" strokeWidth="2"/>
                        </svg>
                      )}
                      {d.chartType === "bar" && (
                        <div className="flex items-end gap-1 h-full">
                          <div className="w-2 bg-indigo-500 rounded-t h-6"></div>
                          <div className="w-2 bg-indigo-500 rounded-t h-4"></div>
                          <div className="w-2 bg-indigo-500 rounded-t h-8"></div>
                          <div className="w-2 bg-indigo-500 rounded-t h-3"></div>
                        </div>
                      )}
                      {d.chartType === "pie" && (
                        <svg viewBox="0 0 32 32" className="w-full h-full">
                          <circle cx="16" cy="16" r="12" fill="#e5e7eb"/>
                          <path d="M16 4 A12 12 0 0 1 28 16 L16 16 Z" fill="#6366f1"/>
                          <path d="M28 16 A12 12 0 0 1 16 28 L16 16 Z" fill="#8b5cf6"/>
                        </svg>
                      )}
                      {d.chartType === "area" && (
                        <svg viewBox="0 0 48 32" className="w-full h-full">
                          <defs>
                            <linearGradient id={`areaGradient-${d.name}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                          <path d="M4,24 L12,20 L20,16 L28,12 L36,8 L44,4 L44,32 L4,32 Z" fill={`url(#areaGradient-${d.name})`}/>
                          <path d="M4,24 L12,20 L20,16 L28,12 L36,8 L44,4" fill="none" stroke="#6366f1" strokeWidth="1.5"/>
                        </svg>
                      )}
                      {d.chartType === "funnel" && (
                        <svg viewBox="0 0 48 32" className="w-full h-full">
                          <path d="M8,4 L40,4 L36,12 L12,12 Z" fill="#6366f1" opacity="0.8"/>
                          <path d="M12,12 L36,12 L32,20 L16,20 Z" fill="#6366f1" opacity="0.6"/>
                          <path d="M16,20 L32,20 L28,28 L20,28 Z" fill="#6366f1" opacity="0.4"/>
                        </svg>
                      )}
                      {d.chartType === "heatmap" && (
                        <svg viewBox="0 0 48 32" className="w-full h-full">
                          <defs>
                            <linearGradient id={`heatmapGradient-${d.name}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2"/>
                              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6"/>
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.9"/>
                            </linearGradient>
                          </defs>
                          <rect x="4" y="4" width="8" height="6" fill="#6366f1" opacity="0.3"/>
                          <rect x="14" y="4" width="8" height="6" fill="#6366f1" opacity="0.6"/>
                          <rect x="24" y="4" width="8" height="6" fill="#6366f1" opacity="0.8"/>
                          <rect x="34" y="4" width="8" height="6" fill="#6366f1" opacity="0.9"/>
                          <rect x="4" y="12" width="8" height="6" fill="#6366f1" opacity="0.4"/>
                          <rect x="14" y="12" width="8" height="6" fill="#6366f1" opacity="0.7"/>
                          <rect x="24" y="12" width="8" height="6" fill="#6366f1" opacity="0.9"/>
                          <rect x="34" y="12" width="8" height="6" fill="#6366f1" opacity="1"/>
                          <rect x="4" y="20" width="8" height="6" fill="#6366f1" opacity="0.5"/>
                          <rect x="14" y="20" width="8" height="6" fill="#6366f1" opacity="0.8"/>
                          <rect x="24" y="20" width="8" height="6" fill="#6366f1" opacity="0.9"/>
                          <rect x="34" y="20" width="8" height="6" fill="#6366f1" opacity="1"/>
                        </svg>
                      )}
                    </div>
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

