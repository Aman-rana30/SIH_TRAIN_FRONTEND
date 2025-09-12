"use client"

import { type ReactNode, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  

  useEffect(() => {
    const authed = !!localStorage.getItem("rcd_token")
    if (!authed) {
      router.replace("/login?redirect=/dashboard")
    } else {
      setReady(true)
    }
  }, [router])

  if (!ready) return null

  return (
    <div className={`flex h-dvh w-full overflow-hidden ${pathname === "/dashboard" ? "bg-rail-pattern" : ""}`}>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        {/* Footer */}
        <footer className="border-t border-border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-2">
            {/* Right: Theme toggle */}
            <div className="ml-auto flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
