"use client"

import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect, useMemo, useState } from "react"
import { useWebSocket } from "../hooks/useWebSocket"
import { useSchedule } from "../hooks/useTrainData"

// Fix default icon issue in Leaflet when bundling
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import iconUrl from "leaflet/dist/images/marker-icon.png"
import shadowUrl from "leaflet/dist/images/marker-shadow.png"
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

export default function MapView() {
  const { data: schedule } = useSchedule()
  const [positions, setPositions] = useState({})
  const wsData = useWebSocket("/ws/live-updates")

  // Merge schedule and ws positions
  useEffect(() => {
    if (!wsData) return
    setPositions((prev) => {
      const next = { ...prev }
      wsData.trains?.forEach((t) => {
        next[t.id] = { lat: t.lat, lng: t.lng, speed: t.speed, delayMinutes: t.delayMinutes || 0, name: t.name }
      })
      return next
    })
  }, [wsData])

  // default center from first position or fallback
  const first = Object.values(positions)[0]
  const center = useMemo(() => {
    return first ? [first.lat, first.lng] : [51.5072, -0.1276] // London fallback
  }, [first])

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Live Train Map</h2>
      </div>
      <div className="card overflow-hidden">
        <MapContainer center={center} zoom={7} style={{ height: 560, width: "100%" }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {Object.entries(positions).map(([id, p]) => {
            const color = p.delayMinutes > 0 ? "red" : "#0ea5a4"
            return (
              <CircleMarker
                key={id}
                center={[p.lat, p.lng]}
                radius={8}
                color={color}
                fillColor={color}
                fillOpacity={0.9}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{p.name || id}</div>
                    <div>Speed: {p.speed ?? "-"} km/h</div>
                    <div>Delay: {p.delayMinutes || 0} min</div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
