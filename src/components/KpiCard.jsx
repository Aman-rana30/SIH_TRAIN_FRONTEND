"use client"

import { motion } from "framer-motion"

export default function KpiCard({ title, value, badge, children }) {
  return (
    <motion.div className="card card-hover p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-slate-300">{title}</div>
        {badge}
      </div>
      <div className="mb-3 text-3xl font-bold text-white">{value}</div>
      {children}
    </motion.div>
  )
}
