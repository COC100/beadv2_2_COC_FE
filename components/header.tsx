"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
            <Link href="/become-seller" className="hover:text-primary transition-colors">
              판매자 등록
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

            <Link href="/mypage" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="rounded-lg">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="rounded-lg">
                로그인
              </Button>
            </Link>

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
              <Link href="/become-seller" className="hover:text-primary transition-colors py-2">
                판매자 등록
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
