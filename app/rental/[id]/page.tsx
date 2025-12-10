"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Package, MapPin, Phone, CheckCircle, Clock } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function RentalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const rental = {
    id: Number.parseInt(id),
    productName: 'MacBook Pro 16" M3',
    productImage: "/macbook-pro-laptop.png",
    category: "Laptop",
    startDate: "2025-12-15",
    endDate: "2025-12-20",
    status: "RENTING",
    statusText: "렌탈 중",
    pricePerDay: 25000,
    totalAmount: 125000,
    deposit: 500000,
    seller: {
      name: "테크렌탈샵",
      phone: "010-1234-5678",
      location: "서울 강남구",
    },
    createdAt: "2025-12-10 14:30",
    deliveryAddress: "서울시 강남구 테헤란로 123",
    deliveryStatus: "배송 중",
  }

  const rentalDays = Math.ceil(
    (new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <Link
          href="/mypage"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          마이페이지로 돌아가기
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">렌탈 상세</h1>
              <p className="text-muted-foreground text-lg">주문번호: #{rental.id}</p>
            </div>
            <Badge
              variant={rental.status === "RENTING" ? "default" : "secondary"}
              className="text-lg px-4 py-2 rounded-full"
            >
              {rental.statusText}
            </Badge>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={rental.productImage || "/placeholder.svg"}
                      alt={rental.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Badge className="mb-2 rounded-full">{rental.category}</Badge>
                    <h3 className="text-2xl font-bold mb-2">{rental.productName}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>₩{rental.pricePerDay.toLocaleString()}/일</span>
                      <span>•</span>
                      <span>{rentalDays}일 대여</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    대여 기간
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">시작일</p>
                    <p className="text-lg font-semibold">{rental.startDate}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">종료일</p>
                    <p className="text-lg font-semibold">{rental.endDate}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">총 대여 기간</p>
                    <p className="text-lg font-semibold">{rentalDays}일</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    배송 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">배송 상태</p>
                    <Badge variant="secondary" className="rounded-full">
                      <Clock className="h-3 w-3 mr-1" />
                      {rental.deliveryStatus}
                    </Badge>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">배송지</p>
                    <p className="text-sm font-medium">{rental.deliveryAddress}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>판매자 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{rental.seller.name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{rental.seller.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{rental.seller.phone}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-xl bg-transparent">
                    판매자 문의
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>결제 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">렌탈 금액</span>
                  <span className="font-medium">
                    ₩{rental.pricePerDay.toLocaleString()} x {rentalDays}일
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">예치금</span>
                  <span className="font-medium">₩{rental.deposit.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>총 결제 금액</span>
                  <span className="text-primary">₩{rental.totalAmount.toLocaleString()}</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-4">
                  <p className="text-sm text-blue-900 leading-relaxed">
                    💡 예치금은 상품 반납 후 검수 완료 시 전액 환불됩니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            {rental.status === "RENTING" && (
              <Card className="rounded-2xl shadow-lg border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold text-lg">반납 준비가 되셨나요?</p>
                      <p className="text-sm text-muted-foreground">반납 신청 후 배송 또는 직접 반납이 가능합니다</p>
                    </div>
                  </div>
                  <Button className="w-full h-12 rounded-xl text-lg">반납 신청하기</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
