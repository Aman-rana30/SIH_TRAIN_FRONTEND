import { Disruption, User } from '@/types/disruption'

export const mockUser: User = {
  id: 'user-1',
  name: 'Controller Sarthi',
  role: 'CONTROLLER',
  section: 'JUC-LDH',
  permissions: ['create_disruption', 'resolve_disruption', 'simulate_disruption', 'view_reports']
}

export const mockDisruptions: Disruption[] = [
  {
    id: 'DIS-001',
    type: 'SIGNAL_FAILURE',
    severity: 'HIGH',
    section: 'JUC-LDH',
    location: 'Phagwara Junction',
    description: 'Signal failure at Phagwara Junction affecting both up and down lines. Temporary speed restriction implemented.',
    affectedTrains: ['12345', '12346', '12347'],
    startTime: '2024-01-15T14:30:00Z',
    estimatedResolution: '2024-01-15T16:00:00Z',
    status: 'ACTIVE',
    aiSuggestion: 'Implement temporary speed restriction and single line working. Estimated resolution time: 1.5 hours.',
    impact: {
      delayedTrains: 3,
      cancelledTrains: 0,
      estimatedDelay: 45,
      passengersAffected: 1200
    },
    createdBy: 'user-1',
    priority: 8,
    tags: ['signal', 'junction', 'urgent'],
    lastUpdated: '2024-01-15T15:15:00Z',
    coordinates: { lat: 31.2240, lng: 75.7704 }
  },
  {
    id: 'DIS-002',
    type: 'TRACK_MAINTENANCE',
    severity: 'MEDIUM',
    section: 'JUC-LDH',
    location: 'Ludhiana Station',
    description: 'Scheduled track maintenance on platform 2. Single line working in effect.',
    affectedTrains: ['12348', '12349'],
    startTime: '2024-01-15T10:00:00Z',
    estimatedResolution: '2024-01-15T18:00:00Z',
    status: 'ACTIVE',
    aiSuggestion: 'Continue single line working. No additional delays expected.',
    impact: {
      delayedTrains: 2,
      cancelledTrains: 0,
      estimatedDelay: 15,
      passengersAffected: 800
    },
    createdBy: 'user-1',
    priority: 5,
    tags: ['maintenance', 'platform', 'scheduled'],
    lastUpdated: '2024-01-15T15:10:00Z',
    coordinates: { lat: 30.9010, lng: 75.8573 }
  },
  {
    id: 'DIS-003',
    type: 'WEATHER',
    severity: 'LOW',
    section: 'JUC-LDH',
    location: 'Jalandhar City',
    description: 'Heavy fog affecting visibility. Speed restrictions in place.',
    affectedTrains: ['12350'],
    startTime: '2024-01-15T06:00:00Z',
    estimatedResolution: '2024-01-15T10:00:00Z',
    status: 'RESOLVED',
    actualResolution: '2024-01-15T09:30:00Z',
    aiSuggestion: 'Monitor weather conditions. Resume normal speed when visibility improves.',
    impact: {
      delayedTrains: 1,
      cancelledTrains: 0,
      estimatedDelay: 20,
      passengersAffected: 300
    },
    createdBy: 'user-1',
    resolvedBy: 'user-1',
    priority: 3,
    tags: ['weather', 'fog', 'visibility'],
    lastUpdated: '2024-01-15T09:30:00Z',
    coordinates: { lat: 31.3260, lng: 75.5762 }
  },
  {
    id: 'DIS-004',
    type: 'POWER_OUTAGE',
    severity: 'CRITICAL',
    section: 'LDH-UMB',
    location: 'Ambala Cantt',
    description: 'Power outage affecting signaling system. Emergency power activated.',
    affectedTrains: ['12351', '12352', '12353', '12354'],
    startTime: '2024-01-15T12:00:00Z',
    estimatedResolution: '2024-01-15T14:00:00Z',
    status: 'INVESTIGATING',
    aiSuggestion: 'Emergency protocols activated. Manual signaling in place. ETA for power restoration: 2 hours.',
    impact: {
      delayedTrains: 4,
      cancelledTrains: 1,
      estimatedDelay: 90,
      passengersAffected: 2500
    },
    createdBy: 'admin-1',
    priority: 10,
    tags: ['power', 'critical', 'emergency'],
    lastUpdated: '2024-01-15T15:20:00Z',
    coordinates: { lat: 30.3782, lng: 76.7767 }
  },
  {
    id: 'DIS-005',
    type: 'CROWD_CONTROL',
    severity: 'MEDIUM',
    section: 'JUC-LDH',
    location: 'Jalandhar City Station',
    description: 'Large crowd at platform 1 due to festival. Additional security deployed.',
    affectedTrains: ['12355'],
    startTime: '2024-01-15T16:00:00Z',
    estimatedResolution: '2024-01-15T18:00:00Z',
    status: 'ACTIVE',
    aiSuggestion: 'Deploy additional security personnel. Consider platform announcements for crowd management.',
    impact: {
      delayedTrains: 1,
      cancelledTrains: 0,
      estimatedDelay: 25,
      passengersAffected: 500
    },
    createdBy: 'user-1',
    priority: 4,
    tags: ['crowd', 'festival', 'security'],
    lastUpdated: '2024-01-15T16:30:00Z',
    coordinates: { lat: 31.3260, lng: 75.5762 }
  }
]

export const sections = [
  { id: 'JUC-LDH', name: 'Jalandhar City - Ludhiana', status: 'ACTIVE' },
  { id: 'LDH-UMB', name: 'Ludhiana - Ambala', status: 'ACTIVE' },
  { id: 'UMB-DEL', name: 'Ambala - Delhi', status: 'ACTIVE' },
  { id: 'JUC-AMR', name: 'Jalandhar City - Amritsar', status: 'MAINTENANCE' },
  { id: 'LDH-PAT', name: 'Ludhiana - Patiala', status: 'ACTIVE' }
]

export const disruptionTypes = [
  { value: 'SIGNAL_FAILURE', label: 'Signal Failure', icon: '🚦', color: 'red' },
  { value: 'TRACK_MAINTENANCE', label: 'Track Maintenance', icon: '🔧', color: 'blue' },
  { value: 'WEATHER', label: 'Weather', icon: '🌧️', color: 'yellow' },
  { value: 'POWER_OUTAGE', label: 'Power Outage', icon: '⚡', color: 'purple' },
  { value: 'ACCIDENT', label: 'Accident', icon: '🚨', color: 'red' },
  { value: 'CROWD_CONTROL', label: 'Crowd Control', icon: '👥', color: 'orange' },
  { value: 'TECHNICAL_ISSUE', label: 'Technical Issue', icon: '🔧', color: 'gray' }
]

export const severityLevels = [
  { value: 'LOW', label: 'Low', color: 'green', priority: 1 },
  { value: 'MEDIUM', label: 'Medium', color: 'yellow', priority: 2 },
  { value: 'HIGH', label: 'High', color: 'orange', priority: 3 },
  { value: 'CRITICAL', label: 'Critical', color: 'red', priority: 4 }
]
