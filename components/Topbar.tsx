"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  User, 
  LogOut, 
  MapPin,
  Clock,
  Wifi,
  Bell,
  Calendar as CalendarIcon
} from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComp } from "@/components/ui/calendar"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

export default function Topbar() {
  const router = useRouter()
  const qc = useQueryClient()
  const controller = (typeof window !== "undefined" &&
    JSON.parse(localStorage.getItem("rcd_user") || '{"name":"Controller A", "sectionId":""}')) || { name: "Controller A", sectionId: "" }
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("rcd_selected_date") : null
    return stored ? new Date(stored) : undefined
  })
  const [calendarOpen, setCalendarOpen] = useState(false)
  const selectedDateLabel = selectedDate
    ? (() => {
        const y = selectedDate.getFullYear()
        const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
        const d = String(selectedDate.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
      })()
    : undefined

  function logout() {
    localStorage.removeItem("rcd_token")
    localStorage.removeItem("rcd_user")
    router.replace("/login")
  }

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <motion.header 
      className="sticky top-0 z-10 border-b border-border glass-effect"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4">
        {/* Left section - Title and status */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              Controller Sarthi
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wifi className="h-3 w-3" />
              <span>Connected</span>
              <div className="h-1 w-1 rounded-full bg-muted-foreground mx-1" />
              <Clock className="h-3 w-3" />
              <span>{currentTime}</span>
            </div>
          </div>
        </div>

        {/* Right section - Controls and user */}
        <div className="flex items-center gap-3">
          {/* Section badge */}
          {controller.sectionId && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="outline" className="gap-1.5 px-3 py-1">
                <MapPin className="h-3 w-3" />
                <span className="font-medium">Section {controller.sectionId}</span>
              </Badge>
            </motion.div>
          )}

          {/* Calendar (left of notification) */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full p-0 hover:bg-accent"
                aria-label="Select date"
              >
                <CalendarIcon className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="end">
              <CalendarComp
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  setSelectedDate(d)
                  if (d) {
                    localStorage.setItem("rcd_selected_date", d.toISOString())
                  } else {
                    localStorage.removeItem("rcd_selected_date")
                  }
                  // trigger refetch of data to show historical
                  qc.invalidateQueries()
                  // notify listeners in other components (if any)
                  window.dispatchEvent(new StorageEvent('storage', { key: 'rcd_selected_date' }))
                  // close after selecting a date
                  setCalendarOpen(false)
                }}
                initialFocus
                captionLayout="dropdown"
                fromYear={2000}
                toYear={2100}
                numberOfMonths={1}
                className="rounded-md border border-border bg-card"
              />
            </PopoverContent>
          </Popover>
          {/* Selected date shown inside calendar popover only */}

          {/* Notification bell */}
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full p-0 hover:bg-accent"
            onClick={() => {
              const isOpen = Boolean(localStorage.getItem("rcd_show_notifications"))
              if (isOpen) {
                localStorage.removeItem("rcd_show_notifications")
              } else {
                localStorage.setItem("rcd_show_notifications", "1")
              }
              // Fire storage event for same-tab listeners fallback
              window.dispatchEvent(new StorageEvent('storage', { key: 'rcd_show_notifications' }))
            }}
            aria-label="Toggle notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-9 w-9 rounded-full p-0 hover:bg-accent"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {controller.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{controller.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Controller Sarthi
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive" 
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  )
}
