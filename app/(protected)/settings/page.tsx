"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import api from "@/lib/api"

// Types for settings data
interface UserPreferences {
  section: string
  timezone: string
  language: string
  notifications: {
    train_delay_alerts: boolean
    disruption_alerts: boolean
    maintenance_alerts: boolean
    system_updates: boolean
    in_app: boolean
    email: boolean
    sms: boolean
  }
}

interface UserAccount {
  name: string
  role: string
  email: string
  phone: string
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("general")
  const [hasChanges, setHasChanges] = useState(false)
  const [userName, setUserName] = useState("")

  
  // Fetch user preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ["settings-preferences"],
    queryFn: async () => {
      const { data } = await api.get("/api/settings/preferences")
      return data as UserPreferences
    },
    enabled: true, // Enable API calls
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch user account data
  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ["settings-account"],
    queryFn: async () => {
      const { data } = await api.get("/api/settings/account")
      return data as UserAccount
    },
    enabled: true, // Enable API calls
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch sections for dropdown
  const { data: sections } = useQuery({
    queryKey: ["sections"],
    queryFn: async () => {
      const { data } = await api.get("/api/schedule/sections")
      return data as Array<{ section_id: string; description?: string }>
    },
    staleTime: 60 * 1000, // 1 minute
  })

  // Local state for form data
  const [formData, setFormData] = useState<UserPreferences>({
    section: "",
    timezone: "Asia/Kolkata",
    language: "en",
    notifications: {
      train_delay_alerts: true,
      disruption_alerts: true,
      maintenance_alerts: false,
      system_updates: true,
      in_app: true,
      email: false,
      sms: false,
    }
  })

  const [accountData, setAccountData] = useState<UserAccount>({
    name: "",
    role: "",
    email: "",
    phone: ""
  })

