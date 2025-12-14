"use client"

import { useState } from "react"
import Link from "next/link"
import { User, Wallet, Settings, LogOut, MapPin } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function MyPage() {
  const [balance] = useState(150000)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">마이페이지</h1>
          <p className="text-muted-foreground text-lg">회원 정보를 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="font-semibold text-xl">홍길동</h3>
                  <p className="text-sm text-muted-foreground mt-1">user@example.com</p>
                </div>

                <div className="space-y-2">
                  <Link href="/mypage/addresses">
                    <Button variant="ghost" className="w-full justify-start rounded-xl">
                      <MapPin className="h-4 w-4 mr-2" />
                      주소지 관리
                    </Button>
                  </Link>
                  <Link href="/mypage/settings">
                    <Button variant="ghost" className="w-full justify-start rounded-xl">
                      <Settings className="h-4 w-4 mr-2" />
                      설정
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive rounded-xl"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Balance Card */}
            <Card className="mb-6 bg-gradient-to-br from-primary to-accent text-white rounded-2xl shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-2">예치금 잔액</p>
                    <p className="text-5xl font-bold">₩{balance.toLocaleString()}</p>
                  </div>
                  <Wallet className="h-16 w-16 opacity-30" />
                </div>
                <div className="mt-8">
                  <Link href="/deposit" className="block">
                    <Button variant="secondary" className="w-full h-12 rounded-xl">
                      충전하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/mypage/rentals">
                <Card className="rounded-2xl hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">렌탈 내역</h3>
                    <p className="text-sm text-muted-foreground">렌탈 현황과 내역을 확인하세요</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/mypage/addresses">
                <Card className="rounded-2xl hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">주소지 관리</h3>
                    <p className="text-sm text-muted-foreground">배송 주소를 관리하세요</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
