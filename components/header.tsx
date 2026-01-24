"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Menu, X, User, Bell, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { getUserRoleFromToken } from "@/lib/utils"
import { useNotifications } from "@/hooks/use-notifications"

export function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSeller, setIsSeller] = useState(false)
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } = useNotifications()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken")
      setIsLoggedIn(!!token)

      if (token) {
        const role = getUserRoleFromToken()
        setIsSeller(role === "SELLER")
      }
    }
  }, [])

  return (
    <header className={`border-b bg-white sticky top-0 z-50`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            Modi
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/products" className="hover:text-primary transition-colors">
              전체상품
            </Link>
            <Link href="/recommendations" className="hover:text-primary transition-colors flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              AI 추천
            </Link>
            <Link href="/seller" className="hover:text-primary transition-colors">
              판매자
            </Link>
            <Link href="/how-it-works" className="hover:text-primary transition-colors">
              이용 방법
            </Link>
            <Link href="/notices" className="hover:text-primary transition-colors">
              공지사항
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
                      <div className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">알림이 없습니다</p>
                        {isConnected && (
                          <p className="text-xs text-green-600 mt-2">실시간 알림 연결됨</p>
                        )}
                      </div>
                    ) : (
                      <div className="py-2">
                        {notifications.map((notification) => (
                          <div key={notification.id}>
                            {notification.link ? (
                              <Link
                                href={notification.link}
                                className={`block w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
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
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(notification.createdAt).toLocaleString("ko-KR")}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            ) : (
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
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(notification.createdAt).toLocaleString("ko-KR")}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            )}
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
              <Link href="/recommendations" className="hover:text-primary transition-colors py-2 flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                AI 추천
              </Link>
              <Link href="/seller" className="hover:text-primary transition-colors py-2">
                판매자
              </Link>
              <Link href="/how-it-works" className="hover:text-primary transition-colors py-2">
                이용 방법
              </Link>
              <Link href="/notices" className="hover:text-primary transition-colors py-2">
                공지사항
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
