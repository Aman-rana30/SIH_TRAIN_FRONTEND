"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { toWsUrl } from "@/lib/ws"

export function useWebSocket(path = "/ws/updates") {
  const [data, setData] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    // Get sectionId from localStorage
    const userData = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem("rcd_user") || '{}')
      : {};
    const sectionId = userData?.sectionId;
    
    if (!sectionId) {
      console.warn('No sectionId found in localStorage for WebSocket connection');
      return;
    }
    
    const url = toWsUrl(path, {
      query: { section_id: sectionId }
    })
    function connect() {
      try {
        wsRef.current = new WebSocket(url)
        wsRef.current.onopen = () => {
          // Optional: log successful connection for debugging
          if (process.env.NODE_ENV !== 'production') {
            console.log('[WS] connected:', url)
          }
        }
        wsRef.current.onmessage = (evt) => {
          try {
            const payload = JSON.parse(evt.data)
            setData(payload)
            
            // Handle departure notifications
            if (payload.type === 'train_departure') {
              const notification = {
                id: Date.now(),
                type: 'departure',
                message: payload.data.message,
                trainId: payload.data.train_id,
                timestamp: payload.timestamp,
                data: payload.data
              }
              setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep last 10 notifications
            }
          } catch {}
        }
        wsRef.current.onclose = (evt) => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[WS] closed:', { code: evt.code, reason: evt.reason })
          }
          timerRef.current = setTimeout(connect, 2000)
        }
        wsRef.current.onerror = (evt) => {
          if (process.env.NODE_ENV !== 'production') {
            console.error('[WS] error:', evt)
          }
          wsRef.current?.close()
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[WS] connect error:', e)
        }
        timerRef.current = setTimeout(connect, 2000)
      }
    }
    connect()
    return () => {
      clearTimeout(timerRef.current)
      wsRef.current?.close()
    }
  }, [path])

  const clearNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return { 
    data, 
    notifications, 
    clearNotification, 
    clearAllNotifications 
  }
}
