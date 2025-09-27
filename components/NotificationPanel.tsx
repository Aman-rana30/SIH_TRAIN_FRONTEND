"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, Train, Clock, AlertTriangle, CheckCircle2, Brain, Zap, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: number
  type: 'departure' | 'delay' | 'conflict' | 'ai_alert' | 'optimization' | 'disruption' | 'system'
  message: string
  trainId?: string
  timestamp: string
  data: any
  priority: 'low' | 'medium' | 'high' | 'critical'
  aiSuggestion?: string
}

interface NotificationPanelProps {
  notifications: Notification[]
  onClearNotification: (id: number) => void
  onClearAll: () => void
}

export default function NotificationPanel({ 
  notifications, 
  onClearNotification, 
  onClearAll 
}: NotificationPanelProps) {
  if (notifications.length === 0) return null

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'departure':
        return <Train className="h-4 w-4 text-green-600" />
      case 'delay':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'conflict':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'ai_alert':
        return <Brain className="h-4 w-4 text-purple-600" />
      case 'optimization':
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case 'disruption':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'system':
        return <Zap className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4 text-primary" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const criticalNotifications = notifications.filter(n => n.priority === 'critical').length
  const highNotifications = notifications.filter(n => n.priority === 'high').length

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto"
    >
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="h-5 w-5 text-primary" />
              {(criticalNotifications > 0 || highNotifications > 0) && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <span className="text-sm font-semibold">AI Alerts & Notifications</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {notifications.length} total
                </Badge>
                {criticalNotifications > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {criticalNotifications} critical
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {notifications.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs hover:bg-red-100 hover:text-red-700"
            >
              Clear All
            </Button>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className={`p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors ${
                  notification.priority === 'critical' ? 'bg-red-50/50' : 
                  notification.priority === 'high' ? 'bg-orange-50/50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">
                          {notification.message}
                        </p>
                        <Badge className={`${getPriorityColor(notification.priority)} text-xs`}>
                          {notification.priority}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </span>
                        {notification.trainId && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {notification.trainId}
                            </span>
                          </>
                        )}
                      </div>

                      {notification.data?.delay_minutes > 0 && (
                        <div className="text-xs text-yellow-600 mb-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Departed {notification.data.delay_minutes}min late
                        </div>
                      )}

                      {notification.aiSuggestion && (
                        <div className="mt-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="flex items-start gap-2">
                            <Brain className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-blue-800">AI Suggestion</p>
                              <p className="text-xs text-blue-700">{notification.aiSuggestion}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {notification.type === 'optimization' && notification.data?.improvement && (
                        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {notification.data.improvement} improvement expected
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onClearNotification(notification.id)}
                    className="flex-shrink-0 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer with quick actions */}
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>AI-powered alerts</span>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
