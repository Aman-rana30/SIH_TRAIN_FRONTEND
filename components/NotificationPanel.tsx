"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, Train, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Notification {
  id: number
  type: string
  message: string
  trainId: string
  timestamp: string
  data: any
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

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-h-96 overflow-y-auto">
      <div className="bg-card border border-border rounded-lg shadow-lg">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Notifications</span>
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
              {notifications.length}
            </span>
          </div>
          {notifications.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className="p-3 border-b border-border last:border-b-0 hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {notification.type === 'departure' ? (
                        <Train className="h-4 w-4 text-success" />
                      ) : (
                        <Bell className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {notification.data?.delay_minutes > 0 && (
                        <div className="text-xs text-warning mt-1">
                          Departed {notification.data.delay_minutes}min late
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onClearNotification(notification.id)}
                    className="flex-shrink-0 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
