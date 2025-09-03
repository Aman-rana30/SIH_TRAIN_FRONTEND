"use client"

import type React from "react"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { useSchedule } from "@/hooks/use-train-data"

export default function SettingsPage() {
  // Get active trains for the section
  const { data: activeSchedule } = useSchedule()
  const [dark, setDark] = useState(true)
  const [trainId, setTrainId] = useState("")
  const [minutes, setMinutes] = useState("5")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [simulationResult, setSimulationResult] = useState<any>(null)

  useEffect(() => {
    const el = document.documentElement
    if (dark) el.classList.add("dark")
    else el.classList.remove("dark")
  }, [dark])

  async function simulateDelay(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    setSimulationResult(null)
    try {
      const payload = {
        disruption: {
          type: "delay",
          delay_minutes: Number(minutes),
          description: `Manual simulation for train ${trainId}`,
        },
        affected_trains: [trainId],
      }
      // Get sectionId from localStorage
      const sectionId = (typeof window !== "undefined" &&
        JSON.parse(localStorage.getItem("rcd_user") || '{"sectionId": ""}').sectionId) || ""
      // Pass sectionId as query param if present
      const url = sectionId
        ? `/api/schedule/whatif?section_id=${encodeURIComponent(sectionId)}`
        : "/api/schedule/whatif"
      const response = await api.post(url, payload)
      setSimulationResult(response.data)
      setMessage("Simulation requested successfully.")
    } catch (e) {
      const errorDetail = (e as any).response?.data?.detail || "An unknown error occurred."
      setMessage(`Failed to simulate: ${errorDetail}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Dark Mode</div>
            <div className="text-sm text-muted-foreground">Toggle dark theme</div>
          </div>
          <button
            className="rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm hover:bg-muted/50"
            onClick={() => setDark((v) => !v)}
          >
            {dark ? "Disable" : "Enable"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold">What-if Simulation</h3>
        <form onSubmit={simulateDelay} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Train ID</label>
            <input
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 outline-none ring-offset-background focus:ring-2 focus:ring-[hsl(var(--chart-2))]"
              placeholder="e.g., T-1029"
              value={trainId}
              onChange={(e) => setTrainId(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Delay (minutes)</label>
            <input
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 outline-none ring-offset-background focus:ring-2 focus:ring-[hsl(var(--chart-2))]"
              type="number"
              min={0}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              className="inline-flex w-full items-center justify-center rounded-md bg-[hsl(var(--chart-2))] px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Sending..." : "Simulate"}
            </button>
          </div>
        </form>
        {message && <div className="mt-3 text-sm text-muted-foreground">{message}</div>}

        {/* Simulation Results Card */}
        {simulationResult && (
          <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4 shadow">
            <h4 className="text-md font-semibold mb-2">Simulation Results</h4>
            {/* Display relevant metrics if present */}
            {simulationResult.metrics && (
              <div className="mb-2 text-sm">
                <div><span className="font-medium">Total Delay:</span> {simulationResult.metrics.total_delay} min</div>
                <div><span className="font-medium">Affected Trains:</span> {simulationResult.metrics.affected_trains?.join(", ")}</div>
              </div>
            )}
            {/* Display new schedules if present, filtered to only active trains */}
            {simulationResult.schedules && Array.isArray(simulationResult.schedules) && simulationResult.schedules.length > 0 && (
              <div className="mt-2">
                <div className="font-medium mb-1">Updated Schedules:</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-border rounded-lg">
                    <thead>
                      <tr className="bg-muted/40">
                        <th className="px-2 py-1 border border-border">Train ID</th>
                        <th className="px-2 py-1 border border-border">Type</th>
                        <th className="px-2 py-1 border border-border">Planned Time</th>
                        <th className="px-2 py-1 border border-border">Optimized Time</th>
                        <th className="px-2 py-1 border border-border">Delay (min)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeSchedule && Array.isArray(activeSchedule)
                        ? simulationResult.schedules.filter((sch: any) => {
                            // Match train_id in sch with any train in activeSchedule
                            const schId = sch.train?.train_id || sch.train_id;
                            return activeSchedule.some((t: any) => (t.train?.train_id || t.train_id) === schId);
                          })
                        : simulationResult.schedules
                      ).map((sch: any) => (
                        <tr key={sch.schedule_id}>
                          <td className="px-2 py-1 border border-border">{sch.train?.train_id || sch.train_id}</td>
                          <td className="px-2 py-1 border border-border">{sch.train?.type || "N/A"}</td>
                          <td className="px-2 py-1 border border-border">{sch.planned_time ? new Date(sch.planned_time).toLocaleString() : "N/A"}</td>
                          <td className="px-2 py-1 border border-border">{sch.optimized_time ? new Date(sch.optimized_time).toLocaleString() : "N/A"}</td>
                          <td className="px-2 py-1 border border-border">{sch.delay_minutes ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Fallback for other data */}
            {!simulationResult.schedules && !simulationResult.metrics && (
              <pre className="mt-2 text-xs bg-muted/10 p-2 rounded">{JSON.stringify(simulationResult, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}