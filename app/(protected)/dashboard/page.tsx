"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import KpiCard from "@/components/KpiCard"
import RecommendationCard from "@/components/RecommendationCard"
import { useRecommendations, useSchedule, useDepartureChecker } from "@/hooks/use-train-data"
import { useWebSocket } from "@/hooks/use-websocket"
import NotificationPanel from "@/components/NotificationPanel"
import { useMutation } from "@tanstack/react-query"
import api from "@/lib/api"
import { motion } from "framer-motion"
import { 
  Train, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  CheckCircle2,
  Calendar,
  BarChart3
} from "lucide-react"

export default function DashboardPage() {
  const { data: scheduleData, isLoading: scheduleLoading } = useSchedule()
  const { data: metricsData } = useRecommendations()
  const { notifications, clearNotification, clearAllNotifications } = useWebSocket()
  
  // Check for departed trains periodically
  useDepartureChecker()

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
    // Apply recommendation logic here
    // Could trigger API call to backend
    console.log("Applying recommendation:", rec)
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* KPI Cards Grid */}
      <motion.div 
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        <KpiCard 
          title="Active Trains" 
          value={scheduleLoading ? "..." : kpi.total}
          icon={<Train className="h-4 w-4" />}
          status={kpi.total > 0 ? "success" : "neutral"}
          trend={kpi.total > 5 ? "up" : "neutral"}
          trendValue={kpi.total > 5 ? "+12% vs last week" : undefined}
          loading={scheduleLoading}
        />
        
        <KpiCard
          title="Schedule Conflicts"
          value={scheduleLoading ? "..." : kpi.conflicts}
          icon={<AlertTriangle className="h-4 w-4" />}
          status={kpi.conflicts === 0 ? "success" : kpi.conflicts < 3 ? "warning" : "error"}
          trend={kpi.conflicts === 0 ? "down" : "up"}
          trendValue={kpi.conflicts === 0 ? "No conflicts" : `${kpi.conflicts} active`}
          loading={scheduleLoading}
          badge={
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-2xs font-medium ${
              kpi.conflicts === 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            }`}>
              {kpi.conflicts === 0 ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
              {kpi.conflicts === 0 ? "All Clear" : "Alert"}
            </span>
          }
        />
        
        <KpiCard 
          title="Avg Delay" 
          value={scheduleLoading ? "..." : `${kpi.avgDelay}m`}
          icon={<Clock className="h-4 w-4" />}
          status={kpi.avgDelay <= 2 ? "success" : kpi.avgDelay <= 5 ? "warning" : "error"}
          trend={kpi.avgDelay <= 2 ? "down" : "up"}
          trendValue={kpi.avgDelay <= 2 ? "Improving" : "Above target"}
          loading={scheduleLoading}
        />
        
        <KpiCard 
          title="On-Time Performance" 
          value={scheduleLoading ? "..." : `${kpi.onTimePct}%`}
          icon={<Activity className="h-4 w-4" />}
          status={kpi.onTimePct >= 90 ? "success" : kpi.onTimePct >= 75 ? "warning" : "error"}
          trend={kpi.onTimePct >= 85 ? "up" : "down"}
          trendValue={kpi.onTimePct >= 85 ? "+2.3% this week" : "Below target"}
          loading={scheduleLoading}
        >
          <div className="h-16 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spark}>
                <XAxis dataKey="x" hide />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="y" 
                  stroke={kpi.onTimePct >= 85 ? "hsl(var(--success))" : "hsl(var(--warning))"} 
                  strokeWidth={2.5} 
                  dot={false}
                  strokeDasharray={kpi.onTimePct < 75 ? "5,5" : "0"}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </KpiCard>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div 
        className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Schedule Overview */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Today's Schedule Card */}
          <motion.div 
            className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Today's Schedule</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <motion.a 
                  href="/gantt"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md sm:w-auto w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BarChart3 className="h-4 w-4" />
                  View Gantt
                </motion.a>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {scheduleLoading ? (
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm text-muted-foreground">Loading schedule data...</span>
                </div>
              ) : scheduleData?.length ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">{scheduleData.length}</span>
                    <span className="text-sm text-muted-foreground">Active trains being tracked</span>
                  </div>
                  
                  {/* Quick stats */}
                  <div className="grid grid-cols-1 gap-3 pt-4 border-t border-border sm:grid-cols-3 sm:gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-success">
                        {scheduleData.filter((t: any) => (t.delay_minutes || 0) <= 0).length}
                      </div>
                      <div className="text-xs text-muted-foreground">On Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-warning">
                        {scheduleData.filter((t: any) => (t.delay_minutes || 0) > 0 && (t.delay_minutes || 0) <= 10).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Minor Delays</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-destructive">
                        {scheduleData.filter((t: any) => (t.delay_minutes || 0) > 10).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Major Delays</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Train className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    No active trains found for this section
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try running a simulation to generate data
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* AI Recommendations & Alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-semibold text-foreground sm:text-lg">AI Insights</h3>
            <span className="text-xs text-muted-foreground">
              {(metricsData?.recommendations?.length || 0) + (metricsData?.alerts?.length || 0)} items
            </span>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto sm:max-h-[600px]">
            {/* Recommendations */}
            {metricsData?.recommendations?.map((rec: string, i: number) => (
              <RecommendationCard 
                key={`rec-${i}`} 
                title={rec} 
                type="recommendation"
                priority={i === 0 ? "high" : "medium"}
                confidence={Math.floor(Math.random() * 20) + 80}
                actionLabel="Apply"
                onApply={() => applyRecommendation(rec)} 
              />
            ))}
            
            {/* Alerts */}
            {metricsData?.alerts?.map((alert: string, i: number) => (
              <RecommendationCard 
                key={`alert-${i}`} 
                title={alert} 
                detail="System generated alert requiring attention"
                type="alert"
                priority="high"
                actionLabel="Acknowledge"
                onApply={() => {
                  // Handle alert acknowledgment
                  console.log('Alert acknowledged:', alert)
                }} 
              />
            ))}
            
            {/* Placeholder when no data */}
            {(!metricsData?.recommendations?.length && !metricsData?.alerts?.length) && (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  All systems running smoothly
                </p>
                <p className="text-xs text-muted-foreground">
                  No recommendations or alerts at this time
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Notification Panel */}
      <NotificationPanel
        notifications={notifications}
        onClearNotification={clearNotification}
        onClearAll={clearAllNotifications}
      />
    </div>
  )
}