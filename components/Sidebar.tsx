"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, 
  Calendar, 
  Map, 
  Settings, 
  Train,
  ChevronLeft,
  X,
  BarChart3,
  AlertTriangle,
  FileText,
  Shield,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

const getNavItems = (userRole: string) => {
  const baseItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/trains", label: "Train Status", icon: Train },
    { href: "/optimization", label: "Optimization", icon: BarChart3 },
    { href: "/digital-twin", label: "Simulation", icon: Map },
    { href: "/disruptions", label: "Disruptions", icon: AlertTriangle },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/map", label: "Digital Twin", icon: Activity },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  // Add admin panel for admin users
  if (userRole === "admin") {
    baseItems.splice(1, 0, { href: "/admin", label: "Admin Panel", icon: Shield })
  }

  return baseItems
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()
  
  // Get user role for navigation
  const userData = typeof window !== "undefined" ? 
    JSON.parse(localStorage.getItem("rcd_user") || '{"role": "controller"}') : 
    { role: "controller" }
  const navItems = getNavItems(userData.role)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <motion.aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70 border-r border-border/60 shadow-lg transition-all duration-300",
          "lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ width: isOpen ? "280px" : "80px" }}
        animate={{ width: isOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Toggle Button - Hidden on mobile, visible on desktop */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-6 z-10 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft 
            className={cn(
              "h-3 w-3 transition-transform duration-300",
              !isOpen && "rotate-180"
            )} 
          />
        </motion.button>
        
        {/* Mobile close button */}
        <motion.button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 z-10 flex lg:hidden h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="h-4 w-4" />
        </motion.button>

        {/* Header */}
        <div className="flex h-16 items-center border-b border-border/60 px-4">
          <motion.div 
            className="flex items-center gap-3 w-full"
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.2, delay: isOpen ? 0.1 : 0 }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary flex-shrink-0">
              <Train className="h-5 w-5 text-primary-foreground" />
            </div>
            {isOpen && (
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-foreground truncate">Sarthi</h1>
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 lg:p-4 lg:space-y-2">
          {navItems.map((item) => (
            <motion.div key={item.href} layout>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  "hover:bg-primary/10 hover:text-foreground touch-manipulation",
                  "min-h-[44px] lg:min-h-[40px]", // Larger touch targets on mobile
                  pathname === item.href
                    ? "bg-primary/15 text-foreground shadow-sm ring-1 ring-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    setIsOpen(false)
                  }
                }}
              >
                <item.icon className="h-4 w-4 flex-shrink-0 text-primary" />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Active indicator */}
                {pathname === item.href && (
                  <motion.div
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                    layoutId="activeIndicator"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/60 p-3 lg:p-4">
          <motion.div
            className="flex items-center gap-3"
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.2, delay: isOpen ? 0.1 : 0 }}
          >
            <div className="flex h-2 w-2 items-center justify-center flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse-subtle" />
            </div>
            {isOpen && (
              <div className="text-xs text-muted-foreground min-w-0 flex-1">
                <div className="font-medium text-foreground truncate">System Online</div>
                <div className="truncate">All services operational</div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.aside>
    </>
  )
}
