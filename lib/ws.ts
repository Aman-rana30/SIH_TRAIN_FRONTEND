"use client"

export function toWsUrl(path: string) {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env as any).VITE_API_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  try {
    const u = new URL(base)
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:"
    u.pathname = path.startsWith("/") ? path : `/${path}`
    return u.toString()
  } catch {
    const secure = String(base).startsWith("https")
    const host = String(base).replace(/^https?:\/\//, "")
    return `${secure ? "wss" : "ws"}://${host}${path.startsWith("/") ? path : `/${path}`}`
  }
}
