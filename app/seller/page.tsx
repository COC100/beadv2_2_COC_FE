"use client"
import Link from "next/link"
import { Plus, Package, Clock, DollarSign, Edit, Check, X } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SellerPage() {
  // Mock data
  const products = [
    {
      id: 1,
      name: 'MacBook Pro 16" M3',
      category: "노트북",
      pricePerDay: 25000,
      status: "ACTIVE",
      image: "/macbook-pro-laptop.png",
    },
    {
      id: 2,
      name: "Sony A7 IV",
      category: "카메라",
      pricePerDay: 35000,
      status: "ACTIVE",
      image: "/sony-mirrorless-camera.png",
    },
  ]

  const reservations = [
    {
      id: 1,
      productName: 'MacBook Pro 16"',
      customerName: "김철수",
      startDate: "2025-01-15",
      endDate: "2025-01-20",
      totalAmount: 125000,
      status: "PENDING",
    },
    {
      id: 2,
      productName: "Sony A7 IV",
      customerName: "이영희",
      startDate: "2025-01-18",
      endDate: "2025-01-22",
      totalAmount: 140000,
      status: "APPROVED",
    },
  ]

  const monthlySettlement = 450000

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      PENDING: { text: "승인 대기", className: "bg-yellow-100 text-yellow-800" },
      APPROVED: { text: "승인 완료", className: "bg-green-100 text-green-800" },
      REJECTED: { text: "거절", className: "bg-red-100 text-red-800" },
      ACTIVE: { text: "활성화", className: "bg-green-100 text-green-800" },
      INACTIVE: { text: "비활성화", className: "bg-gray-100 text-gray-800" },
    }
    return statusMap[status] || { text: status, className: "" }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">판매자 페이지</h1>
            <Link href="/seller/product/new">
              <Button className="rounded-lg">
                <Plus className="h-4 w-4 mr-2" />
                상품 등록
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">판매 상품</p>
                  <p className="text-2xl font-bold">{products.length}개</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">대기 중인 예약</p>
                  <p className="text-2xl font-bold">{reservations.filter((r) => r.status === "PENDING").length}건</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">이번달 정산 예정</p>
                  <p className="text-2xl font-bold">₩{monthlySettlement.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="products">판매 상품</TabsTrigger>
            <TabsTrigger value="reservations">예약 관리</TabsTrigger>
            <TabsTrigger value="settings">판매자 정보</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold mb-1">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-accent text-white hover:bg-accent">
                              ₩{product.pricePerDay.toLocaleString()}/일
                            </Badge>
                            <Badge className={getStatusText(product.status).className}>
                              {getStatusText(product.status).text}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/seller/product/${product.id}/edit`}>
                            <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                              <Edit className="h-4 w-4 mr-1" />
                              수정
                            </Button>
                          </Link>
                          <Link href={`/products/${product.id}`}>
                            <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                              보기
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reservations" className="space-y-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold mb-1">{reservation.productName}</h3>
                      <p className="text-sm text-muted-foreground mb-1">고객: {reservation.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.startDate} ~ {reservation.endDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusText(reservation.status).className}>
                        {getStatusText(reservation.status).text}
                      </Badge>
                      <p className="text-lg font-bold text-primary mt-2">₩{reservation.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  {reservation.status === "PENDING" && (
                    <div className="flex gap-2 pt-3 border-t">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" className="flex-1 rounded-lg">
                            <Check className="h-4 w-4 mr-1" />
                            승인
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>예약을 승인하시겠습니까?</AlertDialogTitle>
                            <AlertDialogDescription>
                              승인 후에는 취소할 수 없습니다. 고객에게 승인 알림이 전송됩니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction>승인하기</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex-1 rounded-lg bg-transparent">
                            <X className="h-4 w-4 mr-1" />
                            거절
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>예약을 거절하시겠습니까?</AlertDialogTitle>
                            <AlertDialogDescription>거절 사유를 고객에게 알릴 수 있습니다.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600">거절하기</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">판매자 정보</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">스토어명</p>
                    <p className="font-medium">테크렌탈샵</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">사업자등록번호</p>
                    <p className="font-medium">123-45-67890</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">연락처</p>
                    <p className="font-medium">02-1234-5678</p>
                  </div>
                  <div className="pt-4">
                    <Link href="/seller/settings">
                      <Button variant="outline" className="rounded-lg bg-transparent">
                        정보 수정
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
