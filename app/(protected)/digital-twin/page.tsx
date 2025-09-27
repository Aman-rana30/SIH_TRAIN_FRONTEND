"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { 
  Play, 
  Brain, 
  Info, 
  Map, 
  Activity, 
  Zap, 
  Clock, 
  CheckCircle2,
  Pause,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, BarChart, Bar } from "recharts"

type Scenario = "normal" | "signal" | "maintenance" | "congestion"

const initialStations = [
  { id: "JUC", x: 80, y: 220 },
  { id: "PHR", x: 200, y: 180 },
  { id: "LDH", x: 340, y: 220 },
  { id: "AMB", x: 480, y: 190 },
  { id: "NDLS", x: 640, y: 240 },
]

const initialEdges = [
  ["JUC", "PHR"],
  ["PHR", "LDH"],
  ["LDH", "AMB"],
  ["AMB", "NDLS"],
] as const

export default function DigitalTwinPage() {
  const [scenario, setScenario] = useState<Scenario>("normal")
  const [isRunning, setIsRunning] = useState(false)
  const [appliedOptimization, setAppliedOptimization] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => setTick((t) => (t + 1) % 10000), 100)
    return () => clearInterval(id)
  }, [isRunning])

  const trains = useMemo(() => {
    // Mock three trains moving along the corridor. Position depends on tick and scenario
    const speedFactor = scenario === "congestion" && !appliedOptimization ? 0.4 : 1
    const base = tick * 0.6 * speedFactor
    const offsets = [0, 120, 240]
    return offsets.map((off, i) => {
      const t = (base + off) % 600
      // Map t to polyline across stations
      const segments = initialEdges.length
      const segLen = 600 / segments
      const segIndex = Math.floor(t / segLen)
      const segT = (t % segLen) / segLen
      const [fromId, toId] = initialEdges[segIndex]
      const from = initialStations.find((s) => s.id === fromId)!
      const to = initialStations.find((s) => s.id === toId)!
      const x = from.x + (to.x - from.x) * segT
      const y = from.y + (to.y - from.y) * segT
      return { id: `T${i + 1}`, x, y }
    })
  }, [tick, scenario, appliedOptimization])

  // Congestion color per edge
  const edgeColor = (from: string, to: string) => {
    const key = `${from}-${to}`
    if (appliedOptimization) return "#10b981" // green when optimized
    if (scenario === "signal" && (key === "PHR-LDH" || key === "LDH-AMB")) return "#ef4444"
    if (scenario === "maintenance" && key === "AMB-NDLS") return "#f59e0b"
    if (scenario === "congestion" && (key === "JUC-PHR" || key === "PHR-LDH")) return "#ef4444"
    return "#16a34a"
  }

  const metrics = appliedOptimization
    ? { throughput: 14, delay: 7, conflicts: 0, utilization: 86 }
    : { throughput: scenario === "congestion" ? 8 : 9, delay: 18, conflicts: 3, utilization: 68 }

  const throughputSeries = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        t: i,
        current: i < 6 ? (appliedOptimization ? 12 + i * 0.3 : 8 + i * 0.1) : appliedOptimization ? 13.5 + i * 0.2 : 8.5 + i * 0.1,
        optimized: appliedOptimization ? 14 + i * 0.1 : 12 + i * 0.2,
      })),
    [appliedOptimization],
  )

  const delayBars = [
    { label: "Before AI", delay: 18 },
    { label: "After AI", delay: 7 },
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Digital Twin Simulation</h1>
          <p className="text-muted-foreground mt-1">AI-powered What-if Scenarios for Train Traffic Management</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="cursor-default gap-1"><Info className="h-3 w-3" /> Info</Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">
              Simulate disruptions, reroutes, and throughput optimizations before applying them in real-world operations.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>

      {/* Split view */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Map */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Simulation Map
            </CardTitle>
            <CardDescription>Live corridor with stations, trains, and congestion highlights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-[420px] rounded-lg border bg-card">
              <svg viewBox="0 0 720 320" className="w-full h-full">
                {/* Tracks */}
                {initialEdges.map(([a, b], i) => {
                  const s1 = initialStations.find((s) => s.id === a)!
                  const s2 = initialStations.find((s) => s.id === b)!
                  return (
                    <g key={`edge-${i}`}>
                      <line x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y} stroke={edgeColor(a, b)} strokeWidth={6} strokeLinecap="round" />
                      {/* dashed overlay for rails */}
                      <line x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y} stroke="white" strokeOpacity={0.25} strokeWidth={2} strokeDasharray="6 8" />
                    </g>
                  )
                })}

                {/* Stations */}
                {initialStations.map((s) => (
                  <g key={s.id}>
                    <circle cx={s.x} cy={s.y} r={8} fill="#3b82f6" stroke="white" strokeWidth={2} />
                    <text x={s.x} y={s.y - 14} textAnchor="middle" className="fill-current" fontSize="10" fill="currentColor">
                      {s.id}
                    </text>
                  </g>
                ))}

                {/* Trains */}
                {trains.map((t, i) => (
                  <g key={t.id} className="transition-transform">
                    <motion.circle cx={t.x} cy={t.y - 10} r={7} fill={appliedOptimization ? "#10b981" : "#f97316"} stroke="white" strokeWidth={2} animate={{ opacity: [0.9, 1, 0.9] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} />
                    <text x={t.x} y={t.y - 22} textAnchor="middle" fontSize="9" fill="currentColor" className="fill-current">
                      {t.id}
                    </text>
                  </g>
                ))}
              </svg>
              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex gap-3 text-xs">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-4 bg-green-500 inline-block" /> Normal</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-4 bg-yellow-500 inline-block" /> Maintenance</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-4 bg-red-500 inline-block" /> Congested</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-4 bg-emerald-500 inline-block" /> Optimized</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Control Panel</CardTitle>
            <CardDescription>Choose scenario and control the simulation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scenario */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Scenario</div>
              <Select value={scenario} onValueChange={(v: Scenario) => { setScenario(v); setAppliedOptimization(false) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal Traffic</SelectItem>
                  <SelectItem value="signal">Signal Failure</SelectItem>
                  <SelectItem value="maintenance">Track Maintenance</SelectItem>
                  <SelectItem value="congestion">Heavy Congestion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <Button onClick={() => setIsRunning((p) => !p)} variant={isRunning ? "secondary" : "default"}>
                {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isRunning ? "Pause" : "Run Simulation"}
              </Button>
              <Button onClick={() => setAppliedOptimization(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Brain className="h-4 w-4 mr-2" />
                Apply AI Optimization
              </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Throughput</div>
                  <div className="text-xl font-bold">{metrics.throughput}/h</div>
                  <div className="text-[10px] text-muted-foreground">Before 9/h → After {appliedOptimization ? 14 : metrics.throughput}/h</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Avg Delay</div>
                  <div className="text-xl font-bold">{metrics.delay}m</div>
                  <div className="text-[10px] text-muted-foreground">Before 18m → After 7m</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Conflicts Avoided</div>
                  <div className="text-xl font-bold">{metrics.conflicts}</div>
                  <div className="text-[10px] text-muted-foreground">Before 3 → After 0</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Utilization</div>
                  <div className="text-xl font-bold">{metrics.utilization}%</div>
                  <div className="text-[10px] text-muted-foreground">Higher is better</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Throughput and delay trends (mock)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Line chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={throughputSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis />
                  <RTooltip />
                  <Line type="monotone" dataKey="current" stroke="#ef4444" strokeWidth={2} name="Current" dot={false} />
                  <Line type="monotone" dataKey="optimized" stroke="#10b981" strokeWidth={2} name="Optimized" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Bar chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={delayBars}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <RTooltip />
                  <Bar dataKey="delay" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Heatmap mock */}
          <div className="mt-6">
            <div className="text-sm font-medium mb-2">Section Congestion Heatmap</div>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {initialStations.map((s) => (
                <div key={`heat-${s.id}`} className="p-2 rounded border bg-muted/40">
                  <div className="font-medium mb-1">{s.id}</div>
                  <div className="h-2 w-full rounded-full overflow-hidden">
                    <div className={`h-full ${appliedOptimization ? "bg-emerald-500" : scenario === "congestion" ? "bg-red-500" : scenario === "maintenance" ? "bg-yellow-500" : "bg-green-500"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


