"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const authed = !!localStorage.getItem("rcd_token")
    router.replace(authed ? "/dashboard" : "/login?redirect=/dashboard")
  }, [router])

  return null
}