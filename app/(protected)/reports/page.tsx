"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Clock,
  Train,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Filter,
  Eye,
  Printer
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts"

// Mock data for charts
const throughputData = [
  { month: "Jan", current: 85, target: 90, previous: 82 },
  { month: "Feb", current: 88, target: 90, previous: 85 },
  { month: "Mar", current: 92, target: 90, previous: 88 },
  { month: "Apr", current: 89, target: 90, previous: 92 },
  { month: "May", current: 94, target: 90, previous: 89 },
  { month: "Jun", current: 91, target: 90, previous: 94 }
]

const delayBreakdown = [
  { type: "Signal Failure", count: 12, percentage: 35, color: "#ef4444" },
  { type: "Weather", count: 8, percentage: 23, color: "#f59e0b" },
  { type: "Maintenance", count: 6, percentage: 18, color: "#3b82f6" },
  { type: "Power Issues", count: 4, percentage: 12, color: "#8b5cf6" },
  { type: "Other", count: 4, percentage: 12, color: "#6b7280" }
]

const sectionPerformance = [
  { section: "JUC-LDH", trains: 45, onTime: 42, delays: 3, throughput: 93.3 },
  { section: "LDH-ASR", trains: 38, onTime: 35, delays: 3, throughput: 92.1 },
  { section: "ASR-NDLS", trains: 52, onTime: 48, delays: 4, throughput: 92.3 },
  { section: "NDLS-AGC", trains: 41, onTime: 38, delays: 3, throughput: 92.7 }
]

const hourlyThroughput = [
  { hour: "06:00", trains: 8, capacity: 12 },
  { hour: "08:00", trains: 15, capacity: 18 },
  { hour: "10:00", trains: 12, capacity: 15 },
  { hour: "12:00", trains: 18, capacity: 20 },
  { hour: "14:00", trains: 14, capacity: 16 },
  { hour: "16:00", trains: 16, capacity: 18 },
  { hour: "18:00", trains: 19, capacity: 22 },
  { hour: "20:00", trains: 11, capacity: 14 }
]

const kpiData = [
  { metric: "Overall Punctuality", current: 92.3, target: 95.0, change: 2.1, trend: "up" },
  { metric: "Average Delay", current: 3.2, target: 2.0, change: -0.8, trend: "down" },
  { metric: "Throughput Efficiency", current: 89.7, target: 90.0, change: 1.2, trend: "up" },
  { metric: "Disruption Rate", current: 2.1, target: 1.5, change: -0.3, trend: "down" }
]

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [selectedReport, setSelectedReport] = useState("overview")
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastGenerated, setLastGenerated] = useState(new Date())

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    setLastGenerated(new Date())
  }

  const handleDownloadReport = (format: string) => {
    // In a real app, this would download the actual report
    console.log(`Downloading report in ${format} format`)
  }

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-green-600" : "text-red-600"
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
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive performance analysis and reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1week">Last Week</SelectItem>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.metric}</CardTitle>
              {getTrendIcon(kpi.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.current}%</div>
              <div className="flex items-center gap-1 text-xs">
                <span className={getTrendColor(kpi.trend)}>
                  {kpi.change > 0 ? "+" : ""}{kpi.change}%
                </span>
                <span className="text-muted-foreground">vs target ({kpi.target}%)</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs value={selectedReport} onValueChange={setSelectedReport} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="throughput">Throughput</TabsTrigger>
            <TabsTrigger value="delays">Delays</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Throughput Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Throughput Trend
                  </CardTitle>
                  <CardDescription>
                    Monthly throughput performance vs targets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={throughputData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[70, 100]} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="current" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          name="Current"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="target" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Target"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="previous" 
                          stroke="#6b7280" 
                          strokeWidth={2}
                          name="Previous Year"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Delay Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Delay Breakdown
                  </CardTitle>
                  <CardDescription>
                    Causes of train delays by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={delayBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          dataKey="count"
                        >
                          {delayBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {delayBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.type}</span>
                        </div>
                        <span className="font-medium">{item.count} ({item.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Section Performance</CardTitle>
                <CardDescription>
                  Performance metrics by railway section
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Total Trains</TableHead>
                      <TableHead>On Time</TableHead>
                      <TableHead>Delays</TableHead>
                      <TableHead>Throughput %</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectionPerformance.map((section, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{section.section}</TableCell>
                        <TableCell>{section.trains}</TableCell>
                        <TableCell className="text-green-600">{section.onTime}</TableCell>
                        <TableCell className="text-red-600">{section.delays}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={section.throughput} className="w-20" />
                            <span className="text-sm font-medium">{section.throughput}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={section.throughput >= 90 ? "default" : "secondary"}>
                            {section.throughput >= 90 ? "Excellent" : "Good"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Throughput Tab */}
          <TabsContent value="throughput" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Hourly Throughput Analysis
                </CardTitle>
                <CardDescription>
                  Train capacity utilization throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyThroughput}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="trains" fill="#3b82f6" name="Actual Trains" />
                      <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Peak Hour Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Morning Peak (8-10 AM)</span>
                      <div className="flex items-center gap-2">
                        <Progress value={83} className="w-20" />
                        <span className="text-sm text-muted-foreground">83%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Evening Peak (6-8 PM)</span>
                      <div className="flex items-center gap-2">
                        <Progress value={86} className="w-20" />
                        <span className="text-sm text-muted-foreground">86%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Off-Peak Hours</span>
                      <div className="flex items-center gap-2">
                        <Progress value={64} className="w-20" />
                        <span className="text-sm text-muted-foreground">64%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Throughput Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">89.7%</div>
                    <p className="text-sm text-muted-foreground mb-4">Overall Efficiency</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Target</span>
                        <span className="font-medium">90.0%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Previous Month</span>
                        <span className="font-medium text-green-600">+1.2%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Delays Tab */}
          <TabsContent value="delays" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Delay Analysis
                </CardTitle>
                <CardDescription>
                  Detailed analysis of train delays and their causes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={throughputData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="current" 
                        stackId="1"
                        stroke="#3b82f6" 
                        fill="#3b82f6"
                        fillOpacity={0.6}
                        name="On Time"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="target" 
                        stackId="2"
                        stroke="#10b981" 
                        fill="#10b981"
                        fillOpacity={0.3}
                        name="Target"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Delay</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">3.2 min</div>
                  <p className="text-xs text-muted-foreground">-0.8 min vs last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Delay Frequency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">12.5%</div>
                  <p className="text-xs text-muted-foreground">of all trains delayed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Punctuality</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">87.5%</div>
                  <p className="text-xs text-muted-foreground">+2.1% vs last month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Section Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sectionPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="section" />
                        <YAxis domain={[80, 100]} />
                        <Tooltip />
                        <Bar dataKey="throughput" fill="#3b82f6" name="Throughput %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Section Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sectionPerformance.map((section, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{section.section}</h4>
                          <Badge variant={section.throughput >= 90 ? "default" : "secondary"}>
                            {section.throughput}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Trains:</span>
                            <span className="ml-1 font-medium">{section.trains}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">On Time:</span>
                            <span className="ml-1 font-medium text-green-600">{section.onTime}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Delays:</span>
                            <span className="ml-1 font-medium text-red-600">{section.delays}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Efficiency:</span>
                            <span className="ml-1 font-medium">{section.throughput}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Report Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-between items-center p-4 bg-muted/50 rounded-lg"
      >
        <div>
          <p className="text-sm font-medium">Report Generated</p>
          <p className="text-xs text-muted-foreground">
            Last updated: {lastGenerated.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleDownloadReport("PDF")}>
            <FileText className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => handleDownloadReport("Excel")}>
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
