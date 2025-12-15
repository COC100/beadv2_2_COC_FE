"use client"
import Link from "next/link"
import { Plus, Package, Clock, DollarSign, Edit, Check, X, ChevronLeft, ChevronRight, Receipt } from "lucide-react"
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
  const [currentPage, setCurrentPage] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLastPage, setIsLastPage] = useState(false)
  const [reservations, setReservations] = useState<any[]>([])
  const [statusChanging, setStatusChanging] = useState<{ [key: number]: boolean }>({})

  const handleAcceptRental = async (reservationId: number) => {
    try {
      await sellerAPI.acceptRental(reservationId)
      toast({
        title: "예약 승인 완료",
        description: "예약이 승인되었습니다",
      })
      const rentals = await sellerAPI.getRentals({
        status: "REQUESTED",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      })
      setReservations(rentals || [])
    } catch (error: any) {
      toast({
        title: "예약 승인 실패",
        description: error.message || "예약 승인에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const loadSellerData = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push("/intro")
        return
      }

      try {
        const seller = await sellerAPI.getSelf()
        setSellerInfo(seller)

        try {
          const productsResponse = await productAPI.getSellerProducts({
            page: currentPage,
            size: 20,
            sort: "createdAt,desc",
          })
          setProducts(productsResponse.content || [])
          setTotalProducts(productsResponse.totalElements || 0)
          setTotalPages(productsResponse.totalPages || 0)
          setIsLastPage(productsResponse.last || false)
        } catch (productError) {
          console.error("[v0] Failed to load products (non-critical):", productError)
          setProducts([])
          setTotalProducts(0)
        }

        try {
          const rentals = await sellerAPI.getRentals({
            status: "REQUESTED",
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          })
          console.log("[v0] Seller rentals loaded:", rentals)
          setReservations(rentals || [])
        } catch (rentalError) {
          console.error("[v0] Failed to load rentals (non-critical):", rentalError)
          setReservations([])
        }

        setIsLoading(false)
      } catch (error: any) {
        console.error("[v0] Failed to load seller data:", error)
        if (error.message.includes("404") || error.message.includes("Not Found")) {
          router.push("/become-seller")
        } else if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          router.push("/intro")
        } else {
          setIsLoading(false)
          setProducts([])
          setReservations([])
        }
      }
    }

    loadSellerData()
  }, [router, currentPage])

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (!isLastPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleToggleStatus = async (productId: number, currentStatus: string) => {
    setStatusChanging({ ...statusChanging, [productId]: true })
    try {
      if (currentStatus === "ACTIVE") {
        await productAPI.deactivate(productId)
        toast({
          title: "상태 변경 완료",
          description: "상품이 예약 불가 상태로 변경되었습니다",
        })
      } else {
        await productAPI.activate(productId)
        toast({
          title: "상태 변경 완료",
          description: "상품이 예약 가능 상태로 변경되었습니다",
        })
      }

      const productsResponse = await productAPI.getSellerProducts({
        page: currentPage,
        size: 20,
        sort: "createdAt,desc",
      })
      setProducts(productsResponse.content || [])
      setTotalProducts(productsResponse.totalElements || 0)
    } catch (error: any) {
      toast({
        title: "상태 변경 실패",
        description: error.message || "상태 변경에 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setStatusChanging({ ...statusChanging, [productId]: false })
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

  const monthlySettlement = 0

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">판매자 페이지</h1>
            <div className="flex gap-2">
              <Link href="/seller/settlements">
                <Button variant="outline" className="rounded-lg bg-transparent">
                  <Receipt className="h-4 w-4 mr-2" />
                  정산
                </Button>
              </Link>
              <Link href="/seller/product/new">
                <Button className="rounded-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  상품 등록
                </Button>
              </Link>
            </div>
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
                  <p className="text-2xl font-bold">{totalProducts}개</p>
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
                  <p className="text-2xl font-bold">{reservations.length}건</p>
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
            {products.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">등록된 상품이 없습니다</p>
                  <Link href="/seller/product/new">
                    <Button className="rounded-lg">
                      <Plus className="h-4 w-4 mr-2" />첫 상품 등록하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {products.map((product) => (
                  <Card key={product.productId}>
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={product.thumbnailUrl || "/placeholder.svg"}
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
                                  ₩{product.pricePerDay?.toLocaleString()}/일
                                </Badge>
                                <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"}>
                                  {product.status === "ACTIVE" ? "예약 가능" : "예약 불가"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant={product.status === "ACTIVE" ? "outline" : "default"}
                                size="sm"
                                className="rounded-lg"
                                onClick={() => handleToggleStatus(product.productId, product.status)}
                                disabled={statusChanging[product.productId]}
                              >
                                {statusChanging[product.productId]
                                  ? "변경 중..."
                                  : product.status === "ACTIVE"
                                    ? "예약 불가로 변경"
                                    : "예약 가능으로 변경"}
                              </Button>
                              <Link href={`/seller/product/${product.productId}/edit`}>
                                <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                                  <Edit className="h-4 w-4 mr-1" />
                                  수정
                                </Button>
                              </Link>
                              <Link href={`/products/${product.productId}`}>
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

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 0}
                      className="rounded-lg bg-transparent"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      이전
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentPage + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={isLastPage}
                      className="rounded-lg bg-transparent"
                    >
                      다음
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="reservations" className="space-y-4">
            {reservations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">대기 중인 예약이 없습니다</p>
                </CardContent>
              </Card>
            ) : (
              reservations.map((reservation) => (
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
                        <p className="text-lg font-bold text-primary mt-2">
                          ₩{reservation.totalAmount.toLocaleString()}
                        </p>
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
              ))
            )}
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
