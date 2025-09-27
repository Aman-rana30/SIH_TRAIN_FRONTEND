"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Download,
  Play,
  Pause,
  RotateCcw,
  Brain,
  Target,
  ArrowRight,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

// Mock optimization data
const currentSchedule = [
  { id: "12345", name: "Rajdhani Express", departure: "14:00", arrival: "15:30", priority: "HIGH", delay: 0 },
  { id: "12346", name: "Shatabdi Express", departure: "14:15", arrival: "15:45", priority: "HIGH", delay: 12 },
  { id: "12347", name: "Passenger Train", departure: "14:30", arrival: "16:00", priority: "MEDIUM", delay: 0 },
  { id: "12348", name: "Freight Train", departure: "15:00", arrival: "17:00", priority: "LOW", delay: 25 },
  { id: "12349", name: "Intercity Express", departure: "15:30", arrival: "17:00", priority: "HIGH", delay: 0 }
]

const optimizedSchedule = [
  { id: "12345", name: "Rajdhani Express", departure: "14:00", arrival: "15:30", priority: "HIGH", delay: 0, change: "none" },
  { id: "12346", name: "Shatabdi Express", departure: "14:20", arrival: "15:50", priority: "HIGH", delay: 5, change: "delay_reduced" },
  { id: "12347", name: "Passenger Train", departure: "14:35", arrival: "16:05", priority: "MEDIUM", delay: 0, change: "delay_added" },
  { id: "12348", name: "Freight Train", departure: "16:00", arrival: "18:00", priority: "LOW", delay: 0, change: "moved" },
  { id: "12349", name: "Intercity Express", departure: "15:30", arrival: "17:00", priority: "HIGH", delay: 0, change: "none" }
]

const throughputData = [
  { time: "06:00", current: 12, optimized: 15 },
  { time: "08:00", current: 18, optimized: 22 },
  { time: "10:00", current: 15, optimized: 20 },
  { time: "12:00", current: 20, optimized: 25 },
  { time: "14:00", current: 16, optimized: 21 },
  { time: "16:00", current: 14, optimized: 18 },
  { time: "18:00", current: 17, optimized: 23 },
  { time: "20:00", current: 13, optimized: 17 }
]

const aiSuggestions = [
  {
    id: 1,
    title: "Reschedule Freight Train to Off-Peak Hours",
    description: "Move freight train from 15:00 to 16:00 to reduce passenger train delays",
    impact: "high",
    confidence: 92,
    estimatedImprovement: "15% throughput increase"
  },
  {
    id: 2,
    title: "Optimize Express Train Spacing",
    description: "Adjust Shatabdi Express departure by 5 minutes to prevent conflicts",
    impact: "medium",
    confidence: 87,
    estimatedImprovement: "8% delay reduction"
  },
  {
    id: 3,
    title: "Implement Dynamic Speed Control",
    description: "Use variable speed limits based on real-time congestion",
    impact: "high",
    confidence: 89,
    estimatedImprovement: "12% efficiency gain"
  }
]

