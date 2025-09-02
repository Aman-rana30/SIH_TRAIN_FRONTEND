import dynamic from "next/dynamic"
import { useMemo } from "react"

// Dynamically import the ClientMap component with SSR turned off
const ClientMap = dynamic(() => import("@/components/ClientMap"), {
  ssr: false,
  // Optional: Add a loading skeleton while the map loads
  loading: () => <div className="h-[560px] w-full animate-pulse rounded-2xl bg-muted" />,
})

export default function MapPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Live Train Map</h2>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <ClientMap />
      </div>
    </div>
  )
}