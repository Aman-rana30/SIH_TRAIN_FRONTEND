"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [name, setName] = useState("")
  const [sectionId, setSectionId] = useState("")
  const router = useRouter()
  const search = useSearchParams()
  const redirectTo = search.get("redirect") || "/dashboard"

  function login(e: React.FormEvent) {
    e.preventDefault()
    if (!sectionId) {
      alert("Please enter a Section ID")
      return
    }
    localStorage.setItem("rcd_token", "mock-token")
    localStorage.setItem("rcd_user", JSON.stringify({ 
      name: name || "Controller A",
      sectionId: sectionId
    }))
    router.replace(redirectTo)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-[hsl(var(--chart-2))]" />
          <h2 className="text-xl font-semibold"> Controller Sarthi Login</h2>
          <p className="text-sm text-muted-foreground">Mock login for demo</p>
        </div>
        <form onSubmit={login} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Controller Name</label>
            <input
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 outline-none ring-offset-background focus:ring-2 focus:ring-[hsl(var(--chart-2))]"
              placeholder="e.g., Alice K."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Section ID</label>
            <input
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 outline-none ring-offset-background focus:ring-2 focus:ring-[hsl(var(--chart-2))]"
              placeholder="e.g., JUC-LDH"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-[hsl(var(--chart-2))] px-4 py-2 font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}
