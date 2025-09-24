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

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">24</p>
            <p className="text-xs text-muted-foreground">+3 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">132</p>
            <p className="text-xs text-muted-foreground">12 updated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Datasets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">18</p>
            <p className="text-xs text-muted-foreground">4 new connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">76</p>
            <p className="text-xs text-muted-foreground">Saved this month</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { name: "Solar", meta: "Updated 2d ago" },
                { name: "Sales Overview", meta: "Updated 5d ago" },
                { name: "IoT Devices", meta: "Updated 1w ago" },
                { name: "Customer 360", meta: "Updated 2w ago" },
              ].map((d) => (
                <div key={d.name} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.meta}</p>
                  </div>
                  <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">Open</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start rounded-lg" variant="outline">➕ New dataset</Button>
            <Button className="w-full justify-start rounded-lg" variant="outline">📊 Create chart</Button>
            <Button className="w-full justify-start rounded-lg" variant="outline">📈 Build dashboard</Button>
            <Button className="w-full justify-start rounded-lg" variant="outline">⚙️ Settings</Button>
          </CardContent>
        </Card>
      </section>
    </>
  )
}

