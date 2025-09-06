"use client"

import { motion } from "framer-motion"
import { 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  ArrowRight,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RecommendationCardProps {
  title: string
  detail?: string
  onApply?: () => void
  type?: "recommendation" | "alert" | "insight"
  priority?: "high" | "medium" | "low"
  confidence?: number
  actionLabel?: string
  applied?: boolean
}

export default function RecommendationCard({
  title,
  detail,
  onApply,
  type = "recommendation",
  priority = "medium",
  confidence,
  actionLabel = "Apply",
  applied = false,
}: RecommendationCardProps) {
  const typeStyles = {
    recommendation: "border-primary/20 bg-primary/5 shadow-primary/10",
    alert: "border-destructive/20 bg-destructive/5 shadow-destructive/10",
    insight: "border-info/20 bg-info/5 shadow-info/10"
  }

  const typeIcons = {
    recommendation: <Brain className="h-4 w-4" />,
    alert: <AlertTriangle className="h-4 w-4" />,
    insight: <Zap className="h-4 w-4" />
  }

  const iconBg = {
    recommendation: "bg-primary/10 text-primary",
    alert: "bg-destructive/10 text-destructive", 
    insight: "bg-info/10 text-info"
  }

  const priorityStyles = {
    high: "bg-destructive/10 text-destructive",
    medium: "bg-warning/10 text-warning",
    low: "bg-muted text-muted-foreground"
  }
  return (
    <motion.div
      role="article"
      aria-label={`${type} card: ${title}`}
      tabIndex={0}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card shadow-card transition-all duration-200 p-4",
        "hover:shadow-card-hover hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        typeStyles[type],
        applied && "opacity-60"
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/30 to-transparent opacity-40" />
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconBg[type])}
            aria-hidden="true"
          >
            {typeIcons[type]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 
                className="font-semibold text-foreground leading-tight"
                id={`recommendation-${title.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {title}
              </h3>
              {priority && (
                <span 
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-2xs font-medium",
                    priorityStyles[priority]
                  )}
                  role="status"
                  aria-label={`Priority: ${priority}`}
                >
                  {priority.toUpperCase()}
                </span>
              )}
            </div>
            {detail && (
              <p 
                className="mt-1 text-sm text-muted-foreground leading-relaxed"
                aria-describedby={`recommendation-${title.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {detail}
              </p>
            )}
          </div>
        </div>
        
        {confidence && (
          <div className="flex flex-col items-end gap-1" role="status" aria-label={`Confidence level: ${confidence} percent`}>
            <span className="text-xs text-muted-foreground">Confidence</span>
            <span className="text-sm font-semibold text-foreground">{confidence}%</span>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="mt-4">
        {onApply && !applied ? (
          <motion.button
            onClick={onApply}
            aria-describedby={`recommendation-${title.replace(/\s+/g, '-').toLowerCase()}`}
            aria-label={`${actionLabel || 'Apply'} recommendation`}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              "hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2",
              type === "alert" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive" :
              type === "insight" ? "bg-info text-info-foreground hover:bg-info/90 focus:ring-info" :
              "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md focus:ring-primary"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap className="h-4 w-4" aria-hidden="true" />
            {actionLabel || "Apply"}
          </motion.button>
        ) : applied ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-success/10 py-2 text-sm font-medium text-success" role="status" aria-live="polite">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>Applied successfully</span>
          </div>
        ) : null}
      </div>

      {/* Timestamp indicator */}
      <div className="absolute bottom-2 right-2">
        <Clock className="h-3 w-3 text-muted-foreground/40" />
      </div>
    </motion.div>
  )
}
