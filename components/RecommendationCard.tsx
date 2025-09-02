"use client"

import { motion } from "framer-motion"

export default function RecommendationCard({
  title,
  detail,
  onApply,
}: {
  title: string
  detail?: string
  onApply?: () => void
}) {
  return (
    <motion.div
      className="rounded-2xl border border-border bg-card p-4 shadow-lg"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-1 text-sm text-muted-foreground">AI Recommendation</div>
      <div className="text-lg font-semibold">{title}</div>
      {detail && <p className="mt-2 text-sm text-muted-foreground">{detail}</p>}
      <div className="mt-3">
        <button
          className="inline-flex items-center rounded-md bg-[hsl(var(--chart-2))] px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          onClick={onApply}
        >
          Apply Order
        </button>
      </div>
    </motion.div>
  )
}
