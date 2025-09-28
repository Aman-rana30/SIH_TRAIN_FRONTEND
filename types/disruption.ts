export interface Disruption {
  id: string
  type: 'SIGNAL_FAILURE' | 'TRACK_MAINTENANCE' | 'WEATHER' | 'POWER_OUTAGE' | 'ACCIDENT' | 'CROWD_CONTROL' | 'TECHNICAL_ISSUE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  section: string
  location: string
  description: string
  affectedTrains: string[]
  startTime: string
  estimatedResolution: string
  actualResolution?: string
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING' | 'SIMULATED'
  aiSuggestion?: string
  impact: {
    delayedTrains: number
    cancelledTrains: number
    estimatedDelay: number
    passengersAffected: number
  }
  createdBy: string
  resolvedBy?: string
  priority: number
  tags: string[]
  lastUpdated: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface User {
  id: string
  name: string
  role: 'CONTROLLER' | 'ADMIN'
  section?: string
  permissions: string[]
}

export interface FilterOptions {
  status: string[]
  severity: string[]
  type: string[]
  section: string[]
  dateRange: {
    start: string
    end: string
  }
}

export interface SimulationOptions {
  type: 'WEATHER' | 'SIGNAL_FAILURE' | 'TRACK_MAINTENANCE' | 'POWER_OUTAGE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  duration: number
  affectedSections: string[]
  description: string
}
