"use client"

interface WsUrlOptions {
  query?: Record<string, string>;
}

export function toWsUrl(path: string, options: WsUrlOptions = {}) {
  // Prefer explicit WS base if provided
  const explicitWsBase = process.env.NEXT_PUBLIC_WS_BASE_URL || (process.env as any).VITE_WS_BASE_URL

  const base =
    explicitWsBase ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env as any).VITE_API_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  
  try {
    const u = new URL(base)
    // If explicit WS base provided, keep its protocol; otherwise, derive from HTTP(S)
    if (!explicitWsBase) {
      u.protocol = u.protocol === "https:" ? "wss:" : "ws:"
    }
    u.pathname = path.startsWith("/") ? path : `/${path}`
    
    // Add query parameters if provided
    if (options.query) {
      Object.entries(options.query).forEach(([key, value]) => {
        if (value) {
          u.searchParams.append(key, value);
        }
      });
    }
    
    return u.toString()
  } catch {
    const secure = String(base).startsWith("https") || String(base).startsWith("wss")
    const host = String(base).replace(/^(https?|wss?):\/\//, "")
    let url = `${secure ? (String(base).startsWith("wss") ? "wss" : "wss") : (String(base).startsWith("ws") ? "ws" : "ws")}://${host}${path.startsWith("/") ? path : `/${path}`}`
    
    // Add query parameters the manual way if URL parsing failed
    if (options.query) {
      const queryString = Object.entries(options.query)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    
    return url;
  }
}
