"use client"

import type React from "react"

import { useState } from "react"
import api from "@/lib/api"
import { useSchedule } from "@/hooks/use-train-data"

type SimulationType = "TRAIN_DELAY" | "ENVIRONMENTAL_CONDITION"
type WeatherCondition = "CLEAR" | "RAIN" | "HEAVY_RAIN" | "FOG"
type TrackCondition = "GOOD" | "WORN" | "MAINTENANCE"

export default function SettingsPage() {
  // Get active trains for the section
  const { data: activeSchedule } = useSchedule()
  
  // Simulation type selection
  const [simulationType, setSimulationType] = useState<SimulationType>("TRAIN_DELAY")
  
  // Train delay simulation fields
  const [trainId, setTrainId] = useState("")
  const [minutes, setMinutes] = useState("5")
  
  // Environmental condition simulation fields
  const [affectedSections, setAffectedSections] = useState("")
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>("CLEAR")
  const [trackCondition, setTrackCondition] = useState<TrackCondition>("GOOD")
  
  // Common fields
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [simulationResult, setSimulationResult] = useState<any>(null)

  

  async function runSimulation(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    setSimulationResult(null)
    
    try {
      let payload: any
      
      if (simulationType === "TRAIN_DELAY") {
        // Train delay simulation payload
        payload = {
          disruption_event: {
            simulation_type: "TRAIN_DELAY",
            delay_minutes: Number(minutes),
            affected_trains: [trainId],
            description: `Train delay simulation for ${trainId}: ${minutes} minutes delay`
          }
        }
      } else {
        // Environmental condition simulation payload
        const sectionList = affectedSections.split(",").map(s => s.trim()).filter(s => s.length > 0)
        payload = {
          disruption_event: {
            simulation_type: "ENVIRONMENTAL_CONDITION",
            affected_sections: sectionList,
            weather_condition: weatherCondition,
            track_condition: trackCondition,
            description: `Environmental simulation: ${weatherCondition} weather, ${trackCondition} track condition on sections ${sectionList.join(", ")}`
          }
        }
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
      setMessage("Simulation completed successfully.")
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
        <h3 className="mb-4 text-lg font-semibold">Digital Twin Simulation</h3>
        
        {/* Simulation Type Selection */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-muted-foreground">Simulation Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                simulationType === "TRAIN_DELAY"
                  ? "bg-[hsl(var(--chart-2))] text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
              onClick={() => setSimulationType("TRAIN_DELAY")}
            >
              Train Delay
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                simulationType === "ENVIRONMENTAL_CONDITION"
                  ? "bg-[hsl(var(--chart-2))] text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
              onClick={() => setSimulationType("ENVIRONMENTAL_CONDITION")}
            >
              Environmental Condition
            </button>
          </div>
        </div>

        <form onSubmit={runSimulation} className="space-y-4">
          {simulationType === "TRAIN_DELAY" ? (
            // Train Delay Simulation Fields
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Train ID</label>
                <input
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 outline-none ring-offset-background focus:ring-2 focus:ring-[hsl(var(--chart-2))]"
                  placeholder="e.g., T-1029"
                  value={trainId}
                  onChange={(e) => setTrainId(e.target.value)}
                  required
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
                  required
                />
              </div>
            </div>
          ) : (
            // Environmental Condition Simulation Fields
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Affected Sections</label>
                <input
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 outline-none ring-offset-background focus:ring-2 focus:ring-[hsl(var(--chart-2))]"
                  placeholder="e.g., JUC-LDH, LDH-UMB (comma-separated)"
                  value={affectedSections}
                  onChange={(e) => setAffectedSections(e.target.value)}
                  required
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  Enter section IDs separated by commas
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Weather Condition</label>
                  <select
                    className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 outline-none ring-offset-background focus:ring-2 focus:ring-[hsl(var(--chart-2))]"
                    value={weatherCondition}
                    onChange={(e) => setWeatherCondition(e.target.value as WeatherCondition)}
                  >
                    <option value="CLEAR">Clear</option>
                    <option value="RAIN">Rain</option>
                    <option value="HEAVY_RAIN">Heavy Rain</option>
                    <option value="FOG">Fog</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Track Condition</label>
                  <select
                    className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 outline-none ring-offset-background focus:ring-2 focus:ring-[hsl(var(--chart-2))]"
                    value={trackCondition}
                    onChange={(e) => setTrackCondition(e.target.value as TrackCondition)}
                  >
                    <option value="GOOD">Good</option>
                    <option value="WORN">Worn</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-[hsl(var(--chart-2))] px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Running Simulation..." : "Run Simulation"}
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
              <div className="mb-4 space-y-2 text-sm">
                <div><span className="font-medium">Simulation Type:</span> {simulationResult.metrics.simulation_type?.replace('_', ' ')}</div>
                <div><span className="font-medium">Total Delay:</span> {simulationResult.metrics.total_delay} min</div>
                
                {simulationResult.metrics.simulation_type === "TRAIN_DELAY" && (
                  <>
                    <div><span className="font-medium">Affected Trains:</span> {simulationResult.metrics.affected_trains?.join(", ") || "None"}</div>
                    <div><span className="font-medium">Delay Applied:</span> {simulationResult.metrics.delay_minutes} min</div>
                  </>
                )}
                
                {simulationResult.metrics.simulation_type === "ENVIRONMENTAL_CONDITION" && (
                  <>
                    <div><span className="font-medium">Affected Sections:</span> {simulationResult.metrics.affected_sections?.join(", ") || "None"}</div>
                    {simulationResult.metrics.weather_condition && (
                      <div><span className="font-medium">Weather Condition:</span> {simulationResult.metrics.weather_condition}</div>
                    )}
                    {simulationResult.metrics.track_condition && (
                      <div><span className="font-medium">Track Condition:</span> {simulationResult.metrics.track_condition}</div>
                    )}
                  </>
                )}
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