  // Load user data from localStorage and API on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = JSON.parse(localStorage.getItem("rcd_user") || '{}')
      setUserName(userData.name || "User")
    }
  }, [])

  // Update form data when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setFormData({
        section: preferences.section,
        timezone: preferences.timezone,
        language: preferences.language,
        notifications: preferences.notifications
      })
    }
  }, [preferences])

  // Update account data when account is loaded
  useEffect(() => {
    if (account) {
      setAccountData({
        name: account.name,
        role: account.role,
        email: account.email,
        phone: account.phone
      })
    }
  }, [account])

  // Mutation for saving preferences
  const savePreferencesMutation = useMutation({
    mutationFn: async (data: UserPreferences) => {
      const { data: response } = await api.post("/api/settings/preferences", data)
      return response
    },
    onSuccess: () => {
      toast.success("Settings saved successfully ✅")
      setHasChanges(false)
    },
    onError: () => {
      toast.error("Failed to update settings")
    }
  })

  // Mutation for saving account data
  const saveAccountMutation = useMutation({
    mutationFn: async (data: Partial<UserAccount>) => {
      const { data: response } = await api.post("/api/settings/account", data)
      return response
    },
    onSuccess: () => {
      toast.success("Account updated successfully ✅")
      setHasChanges(false)
    },
    onError: () => {
      toast.error("Failed to update account")
    }
  })

  // Handle form changes
  const handlePreferenceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const handleAccountChange = (field: string, value: string) => {
    setAccountData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  // Save preferences
  const handleSavePreferences = () => {
    savePreferencesMutation.mutate(formData)
  }

  // Save account
  const handleSaveAccount = () => {
    saveAccountMutation.mutate(accountData)
  }

  // Reset changes
  const handleReset = () => {
    setFormData({
      section: "",
      timezone: "Asia/Kolkata",
      language: "en",
      notifications: {
        train_delay_alerts: true,
        disruption_alerts: true,
        maintenance_alerts: false,
        system_updates: true,
        in_app: true,
        email: false,
        sms: false,
      }
    })
    setHasChanges(false)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your preferences, themes, and system configurations
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-muted-foreground">Controller</p>
        </div>
      </motion.div>

      {/* Main Settings Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme & Appearance
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure your section, timezone, and language preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Select
                      value={formData.section}
                      onValueChange={(value) => handlePreferenceChange("section", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections?.map((section) => (
                          <SelectItem key={section.section_id} value={section.section_id}>
                            {section.section_id} {section.description && `- ${section.description}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) => handlePreferenceChange("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => handlePreferenceChange("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="bn">Bengali</SelectItem>
                        <SelectItem value="ta">Tamil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={!hasChanges}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleSavePreferences}
                    disabled={!hasChanges || savePreferencesMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savePreferencesMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your account details and personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={accountData.name}
                      onChange={(e) => handleAccountChange("name", e.target.value)}
                      readOnly
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">Name cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={accountData.role}
                      readOnly
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">Role is assigned by system</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={accountData.email}
                      readOnly
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={accountData.phone}
                      onChange={(e) => handleAccountChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveAccount}
                    disabled={!hasChanges || saveAccountMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveAccountMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about different events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Alert Types</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Train Delay Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified when trains are delayed</p>
                      </div>
                      <Switch
                        checked={formData.notifications.train_delay_alerts}
                        onCheckedChange={(checked) => handleNotificationChange("train_delay_alerts", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Disruption Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified about track disruptions</p>
                      </div>
                      <Switch
                        checked={formData.notifications.disruption_alerts}
                        onCheckedChange={(checked) => handleNotificationChange("disruption_alerts", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Maintenance Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified about scheduled maintenance</p>
                      </div>
                      <Switch
                        checked={formData.notifications.maintenance_alerts}
                        onCheckedChange={(checked) => handleNotificationChange("maintenance_alerts", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>System Updates</Label>
                        <p className="text-sm text-muted-foreground">Get notified about system updates and changes</p>
                      </div>
                      <Switch
                        checked={formData.notifications.system_updates}
                        onCheckedChange={(checked) => handleNotificationChange("system_updates", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Delivery Methods</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>In-App Notifications</Label>
                        <p className="text-sm text-muted-foreground">Show notifications within the application</p>
                      </div>
                      <Switch
                        checked={formData.notifications.in_app}
                        onCheckedChange={(checked) => handleNotificationChange("in_app", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send notifications via email</p>
                      </div>
                      <Switch
                        checked={formData.notifications.email}
                        onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                      </div>
                      <Switch
                        checked={formData.notifications.sms}
                        onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={!hasChanges}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleSavePreferences}
                    disabled={!hasChanges || savePreferencesMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savePreferencesMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme & Appearance Tab */}
          <TabsContent value="theme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme & Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Theme Selection</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        theme === "light" ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => setTheme("light")}
                    >
                      <div className="w-full h-20 bg-white border rounded mb-2"></div>
                      <div className="text-sm font-medium">Light</div>
                      <div className="text-xs text-muted-foreground">Clean and bright interface</div>
                    </div>

                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        theme === "dark" ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => setTheme("dark")}
                    >
                      <div className="w-full h-20 bg-gray-900 border rounded mb-2"></div>
                      <div className="text-sm font-medium">Dark</div>
                      <div className="text-xs text-muted-foreground">Easy on the eyes</div>
                    </div>

                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        theme === "system" ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => setTheme("system")}
                    >
                      <div className="w-full h-20 bg-gradient-to-r from-white to-gray-900 border rounded mb-2"></div>
                      <div className="text-sm font-medium">System</div>
                      <div className="text-xs text-muted-foreground">Follows system preference</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Current Theme</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {theme || "system"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {theme === "light" && "Light theme is active"}
                      {theme === "dark" && "Dark theme is active"}
                      {theme === "system" && "Following system preference"}
                    </span>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Theme Applied</p>
                      <p className="text-xs text-muted-foreground">
                        Your theme preference is automatically saved and will be applied across all devices.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}