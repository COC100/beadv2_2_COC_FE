"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Menu, X, User, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface Notification {
  id: number
  title: string
  message: string
  time: string
  isRead: boolean
  type: "rental" | "payment" | "system"
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "렌탈 신청 승인",
      message: "MacBook Pro 16' M3 렌탈이 승인되었습니다.",
      time: "5분 전",
      isRead: false,
      type: "rental",
    },
    {
      id: 2,
      title: "예치금 충전 완료",
      message: "50,000원이 충전되었습니다.",
      time: "1시간 전",
      isRead: false,
      type: "payment",
    },
    {
      id: 3,
      title: "반납 기한 안내",
      message: "Sony A7 IV 미러리스 반납 기한이 3일 남았습니다.",
      time: "2시간 전",
      isRead: true,
      type: "rental",
    },
  ])

  const isLoggedIn = true
  const isSeller = false
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            Modi
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/products" className="hover:text-primary transition-colors">
              전체상품
            </Link>
            <Link href={isSeller ? "/seller" : "/become-seller"} className="hover:text-primary transition-colors">
              판매자
            </Link>
            <Link href="/how-it-works" className="hover:text-primary transition-colors">
              이용 방법
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="rounded-lg">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>

            {isLoggedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-4 py-3">
                    <h3 className="font-semibold">알림</h3>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                        모두 읽음
                      </Button>
                    )}
                  </div>
                  <Separator />
                  <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm text-muted-foreground">알림이 없습니다</div>
                    ) : (
                      <div className="py-2">
                        {notifications.map((notification) => (
                          <div key={notification.id}>
                            <button
                              className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                                !notification.isRead ? "bg-blue-50/50" : ""
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-sm">{notification.title}</p>
                                    {!notification.isRead && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                                </div>
                              </div>
                            </button>
                            <Separator />
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Link href="/mypage" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="rounded-lg">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            {!isLoggedIn && (
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="rounded-lg">
                  로그인
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col gap-3">
              <Link href="/products" className="hover:text-primary transition-colors py-2">
                전체상품
              </Link>
              <Link
                href={isSeller ? "/seller" : "/become-seller"}
                className="hover:text-primary transition-colors py-2"
              >
                판매자
              </Link>
              <Link href="/how-it-works" className="hover:text-primary transition-colors py-2">
                이용 방법
              </Link>
              <Link href="/mypage" className="hover:text-primary transition-colors py-2">
                마이페이지
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
