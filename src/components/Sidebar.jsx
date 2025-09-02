"use client"

import { NavLink, useLocation } from "react-router-dom"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/gantt", label: "Gantt", icon: "🗂️" },
  { to: "/map", label: "Map", icon: "🗺️" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
]

export default function Sidebar() {
  const [open, setOpen] = useState(true)
  const { pathname } = useLocation()

  return (
    <aside className="relative h-dvh">
      <div className="sticky left-0 top-0 z-20 h-dvh border-r border-slate-800 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="flex h-16 items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand" />
            {open && <span className="text-lg font-semibold">Railway Ctrl</span>}
          </div>
          <button
            className="btn btn-secondary px-2 py-1"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            {open ? "◀" : "▶"}
          </button>
        </div>

        <nav className="px-2">
          {nav.map((n) => {
            const active = pathname.startsWith(n.to)
            return (
              <NavLink key={n.to} to={n.to}>
                <div
                  className={[
                    "my-1 flex items-center rounded-lg px-2 py-2 transition-colors",
                    active ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/70",
                  ].join(" ")}
                >
                  <span className="mr-2">{n.icon}</span>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        className="text-sm font-medium"
                      >
                        {n.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
