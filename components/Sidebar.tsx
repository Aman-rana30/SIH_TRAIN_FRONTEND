"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/gantt", label: "Gantt", icon: "🗂️" },
  { href: "/map", label: "Map", icon: "🗺️" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
]

export default function Sidebar() {
  const [open, setOpen] = useState(true)
  const pathname = usePathname()

  return (
    <aside className="relative h-dvh">
      <div className="sticky left-0 top-0 z-20 h-dvh border-r border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[hsl(var(--chart-2))]" />
            {open && <span className="text-lg font-semibold">Railway Ctrl</span>}
          </div>
          <button
            className="rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground/90"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            {open ? "◀" : "▶"}
          </button>
        </div>

        <nav className="px-2">
          {nav.map((n) => {
            const active = pathname.startsWith(n.href)
            return (
              <Link key={n.href} href={n.href}>
                <div
                  className={[
                    "my-1 flex items-center rounded-lg px-2 py-2 transition-colors",
                    active ? "bg-card text-foreground" : "text-foreground/70 hover:bg-muted/50",
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
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
