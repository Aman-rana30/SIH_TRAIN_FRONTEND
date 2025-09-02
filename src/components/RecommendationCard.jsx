"use client"

import { motion } from "framer-motion"

export default function RecommendationCard({ title, detail, onApply }) {
  return (
    <motion.div className="card card-hover p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-1 text-sm text-slate-400">AI Recommendation</div>
      <div className="text-lg font-semibold">{title}</div>
      {detail && <p className="mt-2 text-sm text-slate-300">{detail}</p>}
      <div className="mt-3">
        <button className="btn btn-primary" onClick={onApply}>
          Apply Order
        </button>
      </div>
    </motion.div>
  )
}
