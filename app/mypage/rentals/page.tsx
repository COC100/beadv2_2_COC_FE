"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ChevronDown, ChevronUp, Package, Calendar, DollarSign, Truck } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { rentalAPI, productAPI, deliveryAPI, reviewAPI } from "@/lib/api"

interface RentalDetail {
  id: number
  productId: number
  productName: string
  productImage: string
  startDate: string
  endDate: string
  pricePerDay: number
  totalDays: number
  totalAmount: number
  securityDepositAmount: number
  status: "PENDING" | "APPROVED" | "RENTING" | "RETURNED" | "REJECTED" | "REQUESTED" | "ACCEPTED" | "PAID"
  createdAt: string
}

interface Order {
  orderId: string
  orderDate: string
  totalAmount: number
  status: string
  details: RentalDetail[]
  rentalId: number
}

export default function RentalsPage() {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const [deliveryInfo, setDeliveryInfo] = useState<Record<number, any>>({})
  const [reviewedRentalIds, setReviewedRentalIds] = useState<Set<number>>(new Set())
  const [showInsufficientDepositDialog, setShowInsufficientDepositDialog] = useState(false)

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date)
  }

  const calculateTotal = (startDate: string, endDate: string, product: any) => {
    if (!startDate || !endDate || !product) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return days > 0 ? days * product.pricePerDay : 0
  }

  const getDeliveryStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      REGISTERED: "송장 등록",
      PICKED_UP: "집하",
      IN_TRANSIT: "이동중",
      OUT_FOR_DELIVERY: "배송출발",
      DELIVERED: "배송 완료",
      EXCEPTION: "예외",
      CANCELLED: "취소",
    }
    return statusMap[status] || status
  }

  const CARRIER_CODES = [
    { code: "kr.cjlogistics", name: "CJ대한통운" },
    { code: "kr.epost", name: "우체국택배" },
    { code: "kr.hanjin", name: "한진택배" },
    { code: "kr.lotte", name: "롯데택배" },
    { code: "kr.logen", name: "로젠택배" },
    // ... rest of codes same as manage page
  ]

  const loadDeliveryInfo = async (rentalItemId: number) => {
    try {
      const response = await deliveryAPI.getByRentalItem(rentalItemId)
      setDeliveryInfo((prev) => ({ ...prev, [rentalItemId]: response.data }))
    } catch (error: any) {
      console.log(`[v0] No delivery info for rental ${rentalItemId}:`, error)
    }
  }

  const loadMyReviews = async () => {
    try {
      const response = await reviewAPI.getMyReviews()
      const reviews = response.data
      console.log("[v0] My reviews:", reviews)
      
      // Extract rentalItemIds from reviews
      const reviewedIds = new Set(
        reviews
          .filter((review: any) => review.rentalItemId)
          .map((review: any) => review.rentalItemId)
      )
      console.log("[v0] Reviewed rental item IDs:", Array.from(reviewedIds))
      setReviewedRentalIds(reviewedIds)
    } catch (error: any) {
      console.error("[v0] Failed to fetch my reviews:", error)
    }
  }

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          router.push("/")
          return
        }

        // Load my reviews to check which rental items already have reviews
        await loadMyReviews()

        const rentalsResponse = await rentalAPI.search()
        const rentals = rentalsResponse.data

        // 1. 모든 렌탈 항목에서 productId 수집 (중복 제거)
        const productIds = Array.from(
          new Set(rentals.flatMap((rental: any) => rental.items.map((item: any) => item.productId))),
        )
        console.log("[v0] Collected product IDs for bulk fetch:", productIds)

        // 2. Bulk API로 한 번에 상품 정보 조회
        const productDetailsMap = new Map()
        if (productIds.length > 0) {
          try {
            const bulkResponse = await productAPI.bulkGet(productIds)
            const products = bulkResponse.data
            console.log("[v0] Bulk product fetch result:", products)
            
            // Map으로 변환하여 빠른 조회 가능하게 함
            products.forEach((product: any) => {
              productDetailsMap.set(product.productId, product)
            })
          } catch (error) {
            console.error("[v0] Failed to bulk fetch products:", error)
          }
        }

        const orderMap = new Map<number, Order>()

        for (const rental of rentals) {
          const createdAt = rental.createdAt || rental.items[0]?.startDate || ""

          if (!orderMap.has(rental.rentalId)) {
            orderMap.set(rental.rentalId, {
              orderId: `ORD-${rental.rentalId}`,
              orderDate: formatDateTime(createdAt),
              totalAmount: 0,
              status: rental.items[0]?.status || "PENDING",
              details: [],
              rentalId: rental.rentalId,
            })
          }

          const order = orderMap.get(rental.rentalId)!

          for (const item of rental.items) {
            const days =
              Math.ceil(
                (new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / (1000 * 60 * 60 * 24),
              ) + 1
            const rentalAmount = item.unitPrice * days
            const securityDeposit = item.securityDepositAmount || 0
            const totalAmount = rentalAmount + securityDeposit

            const product = productDetailsMap.get(item.productId)

            order.details.push({
              id: item.rentalItemId,
              productId: item.productId,
              productName: product?.name || `상품 ${item.productId}`,
              productImage: product?.thumbnailUrl || product?.images?.[0]?.url || "/placeholder.svg",
              startDate: item.startDate,
              endDate: item.endDate,
              pricePerDay: item.unitPrice,
              totalDays: days,
              totalAmount,
              securityDepositAmount: securityDeposit,
              status: item.status,
              createdAt: createdAt,
            })

            order.totalAmount += totalAmount
          }
        }

        for (const rental of rentals) {
          for (const item of rental.items) {
            if (item.status === "PAID") {
              await loadDeliveryInfo(item.rentalItemId)
            }
          }
        }

        setOrders(Array.from(orderMap.values()).sort((a, b) => b.rentalId - a.rentalId))
      } catch (error: any) {
        console.error("[v0] Failed to fetch rentals:", error)
        toast({
          title: "렌탈 내역 조회 실패",
          description: error.message || "렌탈 내역을 불러오는데 실패했습니다.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRentals()
  }, [router, toast])

  // Reload reviews when page becomes visible (e.g., after returning from review creation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("[v0] Page became visible, reloading reviews")
        loadMyReviews()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const toggleOrder = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      PENDING: { text: "승인 대기", color: "bg-yellow-100 text-yellow-800" },
      APPROVED: { text: "승인 완료", color: "bg-blue-100 text-blue-800" },
      RENTING: { text: "렌탈 중", color: "bg-green-100 text-green-800" },
      RETURNED: { text: "반납 완료", color: "bg-gray-100 text-gray-800" },
      REJECTED: { text: "거절됨", color: "bg-red-100 text-red-800" },
      REQUESTED: { text: "신청됨", color: "bg-purple-100 text-purple-800" },
      ACCEPTED: { text: "승인됨", color: "bg-teal-100 text-teal-800" },
      PAID: { text: "결제 완료", color: "bg-green-100 text-green-800" },
    }
    return statusMap[status] || { text: status, color: "" }
  }

  const handleExtend = async (rentalItemId: number) => {
    try {
      const newEndDate = prompt("새로운 종료일을 입력하세요 (YYYY-MM-DD):")
      if (!newEndDate) return

      await rentalAPI.extend(rentalItemId, newEndDate)
      toast({
        title: "렌탈 연장 완료",
        description: "렌탈 기간이 연장되었습니다.",
      })
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "렌탈 연장 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleReturn = async (rentalItemId: number) => {
    try {
      await rentalAPI.returnItem(rentalItemId)
      toast({
        title: "반납 신청 완료",
        description: "반납 신청이 접수되었습니다.",
      })
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "반납 신청 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handlePayment = async (rentalId: number) => {
    if (!confirm("결제를 진행하시겠습니까?")) return

    try {
      console.log("[v0] Payment request - rentalId:", rentalId)
      const response = await rentalAPI.pay(rentalId)
      console.log("[v0] Payment response:", response)
      console.log("[v0] Payment response data:", response.data)

      toast({
        title: "결제 완료",
        description: "렌탈 결제가 완료되었습니다",
      })
      window.location.reload()
    } catch (error: any) {
      console.error("[v0] Payment error:", error)
      
      // Check if error is due to insufficient deposit
      if (error.message?.includes("예치금") || error.message?.includes("부족") || error.message?.includes("잔액")) {
        setShowInsufficientDepositDialog(true)
      } else {
        toast({
          title: "결제 실패",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  const handleCancel = async (rentalItemId: number) => {
    if (!confirm("정말 렌탈을 취소하시겠습니까?")) return

    try {
      await rentalAPI.cancel(rentalItemId)
      toast({
        title: "렌탈 취소 완료",
        description: "렌탈이 취소되었습니다",
      })
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "취소 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleStartRental = async (rentalItemId: number) => {
    try {
      await rentalAPI.startRental(rentalItemId)
      toast({
        title: "렌탈 시작 완료",
        description: "렌탈이 시작되었습니다",
      })
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "렌탈 시작 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>로딩 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/mypage"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          마이페이지로
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">렌탈 내역</h1>
          <p className="text-muted-foreground">주문 단위로 렌탈 내역을 확인하세요</p>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">렌탈 내역이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.orderId} className="overflow-hidden py-0">
                <CardContent className="p-0">
                  <div className="p-5 bg-gray-50 border-b cursor-pointer" onClick={() => toggleOrder(order.orderId)}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{order.orderId}</p>
                          <p className="text-sm text-muted-foreground">주문일: {order.orderDate}</p>
                        </div>
                      </div>
                      <Badge className={getStatusText(order.status).color}>{getStatusText(order.status).text}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{order.details.length}개 상품</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-bold text-primary">₩{order.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1">
                        {expandedOrders.has(order.orderId) ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            접기
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            상세보기
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {expandedOrders.has(order.orderId) && (
                    <div className="p-5 space-y-4">
                      {order.details.map((detail, index) => {
                        const delivery = deliveryInfo[detail.id]

                        return (
                          <div key={detail.id}>
                            {index > 0 && <Separator className="mb-4" />}
                            <div className="flex gap-4">
                              <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={detail.productImage || "/placeholder.svg"}
                                  alt={detail.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <Link
                                      href={`/products/${detail.productId}`}
                                      className="font-semibold hover:text-primary transition-colors"
                                    >
                                      {detail.productName}
                                    </Link>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      렌탈 시작일: {formatDate(detail.startDate)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      렌탈 마감일: {formatDate(detail.endDate)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">({detail.totalDays}일)</p>
                                  </div>
                                  <Badge className={getStatusText(detail.status).color}>
                                    {getStatusText(detail.status).text}
                                  </Badge>
                                </div>
                                <div className="space-y-1 mt-3">
                                  <div className="flex items-center justify-between text-sm">
                                    <p className="text-muted-foreground">
                                      렌탈 금액: {detail.pricePerDay.toLocaleString()}원 x {detail.totalDays}일
                                    </p>
                                    <p className="text-muted-foreground">
                                      ₩{(detail.pricePerDay * detail.totalDays).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <p className="text-muted-foreground">보증금</p>
                                    <p className="text-muted-foreground">
                                      ₩{detail.securityDepositAmount.toLocaleString()}
                                    </p>
                                  </div>
                                  <Separator className="my-2" />
                                  <div className="flex items-center justify-between">
                                    <p className="font-semibold">합계</p>
                                    <p className="font-bold text-primary">₩{detail.totalAmount.toLocaleString()}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  {detail.status === "ACCEPTED" && (
                                    <Button
                                      size="sm"
                                      className="rounded-lg"
                                      onClick={() => handlePayment(order.rentalId)}
                                    >
                                      결제하기
                                    </Button>
                                  )}
                                  {detail.status === "RETURNED" && !reviewedRentalIds.has(detail.id) && (
                                    <Button
                                      size="sm"
                                      className="rounded-lg"
                                      onClick={() => router.push(`/reviews/create?rentalItemId=${detail.id}`)}
                                    >
                                      후기 작성
                                    </Button>
                                  )}
                                  {(detail.status === "REQUESTED" || detail.status === "ACCEPTED") && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="rounded-lg bg-transparent"
                                      onClick={() => handleCancel(detail.id)}
                                    >
                                      렌탈 취소하기
                                    </Button>
                                  )}
                                  {detail.status === "RENTING" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-lg bg-transparent"
                                        onClick={() => handleExtend(detail.id)}
                                      >
                                        렌탈 연장
                                      </Button>
                                      <Button size="sm" className="rounded-lg" onClick={() => handleReturn(detail.id)}>
                                        반납 신청
                                      </Button>
                                    </>
                                  )}
                                </div>
                                {detail.status === "PAID" && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Truck className="h-4 w-4 text-blue-600" />
                                      <span className="font-semibold text-sm">배송 정보</span>
                                    </div>
                                    {delivery ? (
                                      <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">배송 상태:</span>
                                          <Badge className="bg-blue-600 text-white">
                                            {getDeliveryStatusText(delivery.status)}
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">택배사:</span>
                                          <span>
                                            {CARRIER_CODES.find((c) => c.code === delivery.carrierCode)?.name ||
                                              delivery.carrierCode}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">운송장번호:</span>
                                          <span className="font-mono">{delivery.trackingNumber}</span>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="w-full mt-2 bg-transparent"
                                          onClick={() =>
                                            window.open(
                                              `https://tracker.delivery/#/${delivery.carrierCode}/${delivery.trackingNumber}`,
                                              "_blank",
                                            )
                                          }
                                        >
                                          배송 조회
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="text-center">
                                        <p className="text-sm text-muted-foreground">송장번호 등록 전</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Footer />

      <AlertDialog open={showInsufficientDepositDialog} onOpenChange={setShowInsufficientDepositDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예치금 부족</AlertDialogTitle>
            <AlertDialogDescription>
              결제에 필요한 예치금이 부족합니다. 예치금을 충전하신 후 다시 시도해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/deposit")}>충전하기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
