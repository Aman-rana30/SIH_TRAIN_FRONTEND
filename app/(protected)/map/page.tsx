import dynamic from "next/dynamic"
import { Train, Activity, Clock, AlertTriangle } from "lucide-react"

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