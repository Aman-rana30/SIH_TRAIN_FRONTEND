"use client"

import type React from "react"

import { useEffect, useState } from "react"
import api from "@/lib/api"

export default function SettingsPage() {
  const [dark, setDark] = useState(true)
  const [trainId, setTrainId] = useState("")
  const [minutes, setMinutes] = useState("5")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const el = document.documentElement
    if (dark) el.classList.add("dark")
    else el.classList.remove("dark")
  }, [dark])

  async function simulateDelay(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      // Corrected payload structure
      const payload = {
        disruption: {
          type: "delay",
          delay_minutes: Number(minutes),
          description: `Manual simulation for train ${trainId}`,
        },
        affected_trains: [trainId],
      }
      
      // Corrected API endpoint URL
      await api.post("/api/schedule/whatif", payload)
      
      setMessage("Simulation requested successfully.")
    } catch (e) {
      // Provide a more descriptive error message
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
      </div>
    </div>
  )
}