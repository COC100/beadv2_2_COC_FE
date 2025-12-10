"use client"

import { useState } from "react"
import Link from "next/link"
import { User, Wallet, Package, Settings, LogOut } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function MyPage() {
  const [balance] = useState(150000)

  const rentals = [
    {
      id: 1,
      productName: 'MacBook Pro 16" M3',
      startDate: "2025-12-15",
      endDate: "2025-12-20",
      status: "RENTING",
      statusText: "렌탈 중",
      amount: 125000,
      seller: "테크렌탈샵",
    },
    {
      id: 2,
      productName: "Sony A7 IV Camera",
      startDate: "2025-11-20",
      endDate: "2025-11-25",
      status: "COMPLETED",
      statusText: "반납 완료",
      amount: 175000,
      seller: "프로카메라",
    },
  ]

  const transactions = [
    {
      id: 1,
      type: "DEPOSIT_CHARGE",
      typeText: "예치금 충전",
      amount: 200000,
      balance: 150000,
      createdAt: "2025-12-10 14:30",
    },
    {
      id: 2,
      type: "RENTAL_PAYMENT",
      typeText: "렌탈 결제",
      amount: -125000,
      balance: 125000,
      createdAt: "2025-12-15 10:00",
    },
    {
      id: 3,
      type: "RENTAL_REFUND",
      typeText: "반납 환불",
      amount: 75000,
      balance: 275000,
      createdAt: "2025-11-25 16:20",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">마이페이지</h1>
          <p className="text-muted-foreground text-lg">렌탈 내역과 예치금을 관리하세요</p>
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
                  <Button variant="ghost" className="w-full justify-start rounded-xl">
                    <Package className="h-4 w-4 mr-2" />
                    렌탈 내역
                  </Button>
                  <Button variant="ghost" className="w-full justify-start rounded-xl">
                    <Wallet className="h-4 w-4 mr-2" />
                    예치금 관리
                  </Button>
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

            <Tabs defaultValue="rentals" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 rounded-xl">
                <TabsTrigger value="rentals" className="rounded-xl">
                  렌탈 내역
                </TabsTrigger>
                <TabsTrigger value="transactions" className="rounded-xl">
                  거래 내역
                </TabsTrigger>
              </TabsList>

              <TabsContent value="rentals" className="space-y-4">
                {rentals.map((rental) => (
                  <Card key={rental.id} className="rounded-2xl">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{rental.productName}</CardTitle>
                          <CardDescription className="mt-1">{rental.seller}</CardDescription>
                        </div>
                        <Badge variant={rental.status === "RENTING" ? "default" : "secondary"} className="rounded-full">
                          {rental.statusText}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">대여 기간</span>
                          <span className="font-medium">
                            {rental.startDate} ~ {rental.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">렌탈 금액</span>
                          <span className="font-bold text-primary text-lg">₩{rental.amount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl bg-transparent">
                          상세보기
                        </Button>
                        {rental.status === "RENTING" && (
                          <Button size="sm" className="flex-1 rounded-xl">
                            반납 신청
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <Card className="rounded-2xl">
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="p-6 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-lg">{tx.typeText}</p>
                              <p className="text-sm text-muted-foreground mt-1">{tx.createdAt}</p>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-bold text-2xl ${tx.amount > 0 ? "text-emerald-600" : "text-primary"}`}
                              >
                                {tx.amount > 0 ? "+" : ""}₩{Math.abs(tx.amount).toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">잔액: ₩{tx.balance.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
