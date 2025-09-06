"use client"

import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect, useMemo, useState } from "react"
import { useWebSocket } from "@/hooks/use-websocket"
import { motion } from "framer-motion"
import { Train, Clock, MapPin, Zap, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

// Fix default icon assets
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import iconUrl from "leaflet/dist/images/marker-icon.png"
import shadowUrl from "leaflet/dist/images/marker-shadow.png"

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

type Pos = { 
  lat: number; 
  lng: number; 
  speed?: number; 
  delayMinutes?: number; 
  name?: string;
  status?: 'on-time' | 'delayed' | 'stopped';
  direction?: number;
}

// Create custom train icons
const createTrainIcon = (status: string, size: number = 24) => {
  const color = status === 'delayed' ? '#ef4444' : status === 'stopped' ? '#f59e0b' : '#10b981'
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C13.1 2 14 2.9 14 4V8C14 9.1 13.1 10 12 10S10 9.1 10 8V4C10 2.9 10.9 2 12 2M21 11H19L18 8H16V6H8V8H6L5 11H3V13H4L5 16H6V18H8V16H16V18H18V16H19L20 13H21V11Z"/>
        </svg>
        ${status === 'delayed' ? '<div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #dc2626; border-radius: 50%; animation: pulse 2s infinite;"></div>' : ''}
      </div>
    `,
    className: 'custom-train-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  })
}

export default function ClientMap() {
  const [positions, setPositions] = useState<Record<string, Pos>>({})
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null)
  const [mapStyle, setMapStyle] = useState<'default' | 'satellite' | 'dark'>('default')
  const wsData = useWebSocket("/ws/updates")

  useEffect(() => {
    if (!wsData) return
    const payload = wsData.data || wsData
    payload.trains?.forEach((t: any) => {
      setPositions((prev) => ({
        ...prev,
        [t.id]: {
          lat: t.lat,
          lng: t.lng,
          speed: t.speed,
          delayMinutes: t.delayMinutes || 0,
          name: t.name,
          status: (t.delayMinutes || 0) > 0 ? 'delayed' : t.speed === 0 ? 'stopped' : 'on-time',
          direction: t.direction || 0,
        }
      }))
    })
  }, [wsData])

  const first = Object.values(positions)[0]
  const center = useMemo<[number, number]>(() => {
    return first ? [first.lat, first.lng] : [28.6139, 77.2090] // Default to Delhi, India
  }, [first])

  const getTileLayerUrl = () => {
    switch (mapStyle) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    }
  }

  const getAttribution = () => {
    switch (mapStyle) {
      case 'satellite':
        return '&copy; <a href="https://www.esri.com/">Esri</a>'
      case 'dark':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  }

  const trainPositions = Object.entries(positions)
  const delayedTrains = trainPositions.filter(([_, p]) => (p.delayMinutes || 0) > 0)
  const onTimeTrains = trainPositions.filter(([_, p]) => (p.delayMinutes || 0) === 0)

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        {/* Map Style Selector */}
        <div className="glass-effect rounded-lg p-2">
          <div className="flex gap-1">
            {(['default', 'satellite', 'dark'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all",
                  mapStyle === style
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {style === 'default' ? 'Map' : style === 'satellite' ? 'Satellite' : 'Dark'}
              </button>
            ))}
          </div>
        </div>

        {/* Train Stats */}
        <div className="glass-effect rounded-lg p-3 min-w-[200px]">
          <h4 className="text-sm font-semibold text-foreground mb-2">Live Tracking</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-muted-foreground">On Time</span>
              </div>
              <span className="font-semibold text-foreground">{onTimeTrains.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse-subtle" />
                <span className="text-muted-foreground">Delayed</span>
              </div>
              <span className="font-semibold text-destructive">{delayedTrains.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Train className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Total</span>
              </div>
              <span className="font-semibold text-foreground">{trainPositions.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <MapContainer 
        center={center} 
        zoom={7} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution={getAttribution()}
          url={getTileLayerUrl()}
        />
        
        {/* Train Markers */}
        {Object.entries(positions).map(([id, p]) => {
          const status = p.status || 'on-time'
          const isSelected = selectedTrain === id
          
          return (
            <Marker
              key={id}
              position={[p.lat, p.lng]}
              icon={createTrainIcon(status, isSelected ? 32 : 24)}
              eventHandlers={{
                click: () => setSelectedTrain(isSelected ? null : id),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Train className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{p.name || id}</span>
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      status === 'delayed' ? "bg-destructive/10 text-destructive" :
                      status === 'stopped' ? "bg-warning/10 text-warning" :
                      "bg-success/10 text-success"
                    )}>
                      {status === 'delayed' ? 'Delayed' : status === 'stopped' ? 'Stopped' : 'On Time'}
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Speed</div>
                        <div className="font-semibold">{p.speed ?? 0} km/h</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Delay</div>
                        <div className={cn(
                          "font-semibold",
                          (p.delayMinutes || 0) > 0 ? "text-destructive" : "text-success"
                        )}>
                          {(p.delayMinutes || 0) > 0 ? `+${p.delayMinutes}m` : 'On Time'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Position</div>
                        <div className="font-mono text-xs">
                          {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Alert for delayed trains */}
                  {(p.delayMinutes || 0) > 0 && (
                    <div className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 p-2">
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                      <span className="text-xs text-destructive font-medium">
                        Train is running {p.delayMinutes} minutes behind schedule
                      </span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}