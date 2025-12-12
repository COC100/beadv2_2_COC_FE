"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Plus } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function ReservationPage() {
  const [selectedAddressId, setSelectedAddressId] = useState<number>(1)

  // Mock data
  const addresses = [
    {
      id: 1,
      name: "집",
      address: "서울특별시 강남구 테헤란로 123",
      detailAddress: "삼성빌딩 402호",
      phone: "010-1234-5678",
      isDefault: true,
    },
    {
      id: 2,
      name: "회사",
      address: "서울특별시 서초구 서초대로 456",
      detailAddress: "7층",
      phone: "010-1234-5678",
      isDefault: false,
    },
  ]

  const cartItems = [
    {
      id: 1,
      productName: 'MacBook Pro 16" M3',
      pricePerDay: 25000,
      startDate: "2025-01-15",
      endDate: "2025-01-20",
      days: 5,
      total: 125000,
    },
    {
      id: 2,
      productName: "Sony A7 IV 미러리스",
      pricePerDay: 35000,
      startDate: "2025-01-18",
      endDate: "2025-01-22",
      days: 4,
      total: 140000,
    },
  ]

  const totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          장바구니로
        </Link>

        <h1 className="text-3xl font-bold mb-8">렌탈 예약</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    배송 주소
                  </h2>
                  <Link href="/mypage/addresses">
                    <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                      <Plus className="h-4 w-4 mr-1" />
                      주소 추가
                    </Button>
                  </Link>
                </div>

                <RadioGroup
                  value={selectedAddressId.toString()}
                  onValueChange={(value) => setSelectedAddressId(Number.parseInt(value))}
                >
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <Card key={addr.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <RadioGroupItem value={addr.id.toString()} id={`address-${addr.id}`} className="mt-1" />
                            <Label htmlFor={`address-${addr.id}`} className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">{addr.name}</span>
                                {addr.isDefault && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    기본 배송지
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{addr.address}</p>
                              <p className="text-sm text-muted-foreground mb-1">{addr.detailAddress}</p>
                              <p className="text-sm text-muted-foreground">{addr.phone}</p>
                            </Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">주문 상품</h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-0">
                      <div>
                        <p className="font-semibold mb-1">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.startDate} ~ {item.endDate} ({item.days}일)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.pricePerDay.toLocaleString()}원 x {item.days}일
                        </p>
                      </div>
                      <p className="font-bold text-primary">₩{item.total.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">결제 정보</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">상품 금액</span>
                    <span className="font-medium">₩{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">배송비</span>
                    <span className="font-medium">무료</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-bold text-lg mb-6">
                  <span>총 결제 금액</span>
                  <span className="text-primary text-xl">₩{totalAmount.toLocaleString()}</span>
                </div>

                <Button className="w-full h-11 rounded-lg" size="lg">
                  예약 신청하기
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">예약 신청 후 판매자 승인이 필요합니다</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
