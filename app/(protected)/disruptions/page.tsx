"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
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
  Calendar
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

// Mock disruption data
const mockDisruptions = [
  {
    id: "DIS-001",
    type: "SIGNAL_FAILURE",
    severity: "HIGH",
    section: "JUC-LDH",
    location: "Phagwara Junction",
    description: "Signal failure at Phagwara Junction affecting both up and down lines",
    affectedTrains: ["12345", "12346", "12347"],
    startTime: "2024-01-15 14:30",
    estimatedResolution: "2024-01-15 16:00",
    status: "ACTIVE",
    aiSuggestion: "Implement temporary speed restriction and single line working",
    impact: {
      delayedTrains: 3,
      cancelledTrains: 0,
      estimatedDelay: 45,
      passengersAffected: 1200
    }
  },
  {
    id: "DIS-002",
    type: "TRACK_BLOCKAGE",
    severity: "CRITICAL",
    section: "JUC-LDH",
    location: "Between Jalandhar and Phagwara",
    description: "Tree fallen on track due to strong winds",
    affectedTrains: ["12348", "12349"],
    startTime: "2024-01-15 13:45",
    estimatedResolution: "2024-01-15 15:30",
    status: "ACTIVE",
    aiSuggestion: "Divert trains via alternative route and deploy emergency response team",
    impact: {
      delayedTrains: 2,
      cancelledTrains: 1,
      estimatedDelay: 90,
      passengersAffected: 800
    }
  },
  {
    id: "DIS-003",
    type: "POWER_FAILURE",
    severity: "MEDIUM",
    section: "JUC-LDH",
    location: "Ludhiana Station",
    description: "Power failure affecting station operations and signaling",
    affectedTrains: ["12350"],
    startTime: "2024-01-15 12:15",
    estimatedResolution: "2024-01-15 13:00",
    status: "RESOLVED",
    aiSuggestion: "Use backup power systems and coordinate with local electricity board",
    impact: {
      delayedTrains: 1,
      cancelledTrains: 0,
      estimatedDelay: 15,
      passengersAffected: 300
    }
  }
]

const disruptionTypes = [
  { value: "all", label: "All Types" },
  { value: "SIGNAL_FAILURE", label: "Signal Failure" },
  { value: "TRACK_BLOCKAGE", label: "Track Blockage" },
  { value: "POWER_FAILURE", label: "Power Failure" },
  { value: "WEATHER", label: "Weather Related" },
  { value: "MAINTENANCE", label: "Maintenance" }
]

const severityLevels = [
  { value: "all", label: "All Severities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" }
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "LOW":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "HIGH":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "CRITICAL":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-red-100 text-red-800"
    case "RESOLVED":
      return "bg-green-100 text-green-800"
    case "INVESTIGATING":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "SIGNAL_FAILURE":
      return <AlertTriangle className="h-4 w-4" />
    case "TRACK_BLOCKAGE":
      return <XCircle className="h-4 w-4" />
    case "POWER_FAILURE":
      return <Zap className="h-4 w-4" />
    default:
      return <AlertTriangle className="h-4 w-4" />
  }
}

