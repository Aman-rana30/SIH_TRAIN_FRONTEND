"use client"

import type React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Train, User, Shield, MapPin, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LoginPage() {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"controller" | "admin" | "">("")
  const [sectionId, setSectionId] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const search = useSearchParams()
  const redirectTo = search.get("redirect") || "/dashboard"

  function login(e: React.FormEvent) {
    e.preventDefault()
    
    // Validation based on role
    if (role === "controller" && !sectionId) {
      alert("Please enter a Section ID for Controller role")
      return
    }
    
    if (!name || !password || !role) {
      alert("Please fill in all required fields")
      return
    }

    // Store user data with role information
    const userData = {
      name: name,
      role: role,
      sectionId: role === "controller" ? sectionId : null,
      loginTime: new Date().toISOString()
    }

    localStorage.setItem("rcd_token", "mock-token")
    localStorage.setItem("rcd_user", JSON.stringify(userData))
    
    // Redirect based on role
    const targetRoute = role === "admin" ? "/admin" : "/dashboard"
    router.replace(targetRoute)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Railway-themed background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-1 bg-blue-400 transform rotate-12"></div>
        <div className="absolute top-40 right-20 w-24 h-1 bg-green-400 transform -rotate-12"></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-1 bg-yellow-400 transform rotate-45"></div>
        <div className="absolute bottom-20 right-1/3 w-36 h-1 bg-red-400 transform -rotate-45"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center"
            >
              <Train className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Controller Sarthi
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              AI-Powered Train Traffic Control & Throughput Optimization
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={login} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Role Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Role</Label>
                <Select value={role} onValueChange={(value: "controller" | "admin") => setRole(value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="controller">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Controller</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Section ID Field - Only for Controllers */}
              {role === "controller" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="sectionId" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Section ID
                  </Label>
                  <Input
                    id="sectionId"
                    type="text"
                    placeholder="e.g., JUC-LDH"
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    required
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the railway section you're responsible for
                  </p>
                </motion.div>
              )}

              {/* Login Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold"
                >
                  {role === "admin" ? "Access Admin Panel" : "Enter Controller Dashboard"}
                </Button>
              </motion.div>
            </form>

            {/* Demo Info */}
            <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-dashed">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  Demo Mode
                </Badge>
                <span>Mock authentication for demonstration</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
