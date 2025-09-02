"use client"

import { useEffect, useRef, useState } from "react"
import { toWsUrl } from "@/lib/ws"

export function useWebSocket(path = "/ws/updates") {
  const [data, setData] = useState<any>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    const url = toWsUrl(path)
    function connect() {
      try {
        wsRef.current = new WebSocket(url)
        wsRef.current.onmessage = (evt) => {
          try {
            const payload = JSON.parse(evt.data)
            setData(payload)
          } catch {}
        }
        wsRef.current.onclose = () => {
          timerRef.current = setTimeout(connect, 2000)
        }
        wsRef.current.onerror = () => {
          wsRef.current?.close()
        }
      } catch {
        timerRef.current = setTimeout(connect, 2000)
      }
    }
    connect()
    return () => {
      clearTimeout(timerRef.current)
      wsRef.current?.close()
    }
  }, [path])

  return data
}
