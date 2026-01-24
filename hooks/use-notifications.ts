"use client"

import { useEffect, useState, useCallback, useRef } from "react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export interface Notification {
  id: number
  title: string
  message: string
  link?: string
  type: "rental" | "payment" | "system" | "review" | "settlement"
  createdAt: string
  isRead: boolean
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  const connect = useCallback(() => {
    if (typeof window === "undefined") return

    const token = localStorage.getItem("accessToken")
    if (!token) {
      console.log("[v0] No token available for notification stream")
      return
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const url = `${API_BASE_URL}/support-service/api/notifications/stream`
      console.log("[v0] Connecting to notification stream:", url)

      // EventSource doesn't support custom headers, so we use a query parameter workaround
      // Or use a polyfill that supports headers
      const urlWithAuth = `${url}?token=${encodeURIComponent(token)}`
      
      const eventSource = new EventSource(urlWithAuth)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log("[v0] Notification stream connected")
        setIsConnected(true)
      }

      eventSource.onmessage = (event) => {
        console.log("[v0] Notification received:", event.data)
        try {
          const notification = JSON.parse(event.data)
          setNotifications((prev) => [
            {
              ...notification,
              isRead: false,
              id: notification.id || Date.now(),
            },
            ...prev,
          ])
        } catch (error) {
          console.error("[v0] Failed to parse notification:", error)
        }
      }

      eventSource.onerror = (error) => {
        console.error("[v0] Notification stream error:", error)
        setIsConnected(false)
        eventSource.close()

        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("[v0] Attempting to reconnect notification stream")
          connect()
        }, 5000)
      }
    } catch (error) {
      console.error("[v0] Failed to connect to notification stream:", error)
      setIsConnected(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log("[v0] Disconnecting notification stream")
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    setIsConnected(false)
  }, [])

  const markAsRead = useCallback((id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return {
    notifications,
    isConnected,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    connect,
    disconnect,
  }
}
