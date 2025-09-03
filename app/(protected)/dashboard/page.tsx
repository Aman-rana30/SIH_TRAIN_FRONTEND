"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import KpiCard from "@/components/KpiCard"
import RecommendationCard from "@/components/RecommendationCard"
import { useRecommendations, useSchedule } from "@/hooks/use-train-data"
import { useMutation } from "@tanstack/react-query"
import api from "@/lib/api"

export default function DashboardPage() {
  const { data: scheduleData, isLoading: scheduleLoading } = useSchedule()
  const { data: metricsData } = useRecommendations()

  const kpi = useMemo(() => {
    // The schedule is the data array itself
    const total = scheduleData?.length || 0
    // We can get conflict info from metrics if available, otherwise default to 0
    const conflicts = metricsData?.current_metrics?.conflicts_resolved || 0
    const avgDelay = Math.round(
      // The schedule is now a list of schedule objects
      (scheduleData?.reduce((acc: number, t: any) => acc + (t.delay_minutes || 0), 0) || 0) / (total || 1),
    )
    const onTimePct = total
      ? Math.round((scheduleData.filter((t: any) => (t.delay_minutes || 0) <= 0).length / total) * 100)
      : 0
    return { total, conflicts, avgDelay, onTimePct }
  }, [scheduleData, metricsData])

  const spark = useMemo(() => {
    const len = 12
    const arr = Array.from({ length: len }, (_, i) => ({
      x: i + 1,
      y: Math.round(Math.max(0, (kpi.onTimePct || 60) + Math.sin(i) * 8)),
    }))
    return arr
  }, [kpi.onTimePct])

  const overrideMutation = useMutation({
    mutationFn: async (order: string[]) => api.post("/api/override", { order }).then((r) => r.data),
  })

  function applyRecommendation(rec: string) {
    // You can define what applying a recommendation does, e.g., trigger an API call
    console.log("Applying recommendation:", rec)
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Trains" value={scheduleLoading ? "..." : kpi.total} />
        <KpiCard
          title="Conflicts"
          value={scheduleLoading ? "..." : kpi.conflicts}
          badge={
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                kpi.conflicts === 0 ? "bg-emerald-600/20 text-emerald-400" : "bg-red-600/20 text-red-400"
              }`}
            >
              {kpi.conflicts === 0 ? "OK" : "Attention"}
            </span>
          }
        />
        <KpiCard title="Avg Delay (min)" value={scheduleLoading ? "..." : kpi.avgDelay} />
        <KpiCard title="On-Time %" value={scheduleLoading ? "..." : `${kpi.onTimePct}%`}>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spark}>
                <XAxis dataKey="x" hide />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line type="monotone" dataKey="y" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </KpiCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Today’s Schedule Snapshot</h3>
              <a className="text-sm text-[hsl(var(--chart-2))] hover:underline" href="/gantt">
                Open Gantt →
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              {scheduleLoading 
                ? "Loading schedule..."
                : scheduleData?.length 
                  ? `Tracking ${scheduleData.length} active trains.`
                  : "No active trains found for this section. Try running a simulation to generate data."}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {/* Use the recommendations and alerts from the metrics endpoint */}
          {metricsData?.recommendations?.map((rec: string, i: number) => (
             <RecommendationCard key={`rec-${i}`} title={rec} onApply={() => applyRecommendation(rec)} />
          ))}
          {metricsData?.alerts?.map((alert: string, i: number) => (
             <RecommendationCard key={`alert-${i}`} title={alert} detail="System Alert" onApply={() => {}} />
          ))}
        </div>
      </div>
    </div>
  )
}