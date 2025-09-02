"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import KpiCard from "../components/KpiCard"
import RecommendationCard from "../components/RecommendationCard"
import { useSchedule, useRecommendations } from "../hooks/useTrainData"
import { useMutation } from "@tanstack/react-query"
import api from "../services/api"

export default function DashboardView() {
  const { data: schedule, isLoading: scheduleLoading } = useSchedule()
  const { data: recs } = useRecommendations()

  const kpi = useMemo(() => {
    const total = schedule?.trains?.length || 0
    const conflicts = schedule?.conflicts || 0
    const avgDelay = Math.round(
      (schedule?.trains?.reduce((acc, t) => acc + (t.delayMinutes || 0), 0) || 0) / (total || 1),
    )
    const onTimePct = total
      ? Math.round((schedule.trains.filter((t) => (t.delayMinutes || 0) <= 0).length / total) * 100)
      : 0
    return { total, conflicts, avgDelay, onTimePct }
  }, [schedule])

  const spark = useMemo(() => {
    const len = 12
    const arr = Array.from({ length: len }, (_, i) => ({
      x: i + 1,
      y: Math.round(Math.max(0, (kpi.onTimePct || 60) + Math.sin(i) * 8)),
    }))
    return arr
  }, [kpi.onTimePct])

  const overrideMutation = useMutation({
    mutationFn: async (order) => {
      return api.post("/api/override", { order }).then((res) => res.data)
    },
  })

  function applyRecommendation() {
    const order = recs?.order || []
    if (order.length) overrideMutation.mutate(order)
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Trains" value={scheduleLoading ? "..." : kpi.total} />
        <KpiCard
          title="Conflicts"
          value={scheduleLoading ? "..." : kpi.conflicts}
          badge={
            <span className={`badge ${kpi.conflicts === 0 ? "badge-ok" : "badge-warn"}`}>
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
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                <Line type="monotone" dataKey="y" stroke="#0ea5a4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </KpiCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Today’s Schedule Snapshot</h3>
              <a className="text-sm text-brand hover:underline" href="/gantt">
                Open Gantt →
              </a>
            </div>
            <p className="text-sm text-slate-300">
              {schedule?.trains
                ?.slice(0, 3)
                .map((t) => t.name)
                .join(", ") || "Loading schedule..."}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <RecommendationCard
            title={recs?.title || "Optimize order to reduce delays"}
            detail={
              recs?.detail ||
              "AI proposes reordering expresses before locals at Junction 12 to minimize cascading delays."
            }
            onApply={applyRecommendation}
          />
          {recs?.secondary?.map((r, i) => (
            <RecommendationCard key={i} title={r.title} detail={r.detail} onApply={applyRecommendation} />
          ))}
        </div>
      </div>
    </div>
  )
}
