"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Menu, X, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getUserRoleFromToken } from "@/lib/utils"

export function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSeller, setIsSeller] = useState(false)

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

  const handleSellerClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    router.push("/seller")
  }

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
            <Link href="/seller" onClick={handleSellerClick} className="hover:text-primary transition-colors">
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
              <Link href="/seller" onClick={handleSellerClick} className="hover:text-primary transition-colors py-2">
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
