import Navbar04Page from "@/components/navbar-04/navbar-04"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SqlLabPage() {
  return (
    <div className="min-h-svh">
      <Navbar04Page />

      <main className="mx-auto max-w-7xl px-4 py-24">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">DATABASE</label>
            <div className="rounded-md border px-2 py-1.5 text-sm">mysql</div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">SCHEMA</label>
            <div className="rounded-md border px-2 py-1.5 text-sm">jedis</div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">SEE TABLE SCHEMA</label>
            <Input className="h-8 w-[220px]" placeholder="Select table or type" />
          </div>
        </div>

        {/* Editor + Results */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Editor */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Query jedis.voltage_current</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">COPY LINK</Button>
                <Button variant="outline" size="sm">SAVE</Button>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700" size="sm">RUN</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-background">
                <textarea
                  className="min-h-[180px] w-full resize-y rounded-lg bg-transparent p-3 font-mono text-sm outline-none"
                  defaultValue={`SELECT *\nFROM jedis.voltage_current\nLIMIT 10;`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[420px] overflow-auto rounded-md border">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-muted/50 text-muted-foreground">
                    <tr>
                      {['imei','meterid','week','month','year','location','solar_plant','normalized_mppt_voltage'].map((h) => (
                        <th key={h} className="px-3 py-2 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({length:10}).map((_,i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">PAJ0B0MW0C03CBR{i}</td>
                        <td className="px-3 py-2">PTY2 INV 2,1{i}</td>
                        <td className="px-3 py-2">5</td>
                        <td className="px-3 py-2">February</td>
                        <td className="px-3 py-2">2025</td>
                        <td className="px-3 py-2">Rooftop PTY-2</td>
                        <td className="px-3 py-2">SMD</td>
                        <td className="px-3 py-2">30.80343415</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