export default function OptimizationPage() {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationComplete, setOptimizationComplete] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null)
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)
  const [lastOptimization, setLastOptimization] = useState(new Date())

  const handleOptimize = async () => {
    setIsOptimizing(true)
    // Simulate AI optimization process
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsOptimizing(false)
    setOptimizationComplete(true)
    setLastOptimization(new Date())
  }

  const handleApplyOptimization = () => {
    // Apply the optimized schedule
    setOptimizationComplete(false)
    // In a real app, this would send data to the backend
    console.log("Applied optimized schedule")
  }

  const handleViewSuggestion = (suggestion: any) => {
    setSelectedSuggestion(suggestion)
    setIsSuggestionOpen(true)
  }

  const getChangeIcon = (change: string) => {
    switch (change) {
      case "delay_reduced":
        return <ArrowDown className="h-4 w-4 text-green-600" />
      case "delay_added":
        return <ArrowUp className="h-4 w-4 text-yellow-600" />
      case "moved":
        return <ArrowRight className="h-4 w-4 text-blue-600" />
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-600" />
    }
  }

  const getChangeText = (change: string) => {
    switch (change) {
      case "delay_reduced":
        return "Delay Reduced"
      case "delay_added":
        return "Minor Delay Added"
      case "moved":
        return "Rescheduled"
      default:
        return "No Change"
    }
  }

  const getChangeColor = (change: string) => {
    switch (change) {
      case "delay_reduced":
        return "text-green-600 bg-green-50 border-green-200"
      case "delay_added":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "moved":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
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
            AI Optimization
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered schedule optimization and throughput maximization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Brain className="h-3 w-3" />
            AI-Powered
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Analysis
          </Button>
        </div>
      </motion.div>

      {/* AI Suggestion Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Brain className="h-5 w-5" />
              AI Suggestion: Maximize Throughput
            </CardTitle>
            <CardDescription className="text-blue-700">
              Our AI has analyzed your current schedule and identified optimization opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-blue-800">
                  <strong>Estimated Improvement:</strong> 18% throughput increase, 25% delay reduction
                </p>
                <p className="text-xs text-blue-600">
                  Last analysis: {lastOptimization.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Run Optimization
                    </>
                  )}
                </Button>
                {optimizationComplete && (
                  <Button onClick={handleApplyOptimization} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Apply Changes
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="comparison" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison">Schedule Comparison</TabsTrigger>
            <TabsTrigger value="throughput">Throughput Analysis</TabsTrigger>
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          </TabsList>

          {/* Schedule Comparison Tab */}
          <TabsContent value="comparison" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Current Schedule
                  </CardTitle>
                  <CardDescription>
                    Existing train schedule with current delays
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Train</TableHead>
                        <TableHead>Departure</TableHead>
                        <TableHead>Arrival</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Delay</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentSchedule.map((train) => (
                        <TableRow key={train.id}>
                          <TableCell className="font-medium">{train.name}</TableCell>
                          <TableCell className="font-mono">{train.departure}</TableCell>
                          <TableCell className="font-mono">{train.arrival}</TableCell>
                          <TableCell>
                            <Badge variant={train.priority === "HIGH" ? "destructive" : train.priority === "MEDIUM" ? "default" : "secondary"}>
                              {train.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {train.delay > 0 ? (
                              <span className="text-red-600 font-medium">+{train.delay}m</span>
                            ) : (
                              <span className="text-green-600">On time</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Optimized Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Optimized Schedule
                  </CardTitle>
                  <CardDescription>
                    AI-optimized schedule for maximum throughput
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Train</TableHead>
                        <TableHead>Departure</TableHead>
                        <TableHead>Arrival</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Delay</TableHead>
                        <TableHead>Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {optimizedSchedule.map((train) => (
                        <TableRow key={train.id}>
                          <TableCell className="font-medium">{train.name}</TableCell>
                          <TableCell className="font-mono">{train.departure}</TableCell>
                          <TableCell className="font-mono">{train.arrival}</TableCell>
                          <TableCell>
                            <Badge variant={train.priority === "HIGH" ? "destructive" : train.priority === "MEDIUM" ? "default" : "secondary"}>
                              {train.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {train.delay > 0 ? (
                              <span className="text-red-600 font-medium">+{train.delay}m</span>
                            ) : (
                              <span className="text-green-600">On time</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getChangeColor(train.change)} flex items-center gap-1`}>
                              {getChangeIcon(train.change)}
                              {getChangeText(train.change)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Optimization Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">18%</div>
                    <p className="text-sm text-muted-foreground">Throughput Increase</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">25%</div>
                    <p className="text-sm text-muted-foreground">Delay Reduction</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">92%</div>
                    <p className="text-sm text-muted-foreground">AI Confidence</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Throughput Analysis Tab */}
          <TabsContent value="throughput" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Throughput Comparison
                </CardTitle>
                <CardDescription>
                  Current vs optimized throughput over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={throughputData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="current" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        name="Current"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="optimized" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Optimized"
                      />
                    </LineChart>
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
                        <Progress value={75} className="w-20" />
                        <span className="text-sm text-muted-foreground">15/20 trains</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Evening Peak (6-8 PM)</span>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="w-20" />
                        <span className="text-sm text-muted-foreground">17/20 trains</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Off-Peak Hours</span>
                      <div className="flex items-center gap-2">
                        <Progress value={60} className="w-20" />
                        <span className="text-sm text-muted-foreground">12/20 trains</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Capacity Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={throughputData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="current" fill="#ef4444" name="Current" />
                        <Bar dataKey="optimized" fill="#10b981" name="Optimized" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <div className="space-y-4">
              {aiSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{suggestion.title}</h3>
                          <Badge variant={suggestion.impact === "high" ? "destructive" : "default"}>
                            {suggestion.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {suggestion.confidence}% confidence
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {suggestion.estimatedImprovement}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSuggestion(suggestion)}
                        >
                          View Details
                        </Button>
                        <Button size="sm">
                          Apply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Suggestion Detail Dialog */}
      <Dialog open={isSuggestionOpen} onOpenChange={setIsSuggestionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {selectedSuggestion?.title}
            </DialogTitle>
            <DialogDescription>
              Detailed analysis and implementation details
            </DialogDescription>
          </DialogHeader>
          {selectedSuggestion && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedSuggestion.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Confidence Level</h4>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedSuggestion.confidence} className="flex-1" />
                    <span className="text-sm font-medium">{selectedSuggestion.confidence}%</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Expected Impact</h4>
                  <Badge variant={selectedSuggestion.impact === "high" ? "destructive" : "default"}>
                    {selectedSuggestion.impact} impact
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Estimated Improvement</h4>
                <p className="text-sm text-muted-foreground">{selectedSuggestion.estimatedImprovement}</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSuggestionOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsSuggestionOpen(false)}>
                  Apply Suggestion
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
