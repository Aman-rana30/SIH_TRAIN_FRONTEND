"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  User, 
  LogOut, 
  MapPin,
  Clock,
  Wifi
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

export default function Topbar() {
  const router = useRouter()
  const controller = (typeof window !== "undefined" &&
    JSON.parse(localStorage.getItem("rcd_user") || '{"name":"Controller A", "sectionId":""}')) || { name: "Controller A", sectionId: "" }

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
            <h1 className="text-lg font-bold text-foreground">Controller Sarthi Dashboard</h1>
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
