"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
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
import { io, Socket } from 'socket.io-client'

// Fix default icon assets
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

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
        color: white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        position: relative;
      ">
        ${symbol}
        ${status === 'moving' ? '<div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; border: 1px solid white;"></div>' : ''}
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export default function MapSimulation() {
  // Existing state
  const [trackPoints, setTrackPoints] = useState<TrackPoint[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [trains, setTrains] = useState<TrainPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1.0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // New state for accurate positioning and WebSocket integration
  const [accurateApiConnected, setAccurateApiConnected] = useState(false)
  const [websocketConnected, setWebsocketConnected] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [positioningMode, setPositioningMode] = useState<'accurate' | 'fallback'>('accurate')

  // Fetch track data with accurate positioning support
  const fetchTrackData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/map/track`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setTrackPoints(data.track_polyline || [])
      logger.info(`Loaded ${data.track_polyline?.length || 0} track points`)
    } catch (err) {
      console.error('Error fetching track data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch track data')
    }
  }

  // Fetch stations data
  const fetchStationsData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/map/stations`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setStations(data.stations || [])
      console.log(`Loaded ${data.stations?.length || 0} railway stations`)
    } catch (err) {
      console.error('Error fetching stations data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch stations data')
    }
  }

  // Original train positions function (fallback)
  const fetchTrainPositions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/map/train-positions`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data: TrainPositionsResponse = await response.json()
      setTrains(data.trains)
      setError(null)
      setPositioningMode('fallback')
      console.log(`Fetched ${data.trains.length} trains using fallback positioning`)
    } catch (err) {
      console.error('Error fetching train positions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch train positions')
    }
  }

  // Accurate train positions function (primary method)
  const fetchAccurateTrainPositions = async () => {
    try {
      // First, update Python API with latest database data
      try {
        const updateResponse = await fetch(`${API_BASE_URL}/api/map/update-python-data`, {
          method: 'POST'
        })
        if (updateResponse.ok) {
          console.log('✅ Accurate Python API updated with latest train data')
          setAccurateApiConnected(true)
        }
      } catch (updateError) {
        console.warn('Could not update accurate Python API:', updateError)
        setAccurateApiConnected(false)
      }

      // Then fetch accurate positions
      const response = await fetch(`${API_BASE_URL}/api/map/train-positions-accurate`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: TrainPositionsResponse = await response.json()
      
      console.log(`📍 Received ${data.trains.length} ACCURATE train positions`)
      console.log(`🎯 Positioning: Trains stick to railway tracks using OSM data`)
      console.log(`⏰ 30-minute window for JUC arrivals`)
      console.log(`🕐 Data timestamp: ${data.simulation_time}`)
      
      // Log accurate train details for debugging
      data.trains.forEach(train => {
        const progressPercent = (train.progress * 100).toFixed(1)
        const statusEmoji = train.status === 'moving' ? '🚂' : train.status === 'stopped' ? '🛑' : '⚠️'
        console.log(`${statusEmoji} ${train.train_id}: ${train.status} at ${train.current_lat.toFixed(4)}, ${train.current_lon.toFixed(4)} (${progressPercent}% complete, ${train.speed.toFixed(1)} km/h) - ON TRACK`)
      })
      
      setTrains(data.trains)
      setLastUpdate(new Date().toLocaleTimeString())
      setError(null)
      setAccurateApiConnected(true)
      setPositioningMode('accurate')
      
    } catch (err) {
      console.error('Error fetching accurate train positions:', err)
      setError(err instanceof Error ? err.message : 'Accurate positioning API connection failed')
      setAccurateApiConnected(false)
      
      // Fallback to original method
      try {
        console.log('🔄 Falling back to database integration positioning...')
        await fetchTrainPositions()
      } catch (fallbackError) {
        console.error('Fallback positioning also failed:', fallbackError)
      }
    }
  }

  // WebSocket connection function for accurate positioning
  const connectAccurateWebSocket = useCallback(() => {
    if (socket) {
      socket.disconnect()
    }

    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
    })

    newSocket.on('connect', () => {
      console.log('🔌 Connected to Accurate Train Position WebSocket server')
      setWebsocketConnected(true)
      setSocket(newSocket)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Accurate WebSocket:', reason)
      setWebsocketConnected(false)
    })

    newSocket.on('train_positions', (data) => {
      console.log('📡 Received ACCURATE WebSocket train positions update:', data)
      
      if (data.trains && Array.isArray(data.trains)) {
        // Convert WebSocket data to our format
        const convertedTrains = data.trains.map((train: any) => ({
          train_id: train.train_id || '',
          train_name: train.train_name || '',
          priority: train.priority || 'PASSENGER',
          current_lat: train.current_lat || 31.3260,
          current_lon: train.current_lon || 75.5762,
          progress: train.progress || 0,
          speed: train.speed || 0,
          status: train.status || 'stopped',
          is_conflicted: train.is_conflicted || false,
          next_junction: train.next_junction,
          eta_next_junction: train.eta_next_junction
        }))
        
        setTrains(convertedTrains)
        setLastUpdate(new Date().toLocaleTimeString())
        setError(null)
        setPositioningMode('accurate')
        console.log(`📡 Updated ${convertedTrains.length} trains with ACCURATE positioning via WebSocket`)
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Accurate WebSocket connection error:', error)
      setWebsocketConnected(false)
      setSocket(null)
    })

    newSocket.on('data_updated', (data) => {
      console.log('📊 Train data file updated with accurate positioning:', data)
      // Optionally show a notification
    })

    return newSocket
  }, [socket])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchTrackData(),
        fetchStationsData(),
      ])
    } catch (err) {
      console.error('Error fetching initial data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    fetchInitialData()
    if (websocketConnected) {
      fetchAccurateTrainPositions()
    } else {
      fetchAccurateTrainPositions()
    }
  }

  // Updated useEffect for initial data loading with accurate positioning
  useEffect(() => {
    fetchInitialData()
    
    // Try accurate WebSocket first, fallback to HTTP polling
    const ws = connectAccurateWebSocket()
    
    // If WebSocket fails, use accurate HTTP polling
    const fallbackTimer = setTimeout(() => {
      if (!websocketConnected) {
        console.log('🔄 WebSocket not connected, using accurate HTTP polling')
        fetchAccurateTrainPositions()
        
        if (isPlaying) {
          intervalRef.current = setInterval(fetchAccurateTrainPositions, 8000) // 8 seconds for HTTP
        }
      }
    }, 3000)

    return () => {
      clearTimeout(fallbackTimer)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (ws) {
        ws.disconnect()
      }
    }
  }, [])

  // Updated play/pause effect with accurate positioning
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    if (isPlaying) {
      if (websocketConnected) {
        // WebSocket handles updates automatically
        console.log('🎮 Using Accurate WebSocket for live updates')
      } else {
        // Use accurate HTTP polling as fallback
        console.log('🎮 Using Accurate HTTP polling for updates')
        intervalRef.current = setInterval(fetchAccurateTrainPositions, 8000)
      }
    }
  }, [isPlaying, websocketConnected])

  // Status indicators component
  const StatusIndicators = () => (
    <div className="flex gap-2 mb-4">
      {/* Accurate API Status */}
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded text-xs",
        accurateApiConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      )}>
        <span>{accurateApiConnected ? '✅' : '❌'}</span>
        <span>Accurate API</span>
      </div>
      
      {/* WebSocket Status */}
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded text-xs",
        websocketConnected ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
      )}>
        <span>{websocketConnected ? '🔌' : '🔄'}</span>
        <span>WebSocket</span>
      </div>
      
      {/* Positioning Mode */}
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded text-xs",
        positioningMode === 'accurate' ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
      )}>
        <span>{positioningMode === 'accurate' ? '🎯' : '🔄'}</span>
        <span>{positioningMode === 'accurate' ? 'On-Track' : 'Fallback'}</span>
      </div>
      
      {/* Last Update */}
      {lastUpdate && (
        <div className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
          <span>🕐</span>
          <span>{lastUpdate}</span>
        </div>
      )}
    </div>
  )

  // Manual refresh button with accurate positioning
  const ManualRefreshButton = () => (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={() => {
        if (websocketConnected && socket) {
          socket.emit('request_update')
        } else {
          fetchAccurateTrainPositions()
        }
      }}
      disabled={loading}
    >
      <div className="flex items-center gap-1">
        <span>🎯</span>
        <span className="text-xs">
          {websocketConnected ? 'Request Update' : 'Fetch Accurate'}
        </span>
      </div>
    </Button>
  )

  // WebSocket connection toggle
  const WebSocketToggle = () => (
    <Button
      size="sm"
      variant={websocketConnected ? "default" : "outline"}
      onClick={() => {
        if (websocketConnected && socket) {
          socket.disconnect()
        } else {
          connectAccurateWebSocket()
        }
      }}
    >
      <div className="flex items-center gap-1">
        <span>{websocketConnected ? '🔌' : '🔄'}</span>
        <span className="text-xs">
          {websocketConnected ? 'Disconnect WS' : 'Connect WS'}
        </span>
      </div>
    </Button>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🚂</div>
          <p className="text-lg font-medium">Loading accurate railway positioning system</p>
          <p className="text-sm text-muted-foreground mt-2">Fetching OSM railway geometry and train data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-red-600 mb-2">Error loading accurate map data</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <p className="text-xs text-muted-foreground">Make sure your Accurate Train Position API is running</p>
          <Button onClick={handleReset} className="mt-4">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry with Accurate Positioning
          </Button>
        </div>
      </div>
    )
  }

  const trackPolyline = trackPoints.map(point => [point.lat, point.lon] as [number, number])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-screen p-6">
      {/* Map Container */}
      <div className="xl:col-span-3">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Train className="w-5 h-5" />
                Accurate Train Positioning - OSM Railway Routes
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Live
                </Badge>
                <Badge variant={positioningMode === 'accurate' ? 'default' : 'secondary'} className="flex items-center gap-1">
                  <span>{positioningMode === 'accurate' ? '🎯' : '🔄'}</span>
                  {positioningMode === 'accurate' ? 'On-Track' : 'Fallback'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-5rem)]">
            <MapContainer
              center={[31.2540, 75.7047]} // Center between Jalandhar and Ludhiana
              zoom={11}
              style={{ height: '100%', width: '100%' }}
              className="rounded-b-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Railway Track Polyline */}
              {trackPolyline.length > 0 && (
                <Polyline
                  positions={trackPolyline}
                  color="#374151"
                  weight={3}
                  opacity={0.8}
                  dashArray="5, 5"
                />
              )}
              
              {/* Railway Stations */}
              {stations.map((station, index) => (
                <Marker
                  key={index}
                  position={[station.lat, station.lon]}
                  icon={L.divIcon({
                    html: '<div style="background-color: #f59e0b; color: white; border-radius: 50%; width: 12px; height: 12px; border: 2px solid white;"></div>',
                    iconSize: [12, 12],
                    className: '',
                  })}
                >
                  <Popup>
                    <div className="text-sm">
                      <h3 className="font-semibold text-base mb-2">{station.name}</h3>
                      <div className="space-y-1">
                        <p><strong>City:</strong> {station.city}</p>
                        <p><strong>State:</strong> {station.state}</p>
                        <p><strong>Type:</strong> {station.type}</p>
                        <p><strong>Coordinates:</strong> {station.lat.toFixed(4)}, {station.lon.toFixed(4)}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Train Positions with Accurate Positioning */}
              {trains.map((train, index) => (
                <Marker
                  key={`${train.train_id}-${index}`}
                  position={[train.current_lat, train.current_lon]}
                  icon={createTrainIcon(train.priority, train.is_conflicted, train.status)}
                >
                  <Popup>
                    <div className="text-sm min-w-[200px]">
                      <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                        {train.priority === 'EXPRESS' ? '🚄' : train.priority === 'PASSENGER' ? '🚃' : '🚛'}
                        {train.train_name}
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <Badge 
                            variant={train.status === 'moving' ? 'default' : train.status === 'delayed' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {train.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Priority:</span>
                          <span>{train.priority}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Speed:</span>
                          <span>{train.speed.toFixed(1)} km/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Progress:</span>
                          <span>{(train.progress * 100).toFixed(1)}%</span>
                        </div>
                        {train.next_junction && (
                          <div className="flex justify-between">
                            <span className="font-medium">Next:</span>
                            <span>{train.next_junction}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-medium">Positioning:</span>
                          <Badge 
                            variant={positioningMode === 'accurate' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {positioningMode === 'accurate' ? 'On-Track' : 'Fallback'}
                          </Badge>
                        </div>
                        {train.is_conflicted && (
                          <div className="flex items-center gap-1 mt-2 p-2 bg-red-50 rounded">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-red-700 text-xs">Schedule Conflict</span>
                          </div>
                        )}
                        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                          <p>Position: {train.current_lat.toFixed(4)}, {train.current_lon.toFixed(4)}</p>
                          <p className="text-green-600 font-medium">✓ Following Railway Track</p>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <div className="xl:col-span-1 space-y-6">
        {/* Status and Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Accurate Position Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusIndicators />
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={isPlaying ? "default" : "outline"}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                
                <ManualRefreshButton />
                <WebSocketToggle />
                
                <Button size="sm" variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Speed Control */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Update Speed</span>
                  <span className="text-sm text-muted-foreground">{speed}x</span>
                </div>
                <Slider
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Live Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Trains:</span>
                <Badge variant="default">{trains.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Railway Stations:</span>
                <Badge variant="secondary">{stations.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Track Points:</span>
                <Badge variant="outline">{trackPoints.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Moving Trains:</span>
                <Badge variant="default">{trains.filter(t => t.status === 'moving').length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Conflicts:</span>
                <Badge variant="destructive">{trains.filter(t => t.is_conflicted).length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Positioning:</span>
                <Badge variant={positioningMode === 'accurate' ? 'default' : 'secondary'}>
                  {positioningMode === 'accurate' ? 'Accurate OSM' : 'Fallback'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Train List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Train className="w-4 h-4" />
              Active Trains (On-Track)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {trains.map((train, index) => (
                <motion.div
                  key={`${train.train_id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-2 border rounded-lg bg-card"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm">
                      {train.priority === 'EXPRESS' ? '🚄' : train.priority === 'PASSENGER' ? '🚃' : '🚛'}
                      {' '}{train.train_id}
                    </div>
                    <div className="flex gap-1">
                      <Badge 
                        size="sm"
                        variant={train.status === 'moving' ? 'default' : train.status === 'delayed' ? 'destructive' : 'secondary'}
                      >
                        {train.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div>Speed: {train.speed.toFixed(1)} km/h</div>
                    <div>Progress: {(train.progress * 100).toFixed(1)}%</div>
                    <div className="flex items-center gap-1 mt-1 text-green-600">
                      <span>✓</span>
                      <span>On Railway Track</span>
                    </div>
                    {train.is_conflicted && (
                      <div className="flex items-center gap-1 mt-1 text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        Conflict
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {trains.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No active trains in 30-minute window
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}