"use client"

import { useEffect, useState } from "react"
import { X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Notification {
  id: number
  title: string
  message: string
  link?: string
  createdAt: Date
}

export function NotificationToast() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [visible, setVisible] = useState(false)

  // Mock notification - replace with actual notification system
  useEffect(() => {
    // Simulating receiving a notification
    const timer = setTimeout(() => {
      const mockNotification: Notification = {
        id: 1,
        title: "렌탈 예약 승인",
        message: 'MacBook Pro 16" 예약이 승인되었습니다.',
        link: "/mypage/rentals",
        createdAt: new Date(),
      }
      setNotifications([mockNotification])
      setVisible(true)

      // Auto hide after 5 seconds
      setTimeout(() => setVisible(false), 5000)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!visible || notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Card key={notification.id} className="w-80 shadow-lg border-primary/20">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
                {notification.link && (
                  <a href={notification.link} className="text-xs text-primary hover:underline">
                    자세히 보기 →
                  </a>
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setVisible(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
