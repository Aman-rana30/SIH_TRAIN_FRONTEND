"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useMutation } from "@tanstack/react-query"
import { Train, Activity, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSchedule } from "@/hooks/use-train-data"
import api from "@/lib/api"

type SimulationType = "TRAIN_DELAY" | "ENVIRONMENTAL_CONDITION"
type WeatherCondition = "CLEAR" | "RAIN" | "HEAVY_RAIN" | "FOG"
type TrackCondition = "GOOD" | "WORN" | "MAINTENANCE"

// Dynamically import the MapSimulation component with SSR turned off
const MapSimulation = dynamic(() => import("@/components/MapSimulation"), {
  ssr: false,
  // Optional: Add a loading skeleton while the map loads
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center bg-muted rounded-2xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold">Loading Railway Map...</h3>
        <p className="text-muted-foreground">Fetching track and station data</p>
      </div>
    </div>
  ),
})

export default function MapPage() {
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
  const [message, setMessage] = useState("")
  const [simulationResult, setSimulationResult] = useState<any>(null)

  // Mutation for simulation API call
  const simulationMutation = useMutation({
    mutationFn: async (payload: any) => {
      // Get sectionId from localStorage
      const sectionId = (typeof window !== "undefined" &&
        JSON.parse(localStorage.getItem("rcd_user") || '{"sectionId": ""}').sectionId) || ""
      
      // Pass sectionId as query param if present
      const url = sectionId
        ? `/api/schedule/whatif?section_id=${encodeURIComponent(sectionId)}`
        : "/api/schedule/whatif"
        
      const response = await api.post(url, payload)
      return response.data
    },
    onSuccess: (data) => {
      setSimulationResult(data)
      setMessage("Simulation completed successfully.")
    },
    onError: (e: any) => {
      const errorDetail = e.response?.data?.detail || "An unknown error occurred."
      setMessage(`Failed to simulate: ${errorDetail}`)
    }
  })

  async function runSimulation(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setSimulationResult(null)
    
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
    
    simulationMutation.mutate(payload)
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Train className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Train Map</h1>
            <p className="text-sm text-muted-foreground">Real-time train positions and railway simulation</p>
          </div>
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">System Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Live Updates</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <div className="h-[calc(100vh-200px)] min-h-[600px]">
          <MapSimulation />
        </div>
      </div>

      {/* What-if Simulation Card */}
      <Card>
        <CardHeader>
          <CardTitle>Run a What-if Simulation</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <select
                    className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 outline-none ring-offset-background focus:ring-2 focus:ring-[hsl(var(--chart-2))]"
                    value={trainId}
                    onChange={(e) => setTrainId(e.target.value)}
                    required
                  >
                    <option value="">Select a train</option>
                    {activeSchedule?.map((train: any) => (
                      <option key={train.train_id} value={train.train_id}>
                        {train.train_id} - {train.train_name || train.type}
                      </option>
                    ))}
                  </select>
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
                disabled={simulationMutation.isPending}
              >
                {simulationMutation.isPending ? "Running Simulation..." : "Run Simulation"}
              </button>
            </div>
          </form>
          
          {message && <div className="mt-3 text-sm text-muted-foreground">{message}</div>}

          {/* Simulation Results */}
          {simulationResult && (
            <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4 shadow">
              <h4 className="text-md font-semibold mb-2">Simulation Results</h4>
              {simulationResult.metrics && (
                <div className="mb-4 space-y-2 text-sm">
                  <div><span className="font-medium">Total Delay:</span> {simulationResult.metrics.total_delay} min</div>
                  <div><span className="font-medium">Conflicts Resolved:</span> {simulationResult.metrics.conflicts_resolved || 0}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <Train className="h-4 w-4 text-primary" />
          <div>
            <div className="font-medium">Route Coverage</div>
            <div className="text-muted-foreground">Jalandhar - Ludhiana Section</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <Clock className="h-4 w-4 text-primary" />
          <div>
            <div className="font-medium">Update Frequency</div>
            <div className="text-muted-foreground">Real-time (2s intervals)</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <div>
            <div className="font-medium">Conflict Detection</div>
            <div className="text-muted-foreground">AI-powered monitoring</div>
          </div>
        </div>
      </div>
    </div>
  )
}