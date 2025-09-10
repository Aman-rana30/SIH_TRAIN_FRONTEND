"use client"

import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { motion } from 'framer-motion'
import { Train, Clock, MapPin, Zap, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'

// Fix default icon assets
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

// Types
interface TrackPoint {
  lat: number
  lon: number
}

interface Station {
  name: string
  lat: number
  lon: number
  city?: string
  state?: string
  type: string
}

interface TrainPosition {
  train_id: string
  train_name: string
  priority: 'EXPRESS' | 'PASSENGER' | 'FREIGHT'
  current_lat: number
  current_lon: number
  progress: number
  speed: number
  status: 'moving' | 'delayed' | 'stopped'
  is_conflicted: boolean
  next_junction?: string
  eta_next_junction?: string
}

interface TrainPositionsResponse {
  trains: TrainPosition[]
  total_trains: number
  simulation_time: string
}

// Train icons for different priorities
const createTrainIcon = (priority: string, isConflicted: boolean, status: string) => {
  let color = '#2563eb' // Default blue
  let symbol = '🚂'
  
  switch (priority) {
    case 'EXPRESS':
      color = isConflicted ? '#dc2626' : '#059669' // Red if conflicted, green otherwise
      symbol = '🚄'
      break
    case 'PASSENGER':
      color = isConflicted ? '#dc2626' : '#2563eb' // Red if conflicted, blue otherwise
      symbol = '🚃'
      break
    case 'FREIGHT':
      color = isConflicted ? '#dc2626' : '#7c3aed' // Red if conflicted, purple otherwise
      symbol = '🚛'
      break
  }
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        border: 3px solid ${isConflicted ? '#fbbf24' : '#ffffff'};
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${isConflicted ? 'animation: pulse 1s infinite;' : ''}
        ${status === 'delayed' ? 'opacity: 0.7;' : ''}
      ">
        ${symbol}
      </div>
      <div style="
        position: absolute;
        top: -25px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
        white-space: nowrap;
        pointer-events: none;
      ">
        ${status === 'delayed' ? '⏸️ ' : ''}${priority}
      </div>
    `,
    className: 'custom-train-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  })
}

// Station icons
const createStationIcon = (type: string, hasConflict: boolean = false) => {
  const iconUrls = {
    junction: hasConflict 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    station: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    halt: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png'
  }

  const sizes = {
    junction: hasConflict ? [35, 56] : [30, 48],
    station: [20, 32],
    halt: [15, 24]
  }

  return new L.Icon({
    iconUrl: iconUrls[type as keyof typeof iconUrls] || iconUrls.station,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: sizes[type as keyof typeof sizes] || sizes.station,
    iconAnchor: [
      (sizes[type as keyof typeof sizes] || sizes.station)[0] / 2,
      (sizes[type as keyof typeof sizes] || sizes.station)[1]
    ],
    popupAnchor: [1, -(sizes[type as keyof typeof sizes] || sizes.station)[1] + 6],
    shadowSize: [32, 32]
  })
}

export default function MapSimulation() {
  const [trackData, setTrackData] = useState<TrackPoint[]>([])
  const [stationsData, setStationsData] = useState<Station[]>([])
  const [trains, setTrains] = useState<TrainPosition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState<number[]>([1])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fallback center if no valid track data
  const fallbackCenter: [number, number] = [31.1, 75.7]
  const validTrackPoints = trackData.filter(point => typeof point.lat === 'number' && typeof point.lon === 'number')
  const center: [number, number] = validTrackPoints.length > 0 ? [validTrackPoints[0].lat, validTrackPoints[0].lon] : fallbackCenter
  const zoom = 11

  // API base URL - using your Train AI Backend
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

  // Fetch initial data (tracks and stations)
  const fetchInitialData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch track data
      const trackResponse = await fetch(`${API_BASE_URL}/map/track`)
      if (!trackResponse.ok) {
        throw new Error(`Track API error: ${trackResponse.status}`)
      }
      const trackResult = await trackResponse.json()
      setTrackData(trackResult.track_polyline)

      // Fetch stations data
      const stationsResponse = await fetch(`${API_BASE_URL}/map/stations`)
      if (!stationsResponse.ok) {
        throw new Error(`Stations API error: ${stationsResponse.status}`)
      }
      const stationsResult = await stationsResponse.json()
      setStationsData(stationsResult.stations)

      setError(null)
    } catch (err) {
      console.error('Error fetching initial data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch train positions
  const fetchTrainPositions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/map/train-positions`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: TrainPositionsResponse = await response.json()
      setTrains(data.trains)
      setError(null)
    } catch (err) {
      console.error('Error fetching train positions:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // Update simulation speed on backend
  const updateSimulationSpeed = async (newSpeed: number) => {
    try {
      await fetch(`${API_BASE_URL}/map/simulation/speed/${newSpeed}`, {
        method: 'POST'
      })
    } catch (err) {
      console.error('Error updating simulation speed:', err)
    }
  }

  // Reset simulation
  const resetSimulation = async () => {
    try {
      await fetch(`${API_BASE_URL}/map/simulation/reset`, {
        method: 'POST'
      })
      await fetchTrainPositions()
    } catch (err) {
      console.error('Error resetting simulation:', err)
    }
  }

  // Initialize and start polling
  useEffect(() => {
    fetchInitialData()
    fetchTrainPositions()
    
    if (isPlaying) {
      intervalRef.current = setInterval(fetchTrainPositions, 2000) // Update every 2 seconds
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying])

  // Update simulation speed when speed changes
  useEffect(() => {
    updateSimulationSpeed(speed[0])
  }, [speed])

  // Handle play/pause
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    if (isPlaying) {
      intervalRef.current = setInterval(fetchTrainPositions, 2000)
    }
  }, [isPlaying])

  const conflictedTrains = trains.filter(train => train.is_conflicted)
  const movingTrains = trains.filter(train => train.status === 'moving')
  const delayedTrains = trains.filter(train => train.status === 'delayed')

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold">Loading Railway Map...</h3>
            <p className="text-muted-foreground">Fetching track and station data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-destructive">Error Loading Map</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">Make sure your Train AI Backend is running</p>
            <Button onClick={fetchInitialData} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full w-full relative">
      {/* Control Panel */}
      <Card className="absolute top-4 left-4 z-[1000] w-80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Train className="h-4 w-4" />
            Live Train Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Moving</span>
              </div>
              <Badge variant="secondary">{movingTrains.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span>Delayed</span>
              </div>
              <Badge variant="destructive">{delayedTrains.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>Conflicts</span>
              </div>
              <Badge variant="outline">{conflictedTrains.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Train className="h-3 w-3" />
                <span>Total</span>
              </div>
              <Badge>{trains.length}</Badge>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isPlaying ? "default" : "outline"}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <Button size="sm" variant="outline" onClick={resetSimulation}>
                <RotateCcw className="h-3 w-3" />
              </Button>
              <div className="text-xs text-muted-foreground">
                Speed: {speed[0]}x
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium">Simulation Speed</label>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                max={5}
                min={0.5}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>

          {/* Train List */}
          <div className="space-y-1 max-h-40 overflow-y-auto">
            <label className="text-xs font-medium">Active Trains</label>
            {trains.map(train => (
              <div key={train.train_id} className="flex items-center justify-between p-2 rounded border text-xs">
                <div>
                  <div className="font-medium">{train.train_name}</div>
                  <div className="text-muted-foreground">{train.train_id}</div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={train.status === 'delayed' ? 'destructive' : 
                            train.is_conflicted ? 'outline' : 'secondary'}
                    className="text-xs"
                  >
                    {train.status}
                  </Badge>
                  <div className="text-muted-foreground">{Math.round(train.speed)} km/h</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Railway Track */}
        {validTrackPoints.length > 1 && (
          <Polyline
            positions={validTrackPoints.map(point => [point.lat, point.lon] as [number, number])}
            color="#1f2937"
            weight={4}
            opacity={0.8}
          />
        )}
        
        {/* Station Markers */}
        {stationsData.map((station, index) => {
          const hasConflict = conflictedTrains.some(train => 
            train.next_junction === station.name
          )
          
          return (
            <Marker
              key={index}
              position={[station.lat, station.lon]}
              icon={createStationIcon(station.type, hasConflict)}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    🚉 {station.name}
                  </h4>
                  {hasConflict && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                      🚨 <strong>CONFLICT DETECTED!</strong>
                    </div>
                  )}
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>City:</strong> {station.city}</p>
                    <p><strong>State:</strong> {station.state}</p>
                    <p><strong>Type:</strong> {station.type}</p>
                    <p><strong>Coordinates:</strong> {station.lat.toFixed(4)}, {station.lon.toFixed(4)}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
        
        {/* Train Markers */}
        {trains.map(train => (
          <Marker
            key={train.train_id}
            position={[train.current_lat, train.current_lon]}
            icon={createTrainIcon(train.priority, train.is_conflicted, train.status)}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Train className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{train.train_name}</span>
                  </div>
                  <Badge 
                    variant={train.status === 'delayed' ? 'destructive' : 
                            train.is_conflicted ? 'outline' : 'secondary'}
                  >
                    {train.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Speed</div>
                      <div className="font-semibold">{Math.round(train.speed)} km/h</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Progress</div>
                      <div className="font-semibold">{Math.round(train.progress * 100)}%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 col-span-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Next Junction</div>
                      <div className="font-semibold">{train.next_junction || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                
                {train.is_conflicted && (
                  <div className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 p-2">
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                    <span className="text-xs text-destructive font-medium">
                      Train has scheduling conflicts
                    </span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .custom-train-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  )
}
