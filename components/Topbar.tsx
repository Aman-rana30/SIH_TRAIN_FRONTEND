"use client"

import { useRouter } from "next/navigation"

export default function Topbar() {
  const router = useRouter()
  const controller = (typeof window !== "undefined" &&
    JSON.parse(localStorage.getItem("rcd_user") || '{"name":"Controller A", "sectionId":""}')) || { name: "Controller A", sectionId: "" }

  function logout() {
    localStorage.removeItem("rcd_token")
    localStorage.removeItem("rcd_user")
    router.replace("/login")
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4">
        <h1 className="text-pretty text-lg font-semibold">Railway Controller’s Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
            <div>
              Signed in as <span className="font-medium text-foreground">{controller.name}</span>
            </div>
            {controller.sectionId && (
              <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs">
                <span className="text-muted-foreground">Section:</span>
                <span className="font-medium text-foreground">{controller.sectionId}</span>
              </div>
            )}
          </div>
          <button
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground/90 hover:bg-muted/50"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
