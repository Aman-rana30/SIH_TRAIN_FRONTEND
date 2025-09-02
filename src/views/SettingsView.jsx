"use client"

import { useEffect, useState } from "react"
import api from "../services/api"

export default function SettingsView() {
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

  async function simulateDelay(e) {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      await api.post("/api/simulate-delay", { trainId, minutes: Number(minutes) })
      setMessage("Simulation requested.")
    } catch (e) {
      setMessage("Failed to simulate.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card p-4">
        <h3 className="mb-2 text-lg font-semibold">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Dark Mode</div>
            <div className="text-sm text-slate-300">Toggle dark theme</div>
          </div>
          <button className="btn btn-secondary" onClick={() => setDark((v) => !v)}>
            {dark ? "Disable" : "Enable"}
          </button>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="mb-2 text-lg font-semibold">What-if Simulation</h3>
        <form onSubmit={simulateDelay} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Train ID</label>
            <input
              className="input"
              placeholder="e.g., T-1029"
              value={trainId}
              onChange={(e) => setTrainId(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Delay (minutes)</label>
            <input
              className="input"
              type="number"
              min="0"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button className="btn btn-primary w-full" disabled={saving}>
              {saving ? "Sending..." : "Simulate"}
            </button>
          </div>
        </form>
        {message && <div className="mt-3 text-sm text-slate-300">{message}</div>}
      </div>
    </div>
  )
}
