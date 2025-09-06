"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string | number
  badge?: ReactNode
  children?: ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  status?: "success" | "warning" | "error" | "neutral"
  icon?: ReactNode
  loading?: boolean
}

export default function KpiCard({
  title,
  value,
  badge,
  children,
  trend,
  trendValue,
  status = "neutral",
  icon,
  loading = false,
}: KpiCardProps) {
  const statusStyles = {
    success: "border-success/20 bg-success/5 shadow-success/10",
    warning: "border-warning/20 bg-warning/5 shadow-warning/10", 
    error: "border-destructive/20 bg-destructive/5 shadow-destructive/10",
    neutral: "border-border bg-card"
  }

  const iconBg = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-destructive/10 text-destructive", 
    neutral: "bg-primary/10 text-primary"
  }

  const trendBg = {
    up: "bg-success/10 text-success",
    down: "bg-destructive/10 text-destructive",
    neutral: "bg-muted text-muted-foreground"
  }

  const trendColor = {
    up: "text-success",
    down: "text-destructive", 
    neutral: "text-muted-foreground"
  }

  return (
    <motion.div
      role="region"
      aria-label={`${title} KPI card`}
      tabIndex={0}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-200 p-6",
        "hover:shadow-card-hover hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        statusStyles[status]
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-transparent opacity-50" />
      
      {/* Header */}
      <div className="relative mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <div 
              className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconBg[status])}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-muted-foreground" id={`${title.replace(/\s+/g, '-').toLowerCase()}-title`}>
              {title}
            </div>
            {loading && (
              <div className="mt-1 h-2 w-16 animate-pulse rounded bg-muted" aria-label="Loading..." />
            )}
          </div>
        </div>
        {badge && (
          <div className="flex-shrink-0" role="status" aria-label={`Status: ${badge}`}>
            {badge}
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-3">
        {loading ? (
          <div className="h-8 w-20 animate-pulse rounded bg-muted" aria-label="Loading value..." />
        ) : (
          <div 
            className="text-3xl font-bold text-foreground"
            aria-describedby={`${title.replace(/\s+/g, '-').toLowerCase()}-title`}
          >
            {value}
          </div>
        )}
      </div>

      {/* Trend Indicator */}
      {trend && trend !== "neutral" && (
        <div className="mb-3 flex items-center gap-2" role="status" aria-label={`Trend: ${trend === 'up' ? 'increasing' : 'decreasing'}`}>
          <div className={cn("flex h-6 w-6 items-center justify-center rounded-full", trendBg[trend])} aria-hidden="true">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
          </div>
          {trendValue && (
            <span className={cn("text-sm font-medium", trendColor[trend])}>
              {trendValue}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {children && (
        <div className="relative">
          {children}
        </div>
      )}

      {/* Status indicator */}
      {status !== "neutral" && (
        <div className="absolute right-4 top-4">
          <div className={cn(
            "flex h-2 w-2 rounded-full",
            status === "success" ? "bg-success animate-pulse-subtle" :
            status === "warning" ? "bg-warning animate-pulse-subtle" :
            status === "error" ? "bg-destructive animate-pulse-subtle" :
            "bg-muted"
          )} />
        </div>
      )}
    </motion.div>
  )
}
