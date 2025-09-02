"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

export default function KpiCard({
  title,
  value,
  badge,
  children,
}: {
  title: string
  value: string | number
  badge?: ReactNode
  children?: ReactNode
}) {
  return (
    <motion.div
      className="rounded-2xl border border-border bg-card p-4 shadow-lg"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{title}</div>
        {badge}
      </div>
      <div className="mb-3 text-3xl font-bold">{value}</div>
      {children}
    </motion.div>
  )
}
