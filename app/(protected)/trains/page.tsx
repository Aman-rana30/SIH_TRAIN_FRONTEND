"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Train, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  MoreHorizontal
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useMemo } from "react"
import { useSchedule } from "@/hooks/use-train-data"

// Helper to derive status from delay
const deriveStatus = (delayMinutes: number | undefined) => {
  const d = delayMinutes || 0
  if (d <= 0) return "ON_TIME"
  if (d <= 10) return "DELAYED"
  return "CRITICAL"
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ON_TIME":
      return "bg-green-100 text-green-800 border-green-200"
    case "DELAYED":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "CRITICAL":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "ON_TIME":
      return <CheckCircle2 className="h-4 w-4" />
    case "DELAYED":
      return <Clock className="h-4 w-4" />
    case "CRITICAL":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <XCircle className="h-4 w-4" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "bg-red-100 text-red-800"
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800"
    case "LOW":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function TrainMonitoringPage() {
  const { data: scheduleData, isLoading } = useSchedule()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTrain, setSelectedTrain] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Map backend schedule data into table friendly rows
  const trains = useMemo(() => {
    const userData = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem("rcd_user") || '{}')
      : {}
    const sectionId = userData?.sectionId || ""
    return (scheduleData || []).map((t: any) => {
      const delay = t.delay_minutes ?? t.delay ?? 0
      const type = t.train_type || t.type || "PASSENGER"
      const priority = t.priority || (type === "EXPRESS" ? "HIGH" : type === "FREIGHT" ? "LOW" : "MEDIUM")
      const progress = Math.max(0, Math.min(100, Math.round(t.progress_percent ?? t.progress ?? 0)))
      return {
        id: t.train_id || t.id || t.number || "—",
        name: t.train_name || t.name || "Train",
        type,
        priority,
        section: sectionId || t.section_id || "—",
        currentStation: t.current_station || t.origin_station || t.from_station || "—",
        nextStation: t.next_station || t.destination_station || t.to_station || "—",
        eta: t.eta || t.arrival_time || t.eta_next_junction || "--:--",
        status: deriveStatus(delay),
        delay,
        speed: t.speed_kmph || t.speed || 0,
        progress,
        conflicts: (t.conflicts || 0) + (t.is_conflicted ? 1 : 0),
      }
    })
  }, [scheduleData])

  const filteredTrains = trains.filter(train => {
    const matchesSearch = train.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         train.id.includes(searchTerm) ||
                         train.currentStation.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || train.status === statusFilter
    const matchesType = typeFilter === "all" || train.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleViewDetails = (train: any) => {
    setSelectedTrain(train)
    setIsDetailOpen(true)
  }

  const exportData = () => {
    const csvContent = [
      ["Train ID", "Name", "Type", "Priority", "Section", "Current Station", "Next Station", "ETA", "Status", "Delay (min)", "Speed (km/h)", "Progress (%)", "Conflicts"],
      ...filteredTrains.map(train => [
        train.id,
        train.name,
        train.type,
        train.priority,
        train.section,
        train.currentStation,
        train.nextStation,
        train.eta,
        train.status,
        train.delay,
        train.speed,
        train.progress,
        train.conflicts
      ])
    ].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `train-monitoring-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Train Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time train status and position tracking
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
            <CardTitle className="text-sm font-medium">Total Trains</CardTitle>
            <Train className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trains.length}</div>
            <p className="text-xs text-muted-foreground">
              Active in section
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Time</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {trains.filter(t => t.status === "ON_TIME").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {trains.length ? Math.round((trains.filter(t => t.status === "ON_TIME").length / trains.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {trains.filter(t => t.status === "DELAYED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {trains.length ? Math.round((trains.filter(t => t.status === "DELAYED").length / trains.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {trains.reduce((sum, t) => sum + t.conflicts, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Actions */}
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
              placeholder="Search trains, stations, or IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ON_TIME">On Time</SelectItem>
              <SelectItem value="DELAYED">Delayed</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="EXPRESS">Express</SelectItem>
              <SelectItem value="PASSENGER">Passenger</SelectItem>
              <SelectItem value="FREIGHT">Freight</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </motion.div>

      {/* Train Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Train className="h-5 w-5" />
              Active Trains ({isLoading ? "..." : filteredTrains.length})
            </CardTitle>
            <CardDescription>
              Real-time status of all trains in your section
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Train ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Current Station</TableHead>
                    <TableHead>Next Station</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delay</TableHead>
                    <TableHead>Speed</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Conflicts</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrains.map((train) => (
                    <TableRow key={train.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{train.id}</TableCell>
                      <TableCell className="font-medium">{train.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{train.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(train.priority)}>
                          {train.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {train.currentStation}
                      </TableCell>
                      <TableCell>{train.nextStation}</TableCell>
                      <TableCell className="font-mono">{train.eta}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(train.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(train.status)}
                          {train.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {train.delay > 0 ? (
                          <span className="text-red-600 font-medium">+{train.delay}m</span>
                        ) : (
                          <span className="text-green-600">On time</span>
                        )}
                      </TableCell>
                      <TableCell>{train.speed} km/h</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={train.progress} className="w-16" />
                          <span className="text-sm text-muted-foreground">{train.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {train.conflicts > 0 ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {train.conflicts}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Clear
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(train)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Train Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Train className="h-5 w-5" />
              {selectedTrain?.name} - {selectedTrain?.id}
            </DialogTitle>
            <DialogDescription>
              Detailed information and real-time status
            </DialogDescription>
          </DialogHeader>
          {selectedTrain && (
            <div className="space-y-6">
              {/* Status Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Current Status</h4>
                  <Badge className={`${getStatusColor(selectedTrain.status)} flex items-center gap-1 w-fit`}>
                    {getStatusIcon(selectedTrain.status)}
                    {selectedTrain.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Priority</h4>
                  <Badge className={getPriorityColor(selectedTrain.priority)}>
                    {selectedTrain.priority}
                  </Badge>
                </div>
              </div>

              {/* Route Information */}
              <div className="space-y-4">
                <h4 className="font-medium">Route Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Station</p>
                    <p className="font-medium">{selectedTrain.currentStation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Station</p>
                    <p className="font-medium">{selectedTrain.nextStation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ETA</p>
                    <p className="font-medium font-mono">{selectedTrain.eta}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Section</p>
                    <p className="font-medium">{selectedTrain.section}</p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h4 className="font-medium">Performance Metrics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Speed</p>
                    <p className="text-2xl font-bold">{selectedTrain.speed} km/h</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delay</p>
                    <p className={`text-2xl font-bold ${selectedTrain.delay > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedTrain.delay > 0 ? `+${selectedTrain.delay}m` : 'On time'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold">{selectedTrain.progress}%</p>
                  </div>
                </div>
                <Progress value={selectedTrain.progress} className="w-full" />
              </div>

              {/* Conflicts */}
              {selectedTrain.conflicts > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Active Conflicts</h4>
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-800">
                      {selectedTrain.conflicts} schedule conflict(s) detected. 
                      Immediate attention required.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
