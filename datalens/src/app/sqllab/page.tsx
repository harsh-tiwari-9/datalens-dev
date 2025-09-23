import Navbar04Page from "@/components/navbar-04/navbar-04"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, SlidersHorizontal, List } from "lucide-react"

export default function SqlLabPage() {
  return (
    <div className="min-h-svh">
      <Navbar04Page />

      <main className="mx-auto max-w-7xl px-4 py-24">
        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-xl border bg-background">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-sm font-semibold">Tables</h3>
              <Button size="icon" variant="ghost" className="text-indigo-600 dark:text-indigo-400"><List className="size-4" /></Button>
            </div>
            <div className="p-3 space-y-2">
              {['users','products','orders','categories'].map((t) => (
                <div key={t} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-indigo-500/10">
                  <span className="inline-flex size-5 items-center justify-center rounded-sm border text-xs text-muted-foreground">▦</span>
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 border-t">
              <div className="flex items-center justify-between p-3">
                <p className="text-sm font-semibold">Categories</p>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost"><Filter className="size-4" /></Button>
                  <Button size="icon" variant="ghost"><SlidersHorizontal className="size-4" /></Button>
                </div>
              </div>
              <div className="max-h-[360px] space-y-0.5 overflow-auto px-3 pb-3">
                {[
                  ['ID','Integer'],
                  ['Name','Text'],
                  ['Slug','Text'],
                  ['Parent','Integer'],
                  ['Products','Integer'],
                  ['Created At','Timestamp'],
                  ['Updated At','Timestamp'],
                ].map(([col, type]) => (
                  <div key={col} className="grid grid-cols-2 gap-2 rounded-md border px-2 py-1.5 text-sm">
                    <span>{col}</span>
                    <span className="text-muted-foreground">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <section className="space-y-6">
            {/* SQL Editor */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                <CardTitle className="text-sm">SQL Editor</CardTitle>
                <Button className="rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Execute</Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-background">
                  <textarea
                    className="min-h-[180px] w-full resize-y rounded-lg bg-transparent p-3 font-mono text-sm outline-none"
                    defaultValue={`SELECT * FROM users LIMIT 3;`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">Results</CardTitle>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost"><Filter className="size-4" /></Button>
                  <Button size="icon" variant="ghost"><List className="size-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[420px] overflow-auto rounded-md border">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-muted/50 text-muted-foreground">
                      <tr>
                        {['ID','Name','Email','Created At'].map((h) => (
                          <th key={h} className="px-3 py-2 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 1, name: 'John Doe', email: 'john@example.com', created: '2023-04-01' },
                        { id: 2, name: 'Jane Smith', email: 'jane@example.com', created: '2023-04-02' },
                        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created: '2023-04-03' },
                      ].map((r) => (
                        <tr key={r.id} className="border-t">
                          <td className="px-3 py-2">{r.id}</td>
                          <td className="px-3 py-2">{r.name}</td>
                          <td className="px-3 py-2">{r.email}</td>
                          <td className="px-3 py-2">{r.created}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}


