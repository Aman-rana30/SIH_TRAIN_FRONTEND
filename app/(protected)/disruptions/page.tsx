"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Train, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Filter,
  Search,
  Eye,
  Zap,
  Brain,
  TrendingUp,
  Users,
  Calendar,
  Plus,
  AlertCircle,
  Activity,
  BarChart3,
  Settings,
  FileText,
  Play,
  Pause,
  RotateCcw,
  Download,
  Bell,
  Shield,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Wifi,
  WifiOff
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "sonner"
import { mockDisruptions, mockUser, sections, disruptionTypes, severityLevels } from '@/lib/mock-data'
import { Disruption, FilterOptions, SimulationOptions } from '@/types/disruption'

export default function DisruptionsPage() {
  // State management
  const [disruptions, setDisruptions] = useState<Disruption[]>(mockDisruptions)
  const [selectedDisruption, setSelectedDisruption] = useState<Disruption | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSimulateOpen, setIsSimulateOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    severity: [],
    type: [],
    section: [],
    dateRange: { start: "", end: "" }
  })
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'severity'>('priority')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Get user role from localStorage
  const userRole = typeof window !== 'undefined' ? 
    JSON.parse(localStorage.getItem("rcd_user") || '{"role": "CONTROLLER"}').role : 
    'CONTROLLER'

  // Filter and sort disruptions
  const filteredDisruptions = useMemo(() => {
    let filtered = disruptions

    // Role-based filtering
    if (userRole === 'CONTROLLER') {
      filtered = filtered.filter(d => d.section === mockUser.section)
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(d => 
        d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(d => filters.status.includes(d.status))
    }

    // Severity filter
    if (filters.severity.length > 0) {
      filtered = filtered.filter(d => filters.severity.includes(d.severity))
    }

    // Type filter
    if (filters.type.length > 0) {
      filtered = filtered.filter(d => filters.type.includes(d.type))
    }

    // Section filter (for admin)
    if (userRole === 'ADMIN' && filters.section.length > 0) {
      filtered = filtered.filter(d => filters.section.includes(d.section))
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return b.priority - a.priority
        case 'time':
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        case 'severity':
          const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
          return severityOrder[b.severity] - severityOrder[a.severity]
        default:
          return 0
      }
    })

    return filtered
  }, [disruptions, searchQuery, filters, sortBy, userRole])

  // Live mode simulation
  useEffect(() => {
    if (!isLiveMode) return

    const interval = setInterval(() => {
      // Simulate random new disruptions
      if (Math.random() < 0.02) { // 2% chance every 5 seconds (equivalent to 10% every 30 seconds)
        const newDisruption = generateRandomDisruption()
        setDisruptions(prev => [newDisruption, ...prev])
        toast.info(`New disruption detected: ${newDisruption.type}`)
      }

      // Simulate status updates
      setDisruptions(prev => prev.map(d => {
        if (d.status === 'ACTIVE' && Math.random() < 0.01) { // 1% chance every 5 seconds (equivalent to 5% every 30 seconds)
          return { ...d, status: 'RESOLVED', actualResolution: new Date().toISOString() }
        }
        return d
      }))
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [isLiveMode])

  // Generate random disruption for simulation
  const generateRandomDisruption = (): Disruption => {
    const types = disruptionTypes.map(t => t.value)
    const severities = severityLevels.map(s => s.value)
    const randomType = types[Math.floor(Math.random() * types.length)]
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)]
    const randomSection = sections[Math.floor(Math.random() * sections.length)]

    return {
      id: `DIS-${Date.now()}`,
      type: randomType as any,
      severity: randomSeverity as any,
      section: randomSection.id,
      location: `${randomSection.name} - Random Location`,
      description: `Simulated ${randomType.toLowerCase().replace('_', ' ')} at ${randomSection.name}`,
      affectedTrains: [`${Math.floor(Math.random() * 90000) + 10000}`],
      startTime: new Date().toISOString(),
      estimatedResolution: new Date(Date.now() + Math.random() * 3600000).toISOString(),
      status: 'ACTIVE',
      aiSuggestion: 'AI analysis in progress...',
      impact: {
        delayedTrains: Math.floor(Math.random() * 5) + 1,
        cancelledTrains: Math.floor(Math.random() * 2),
        estimatedDelay: Math.floor(Math.random() * 60) + 15,
        passengersAffected: Math.floor(Math.random() * 1000) + 100
      },
      createdBy: 'system',
      priority: Math.floor(Math.random() * 10) + 1,
      tags: ['simulated', 'auto-generated'],
      lastUpdated: new Date().toISOString()
    }
  }

  // Handle disruption actions
  const handleResolveDisruption = (id: string) => {
    setDisruptions(prev => prev.map(d => 
      d.id === id 
        ? { ...d, status: 'RESOLVED', actualResolution: new Date().toISOString(), resolvedBy: mockUser.id }
        : d
    ))
    toast.success('Disruption resolved successfully')
  }

  const handleCreateDisruption = (newDisruption: Partial<Disruption>) => {
    const disruption: Disruption = {
      id: `DIS-${Date.now()}`,
      type: newDisruption.type!,
      severity: newDisruption.severity!,
      section: newDisruption.section!,
      location: newDisruption.location!,
      description: newDisruption.description!,
      affectedTrains: newDisruption.affectedTrains || [],
      startTime: new Date().toISOString(),
      estimatedResolution: newDisruption.estimatedResolution!,
      status: 'ACTIVE',
      impact: newDisruption.impact || {
        delayedTrains: 0,
        cancelledTrains: 0,
        estimatedDelay: 0,
        passengersAffected: 0
      },
      createdBy: mockUser.id,
      priority: newDisruption.priority || 5,
      tags: newDisruption.tags || [],
      lastUpdated: new Date().toISOString()
    }
    setDisruptions(prev => [disruption, ...prev])
    setIsCreateOpen(false)
    toast.success('Disruption created successfully')
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      'LOW': 'bg-green-100 text-green-800 border-green-200',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'HIGH': 'bg-orange-100 text-orange-800 border-orange-200',
      'CRITICAL': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[severity as keyof typeof colors] || colors.LOW
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'ACTIVE': 'bg-red-100 text-red-800 border-red-200',
      'RESOLVED': 'bg-green-100 text-green-800 border-green-200',
      'INVESTIGATING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'SIMULATED': 'bg-purple-100 text-purple-800 border-purple-200'
    }
    return colors[status as keyof typeof colors] || colors.ACTIVE
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
      >
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-destructive" />
        <div>
                <h1 className="text-3xl font-bold">Disruption Management</h1>
                <p className="text-muted-foreground">
                  {userRole === 'CONTROLLER' 
                    ? `Managing disruptions for ${mockUser.section}` 
                    : 'System-wide disruption monitoring'
                  }
          </p>
        </div>
            </div>
          <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              {userRole}
          </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Mode Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={isLiveMode}
                onCheckedChange={setIsLiveMode}
                id="live-mode"
              />
              <Label htmlFor="live-mode" className="flex items-center gap-1">
                {isLiveMode ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                Live Mode
              </Label>
            </div>

            {/* Action Buttons */}
            {userRole === 'CONTROLLER' && (
              <>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Disruption
                </Button>
                <Button variant="outline" onClick={() => setIsSimulateOpen(true)} className="gap-2">
                  <Zap className="h-4 w-4" />
                  Simulate
                </Button>
                <Button variant="outline" onClick={() => setIsReportOpen(true)} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Report
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          </div>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
      >
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
          <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search disruptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
            />
          </div>

                {/* Status Filter */}
                <Select
                  value={filters.status[0] || "all"}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    status: value === "all" ? [] : [value]
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                    <SelectItem value="SIMULATED">Simulated</SelectItem>
                  </SelectContent>
                </Select>

                {/* Severity Filter */}
                <Select
                  value={filters.severity[0] || "all"}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    severity: value === "all" ? [] : [value]
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>

                {/* Section Filter (Admin only) */}
                {userRole === 'ADMIN' && (
                  <Select
                    value={filters.section[0] || "all"}
                    onValueChange={(value) => setFilters(prev => ({ 
                      ...prev, 
                      section: value === "all" ? [] : [value]
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {sections.map(section => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
                )}
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-4 mt-4">
                <Label>Sort by:</Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
                    <SelectValue />
            </SelectTrigger>
            <SelectContent>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="time">Time</SelectItem>
                    <SelectItem value="severity">Severity</SelectItem>
            </SelectContent>
          </Select>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    Table
                  </Button>
        </div>
              </div>
            </CardContent>
          </Card>
      </motion.div>

        {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
                  <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Disruptions</p>
                  <p className="text-2xl font-bold text-destructive">
                    {filteredDisruptions.filter(d => d.status === 'ACTIVE').length}
                  </p>
                        </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
                        
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                          <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredDisruptions.filter(d => d.status === 'RESOLVED').length}
                            </p>
                          </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                          <div>
                  <p className="text-sm font-medium text-muted-foreground">Affected Trains</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {filteredDisruptions.reduce((acc, d) => acc + d.impact.delayedTrains, 0)}
                            </p>
                          </div>
                <Train className="h-8 w-8 text-orange-600" />
                        </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Passengers Affected</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredDisruptions.reduce((acc, d) => acc + d.impact.passengersAffected, 0).toLocaleString()}
                  </p>
                          </div>
                <Users className="h-8 w-8 text-blue-600" />
                          </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disruptions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredDisruptions.map((disruption, index) => (
                  <motion.div
                    key={disruption.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{disruption.id}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {disruption.location}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className={getSeverityColor(disruption.severity)}>
                              {disruption.severity}
                            </Badge>
                            <Badge className={getStatusColor(disruption.status)}>
                              {disruption.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {disruption.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                            <p className="font-medium">Affected Trains</p>
                            <p className="text-muted-foreground">{disruption.impact.delayedTrains}</p>
                            </div>
                          <div>
                            <p className="font-medium">Est. Delay</p>
                            <p className="text-muted-foreground">{disruption.impact.estimatedDelay} min</p>
                        </div>
                      </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {new Date(disruption.startTime).toLocaleTimeString()}
                          </div>
                        <Button
                          variant="outline"
                          size="sm"
                            onClick={() => setSelectedDisruption(disruption)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>
                    </div>
                  </CardContent>
                </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Disruptions Table</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDisruptions.map((disruption) => (
                      <TableRow key={disruption.id}>
                        <TableCell className="font-medium">{disruption.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {disruptionTypes.find(t => t.value === disruption.type)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(disruption.severity)}>
                            {disruption.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{disruption.location}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(disruption.status)}>
                            {disruption.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(disruption.startTime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                          <Button
                              variant="outline"
                            size="sm"
                              onClick={() => setSelectedDisruption(disruption)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                            {userRole === 'CONTROLLER' && disruption.status === 'ACTIVE' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResolveDisruption(disruption.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Disruption Details Sheet */}
      <Sheet open={!!selectedDisruption} onOpenChange={() => setSelectedDisruption(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {selectedDisruption?.id}
            </SheetTitle>
            <SheetDescription>
              Detailed information about this disruption
            </SheetDescription>
          </SheetHeader>
          
          {selectedDisruption && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {disruptionTypes.find(t => t.value === selectedDisruption.type)?.label}
                  </p>
                      </div>
                <div>
                  <Label className="text-sm font-medium">Severity</Label>
                  <Badge className={getSeverityColor(selectedDisruption.severity)}>
                    {selectedDisruption.severity}
                  </Badge>
                    </div>
                      </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDisruption.description}
                </p>
                    </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-muted-foreground">{selectedDisruption.location}</p>
                      </div>
                <div>
                  <Label className="text-sm font-medium">Section</Label>
                  <p className="text-sm text-muted-foreground">{selectedDisruption.section}</p>
                    </div>
                  </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Start Time</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedDisruption.startTime).toLocaleString()}
                  </p>
                    </div>
                      <div>
                  <Label className="text-sm font-medium">Est. Resolution</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedDisruption.estimatedResolution).toLocaleString()}
                  </p>
                      </div>
              </div>

                      <div>
                <Label className="text-sm font-medium">Impact</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-destructive">
                      {selectedDisruption.impact.delayedTrains}
                    </p>
                    <p className="text-xs text-muted-foreground">Delayed Trains</p>
                      </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedDisruption.impact.estimatedDelay}
                    </p>
                    <p className="text-xs text-muted-foreground">Est. Delay (min)</p>
                    </div>
                  </div>
            </div>

              {selectedDisruption.aiSuggestion && (
                <div>
                  <Label className="text-sm font-medium">AI Suggestion</Label>
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm">{selectedDisruption.aiSuggestion}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {userRole === 'CONTROLLER' && selectedDisruption.status === 'ACTIVE' && (
                  <Button
                    onClick={() => {
                      handleResolveDisruption(selectedDisruption.id)
                      setSelectedDisruption(null)
                    }}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedDisruption(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Disruption Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Disruption</DialogTitle>
            <DialogDescription>
              Report a new disruption in your section
            </DialogDescription>
          </DialogHeader>
          <CreateDisruptionForm
            onSubmit={handleCreateDisruption}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Simulation Dialog */}
      <Dialog open={isSimulateOpen} onOpenChange={setIsSimulateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Simulate Disruption</DialogTitle>
            <DialogDescription>
              Create a simulated disruption for testing purposes
            </DialogDescription>
          </DialogHeader>
          <SimulationPanel 
            onClose={() => setIsSimulateOpen(false)} 
            onSimulate={(disruption) => {
              setDisruptions(prev => [disruption, ...prev])
              toast.success('Simulation created successfully')
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generate Disruption Report</DialogTitle>
            <DialogDescription>
              Create a comprehensive report of disruptions
            </DialogDescription>
          </DialogHeader>
          <ReportGenerator onClose={() => setIsReportOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Create Disruption Form Component
function CreateDisruptionForm({ onSubmit, onCancel }: { 
  onSubmit: (disruption: Partial<Disruption>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    type: '',
    severity: '',
    location: '',
    description: '',
    estimatedResolution: '',
    priority: 5
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      section: mockUser.section,
      type: formData.type as any,
      severity: formData.severity as any,
      estimatedResolution: new Date(formData.estimatedResolution).toISOString()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {disruptionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
                </div>

                <div>
          <Label htmlFor="severity">Severity</Label>
          <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              {severityLevels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
                </div>
              </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="Enter location"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the disruption"
          required
        />
      </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
          <Label htmlFor="estimatedResolution">Estimated Resolution</Label>
          <Input
            id="estimatedResolution"
            type="datetime-local"
            value={formData.estimatedResolution}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedResolution: e.target.value }))}
            required
          />
                </div>

                <div>
          <Label htmlFor="priority">Priority (1-10)</Label>
          <Input
            id="priority"
            type="number"
            min="1"
            max="10"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
          />
                </div>
              </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Disruption
        </Button>
      </div>
    </form>
  )
}

// Simulation Panel Component
function SimulationPanel({ onClose, onSimulate }: { 
  onClose: () => void
  onSimulate: (disruption: Disruption) => void 
}) {
  const [simulationData, setSimulationData] = useState<SimulationOptions>({
    type: 'WEATHER',
    severity: 'MEDIUM',
    duration: 60,
    affectedSections: [mockUser.section || 'JUC-LDH'],
    description: ''
  })

  const handleSimulate = () => {
    // Generate simulated disruption
    const simulatedDisruption: Disruption = {
      id: `SIM-${Date.now()}`,
      type: simulationData.type,
      severity: simulationData.severity,
      section: simulationData.affectedSections[0],
      location: `Simulated ${simulationData.type.toLowerCase().replace('_', ' ')} location`,
      description: simulationData.description || `Simulated ${simulationData.type.toLowerCase().replace('_', ' ')} disruption`,
      affectedTrains: [`${Math.floor(Math.random() * 90000) + 10000}`],
      startTime: new Date().toISOString(),
      estimatedResolution: new Date(Date.now() + simulationData.duration * 60000).toISOString(),
      status: 'SIMULATED',
      aiSuggestion: 'This is a simulated disruption for testing purposes',
      impact: {
        delayedTrains: Math.floor(Math.random() * 3) + 1,
        cancelledTrains: 0,
        estimatedDelay: Math.floor(Math.random() * 30) + 10,
        passengersAffected: Math.floor(Math.random() * 500) + 100
      },
      createdBy: mockUser.id,
      priority: Math.floor(Math.random() * 5) + 3,
      tags: ['simulated', 'test'],
      lastUpdated: new Date().toISOString()
    }

    // Add to disruptions list
    onSimulate(simulatedDisruption)
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
              <div>
          <Label>Simulation Type</Label>
          <Select value={simulationData.type} onValueChange={(value: any) => setSimulationData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {disruptionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
              </div>

              <div>
          <Label>Severity</Label>
          <Select value={simulationData.severity} onValueChange={(value: any) => setSimulationData(prev => ({ ...prev, severity: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {severityLevels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
                  </div>
                  </div>

      <div>
        <Label>Duration (minutes)</Label>
        <Input
          type="number"
          value={simulationData.duration}
          onChange={(e) => setSimulationData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
          min="1"
          max="480"
        />
                  </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={simulationData.description}
          onChange={(e) => setSimulationData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the simulation scenario"
        />
                  </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSimulate}>
          <Play className="h-4 w-4 mr-2" />
          Start Simulation
        </Button>
                </div>
              </div>
  )
}

// Report Generator Component
function ReportGenerator({ onClose }: { onClose: () => void }) {
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'analytics'>('summary')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const handleGenerateReport = () => {
    toast.success('Report generated successfully')
    onClose()
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Report Type</Label>
        <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summary">Summary Report</SelectItem>
            <SelectItem value="detailed">Detailed Report</SelectItem>
            <SelectItem value="analytics">Analytics Report</SelectItem>
          </SelectContent>
        </Select>
              </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
        </div>
      </div>

              <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
                </Button>
        <Button onClick={handleGenerateReport}>
          <Download className="h-4 w-4 mr-2" />
          Generate Report
                  </Button>
              </div>
    </div>
  )
}