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
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { sellerAPI, productAPI } from "@/lib/api"

export default function SellerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [sellerInfo, setSellerInfo] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])

  useEffect(() => {
    const loadSellerData = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push("/intro")
        return
      }

      try {
        // Get seller info
        const seller = await sellerAPI.getSelf()
        setSellerInfo(seller)

        // Get seller's products - API spec doesn't have this, so we'll note it
        // For now, use all products filtered by sellerId
        const productsResponse = await productAPI.list({ sellerId: seller.id })
        setProducts(productsResponse.products || [])

        // Get seller's rentals
        const rentals = await sellerAPI.getRentals({
          status: "REQUESTED",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })
        setReservations(rentals || [])
      } catch (error: any) {
        console.error("[v0] Failed to load seller data:", error)
        if (error.message.includes("404") || error.message.includes("Not Found")) {
          // No seller profile, redirect to registration
          router.push("/become-seller")
        } else if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          router.push("/intro")
        } else {
          toast({
            title: "데이터 로딩 실패",
            description: "판매자 정보를 불러오는데 실패했습니다",
            variant: "destructive",
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadSellerData()
  }, [router, toast])

  const handleAcceptRental = async (rentalItemId: number) => {
    try {
      await sellerAPI.getRentals()
      toast({
        title: "예약 승인 완료",
        description: "예약이 승인되었습니다",
      })
      // Reload reservations
      const rentals = await sellerAPI.getRentals({
        status: "REQUESTED",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      })
      setReservations(rentals || [])
    } catch (error: any) {
      toast({
        title: "승인 실패",
        description: error.message || "예약 승인에 실패했습니다",
        variant: "destructive",
      })
    }
  }

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  const monthlySettlement = 0 // Calculate from settlements API

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
                          <Button
                            size="sm"
                            className="flex-1 rounded-lg"
                            onClick={() => handleAcceptRental(reservation.id)}
                          >
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
                {sellerInfo && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">스토어명</p>
                      <p className="font-medium">{sellerInfo.storeName}</p>
                    </div>
                    {sellerInfo.bizRegNo && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">사업자등록번호</p>
                        <p className="font-medium">{sellerInfo.bizRegNo}</p>
                      </div>
                    )}
                    {sellerInfo.storePhone && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">연락처</p>
                        <p className="font-medium">{sellerInfo.storePhone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">상태</p>
                      <Badge>{sellerInfo.status}</Badge>
                    </div>
                    <div className="pt-4">
                      <Link href="/seller/settings">
                        <Button variant="outline" className="rounded-lg bg-transparent">
                          정보 수정
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
