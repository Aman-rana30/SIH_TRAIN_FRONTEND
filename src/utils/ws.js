const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

export function toWsUrl(path) {
  // path like "/ws/live-updates"
  try {
    const u = new URL(API_BASE_URL)
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:"
    u.pathname = path.startsWith("/") ? path : `/${path}`
    return u.toString()
  } catch {
    const isSecure = API_BASE_URL.startsWith("https")
    return `${isSecure ? "wss" : "ws"}://${API_BASE_URL.replace(/^https?:\/\//, "")}${path.startsWith("/") ? path : `/${path}`}`
  }
}