export default function DisruptionManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [selectedDisruption, setSelectedDisruption] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredDisruptions = mockDisruptions.filter(disruption => {
    const matchesSearch = disruption.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disruption.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disruption.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || disruption.type === typeFilter
    const matchesSeverity = severityFilter === "all" || disruption.severity === severityFilter
    return matchesSearch && matchesType && matchesSeverity
  })

  const handleViewDetails = (disruption: any) => {
    setSelectedDisruption(disruption)
    setIsDetailOpen(true)
  }

  const handleResolveDisruption = (disruptionId: string) => {
    // In a real app, this would send a request to the backend
    console.log(`Resolving disruption ${disruptionId}`)
    // Update the disruption status
    const updatedDisruptions = mockDisruptions.map(d => 
      d.id === disruptionId ? { ...d, status: "RESOLVED" } : d
    )
    // This would trigger a re-render in a real app
  }

  const activeDisruptions = mockDisruptions.filter(d => d.status === "ACTIVE").length
  const resolvedDisruptions = mockDisruptions.filter(d => d.status === "RESOLVED").length
  const totalAffectedTrains = mockDisruptions.reduce((sum, d) => sum + d.impact.delayedTrains + d.impact.cancelledTrains, 0)

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Disruption Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time disruption monitoring and AI-powered resolution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setLastUpdate(new Date())}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Disruptions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeDisruptions}</div>
            <p className="text-xs text-muted-foreground">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedDisruptions}</div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affected Trains</CardTitle>
            <Train className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalAffectedTrains}</div>
            <p className="text-xs text-muted-foreground">
              Currently impacted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {mockDisruptions.filter(d => d.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for active disruptions
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search disruptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Disruption Type" />
            </SelectTrigger>
            <SelectContent>
              {disruptionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              {severityLevels.map((severity) => (
                <SelectItem key={severity.value} value={severity.value}>
                  {severity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Tabs defaultValue="disruptions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="disruptions">Active Disruptions</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Active Disruptions Tab */}
          <TabsContent value="disruptions" className="space-y-4">
            <div className="space-y-4">
              {filteredDisruptions.filter(d => d.status === "ACTIVE").map((disruption) => (
                <Card key={disruption.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(disruption.type)}
                          <h3 className="font-semibold text-lg">{disruption.id}</h3>
                          <Badge className={getSeverityColor(disruption.severity)}>
                            {disruption.severity}
                          </Badge>
                          <Badge className={getStatusColor(disruption.status)}>
                            {disruption.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Location</p>
                            <p className="font-medium flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {disruption.location}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Started</p>
                            <p className="font-medium flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(disruption.startTime).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{disruption.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-600">{disruption.impact.delayedTrains}</div>
                            <div className="text-xs text-muted-foreground">Delayed Trains</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">{disruption.impact.cancelledTrains}</div>
                            <div className="text-xs text-muted-foreground">Cancelled Trains</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-600">{disruption.impact.estimatedDelay}m</div>
                            <div className="text-xs text-muted-foreground">Avg Delay</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">{disruption.impact.passengersAffected}</div>
                            <div className="text-xs text-muted-foreground">Passengers Affected</div>
                          </div>
                        </div>

                        {/* AI Suggestion */}
                        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="flex items-start gap-2">
                            <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-800">AI Suggestion</p>
                              <p className="text-sm text-blue-700">{disruption.aiSuggestion}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(disruption)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleResolveDisruption(disruption.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredDisruptions.filter(d => d.status === "ACTIVE").length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Disruptions</h3>
                    <p className="text-muted-foreground">All systems are running smoothly</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Resolved Disruptions Tab */}
          <TabsContent value="resolved" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDisruptions.filter(d => d.status === "RESOLVED").map((disruption) => (
                      <TableRow key={disruption.id}>
                        <TableCell className="font-mono">{disruption.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(disruption.type)}
                            {disruption.type.replace("_", " ")}
                          </div>
                        </TableCell>
                        <TableCell>{disruption.location}</TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(disruption.severity)}>
                            {disruption.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {Math.round((new Date(disruption.estimatedResolution).getTime() - new Date(disruption.startTime).getTime()) / (1000 * 60))} min
                        </TableCell>
                        <TableCell>
                          {disruption.impact.delayedTrains + disruption.impact.cancelledTrains} trains
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(disruption)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Disruption Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Signal Failures</span>
                      <div className="flex items-center gap-2">
                        <Progress value={40} className="w-20" />
                        <span className="text-sm font-medium">2</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Track Blockages</span>
                      <div className="flex items-center gap-2">
                        <Progress value={20} className="w-20" />
                        <span className="text-sm font-medium">1</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Power Failures</span>
                      <div className="flex items-center gap-2">
                        <Progress value={40} className="w-20" />
                        <span className="text-sm font-medium">1</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resolution Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">45 min</div>
                      <p className="text-sm text-muted-foreground">Average Resolution Time</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold">15 min</div>
                        <div className="text-xs text-muted-foreground">Fastest</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">90 min</div>
                        <div className="text-xs text-muted-foreground">Longest</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Disruption Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {selectedDisruption?.id} - {selectedDisruption?.type?.replace("_", " ")}
            </DialogTitle>
            <DialogDescription>
              Detailed information and resolution status
            </DialogDescription>
          </DialogHeader>
          {selectedDisruption && (
            <div className="space-y-6">
              {/* Status Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Severity</h4>
                  <Badge className={getSeverityColor(selectedDisruption.severity)}>
                    {selectedDisruption.severity}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <Badge className={getStatusColor(selectedDisruption.status)}>
                    {selectedDisruption.status}
                  </Badge>
                </div>
              </div>

              {/* Location and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <p className="text-sm text-muted-foreground">{selectedDisruption.location}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Started</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedDisruption.startTime).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedDisruption.description}</p>
              </div>

              {/* Impact Details */}
              <div>
                <h4 className="font-medium mb-3">Impact Assessment</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-red-50">
                    <div className="text-2xl font-bold text-red-600">{selectedDisruption.impact.delayedTrains}</div>
                    <div className="text-xs text-muted-foreground">Delayed Trains</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-orange-50">
                    <div className="text-2xl font-bold text-orange-600">{selectedDisruption.impact.cancelledTrains}</div>
                    <div className="text-xs text-muted-foreground">Cancelled Trains</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-yellow-50">
                    <div className="text-2xl font-bold text-yellow-600">{selectedDisruption.impact.estimatedDelay}m</div>
                    <div className="text-xs text-muted-foreground">Avg Delay</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-purple-50">
                    <div className="text-2xl font-bold text-purple-600">{selectedDisruption.impact.passengersAffected}</div>
                    <div className="text-xs text-muted-foreground">Passengers Affected</div>
                  </div>
                </div>
              </div>

              {/* AI Suggestion */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-medium mb-2 text-blue-800">AI Suggestion</h4>
                <p className="text-sm text-blue-700">{selectedDisruption.aiSuggestion}</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
                {selectedDisruption.status === "ACTIVE" && (
                  <Button onClick={() => handleResolveDisruption(selectedDisruption.id)}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Resolve Disruption
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
