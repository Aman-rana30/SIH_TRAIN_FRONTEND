"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  MapPin, 
  Settings, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  Clock,
  Activity
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Mock data
const mockControllers = [
  { id: 1, name: "Alice Johnson", sectionId: "JUC-LDH", status: "active", lastLogin: "2024-01-15 14:30", role: "controller" },
  { id: 2, name: "Bob Smith", sectionId: "LDH-ASR", status: "active", lastLogin: "2024-01-15 13:45", role: "controller" },
  { id: 3, name: "Carol Davis", sectionId: "ASR-NDLS", status: "inactive", lastLogin: "2024-01-14 16:20", role: "controller" },
  { id: 4, name: "David Wilson", sectionId: "NDLS-AGC", status: "active", lastLogin: "2024-01-15 12:15", role: "controller" },
]

const mockSections = [
  { id: 1, name: "Jalandhar - Ludhiana", code: "JUC-LDH", length: "65 km", capacity: "20 trains/hour", status: "operational" },
  { id: 2, name: "Ludhiana - Amritsar", code: "LDH-ASR", length: "120 km", capacity: "18 trains/hour", status: "operational" },
  { id: 3, name: "Amritsar - New Delhi", code: "ASR-NDLS", length: "450 km", capacity: "25 trains/hour", status: "maintenance" },
  { id: 4, name: "New Delhi - Agra", code: "NDLS-AGC", length: "200 km", capacity: "22 trains/hour", status: "operational" },
]

const mockSystemMetrics = {
  totalControllers: 4,
  activeControllers: 3,
  totalSections: 4,
  operationalSections: 3,
  systemUptime: "99.8%",
  lastBackup: "2024-01-15 02:00",
  alerts: 2,
  incidents: 0
}

export default function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("overview")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)

  const filteredControllers = mockControllers.filter(controller =>
    controller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    controller.sectionId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSections = mockSections.filter(section =>
    section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            System administration and user management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            Admin Access
          </Badge>
        </div>
      </motion.div>

      {/* System Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Controllers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSystemMetrics.activeControllers}</div>
            <p className="text-xs text-muted-foreground">
              of {mockSystemMetrics.totalControllers} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operational Sections</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSystemMetrics.operationalSections}</div>
            <p className="text-xs text-muted-foreground">
              of {mockSystemMetrics.totalSections} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockSystemMetrics.systemUptime}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{mockSystemMetrics.alerts}</div>
            <p className="text-xs text-muted-foreground">
              {mockSystemMetrics.incidents} incidents
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="sections">Section Management</TabsTrigger>
          </TabsList>

          {/* System Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Alice Johnson logged in</p>
                        <p className="text-xs text-muted-foreground">Section JUC-LDH • 2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">System backup completed</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Section ASR-NDLS under maintenance</p>
                        <p className="text-xs text-muted-foreground">4 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Auto-backup</p>
                        <p className="text-xs text-muted-foreground">Daily at 2:00 AM</p>
                      </div>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Alert notifications</p>
                        <p className="text-xs text-muted-foreground">Email & SMS</p>
                      </div>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Maintenance mode</p>
                        <p className="text-xs text-muted-foreground">Scheduled maintenance</p>
                      </div>
                      <Badge variant="secondary">Disabled</Badge>
                    </div>
                    <Button className="w-full" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search controllers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Controller
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Controller</DialogTitle>
                    <DialogDescription>
                      Create a new controller account with section assignment.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Enter full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section">Section Assignment</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockSections.map((section) => (
                            <SelectItem key={section.id} value={section.code}>
                              {section.name} ({section.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddUserOpen(false)}>
                        Add Controller
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Section ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredControllers.map((controller) => (
                      <TableRow key={controller.id}>
                        <TableCell className="font-medium">{controller.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{controller.sectionId}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={controller.status === "active" ? "default" : "secondary"}>
                            {controller.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {controller.lastLogin}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section Management Tab */}
          <TabsContent value="sections" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Railway Section</DialogTitle>
                    <DialogDescription>
                      Create a new railway section with capacity and operational details.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sectionName">Section Name</Label>
                      <Input id="sectionName" placeholder="e.g., Jalandhar - Ludhiana" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sectionCode">Section Code</Label>
                      <Input id="sectionCode" placeholder="e.g., JUC-LDH" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="length">Length (km)</Label>
                        <Input id="length" placeholder="65" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity (trains/hour)</Label>
                        <Input id="capacity" placeholder="20" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddSectionOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddSectionOpen(false)}>
                        Add Section
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Length</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSections.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium">{section.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{section.code}</Badge>
                        </TableCell>
                        <TableCell>{section.length}</TableCell>
                        <TableCell>{section.capacity}</TableCell>
                        <TableCell>
                          <Badge variant={section.status === "operational" ? "default" : "secondary"}>
                            {section.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
