"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ChevronDown, ChevronUp, Package, Calendar, DollarSign } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { rentalAPI } from "@/lib/api"

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
  status: "PENDING" | "APPROVED" | "RENTING" | "RETURNED" | "REJECTED"
}

interface Order {
  orderId: string
  orderDate: string
  totalAmount: number
  status: string
  details: RentalDetail[]
}

export default function RentalsPage() {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          router.push("/intro")
          return
        }

        const rentals = await rentalAPI.list()

        const orderMap = new Map<number, Order>()

        for (const rental of rentals) {
          if (!orderMap.has(rental.rentalId)) {
            orderMap.set(rental.rentalId, {
              orderId: `ORD-${rental.rentalId}`,
              orderDate: rental.items[0]?.startDate || "",
              totalAmount: 0,
              status: rental.items[0]?.status || "PENDING",
              details: [],
            })
          }

          const order = orderMap.get(rental.rentalId)!

          for (const item of rental.items) {
            const days = Math.ceil(
              (new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / (1000 * 60 * 60 * 24),
            )
            const totalAmount = item.unitPrice * days

            order.details.push({
              id: item.rentalItemId,
              productId: item.productId,
              productName: `Product ${item.productId}`,
              productImage: "/placeholder.svg",
              startDate: item.startDate,
              endDate: item.endDate,
              pricePerDay: item.unitPrice,
              totalDays: days,
              totalAmount,
              status: item.status,
            })

            order.totalAmount += totalAmount
          }
        }

        setOrders(Array.from(orderMap.values()))
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
              <Card key={order.orderId} className="overflow-hidden">
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
                      {order.details.map((detail, index) => (
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
                                    {detail.startDate} ~ {detail.endDate} ({detail.totalDays}일)
                                  </p>
                                </div>
                                <Badge className={getStatusText(detail.status).color}>
                                  {getStatusText(detail.status).text}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <p className="text-sm text-muted-foreground">
                                  {detail.pricePerDay.toLocaleString()}원 x {detail.totalDays}일
                                </p>
                                <p className="font-bold text-primary">₩{detail.totalAmount.toLocaleString()}</p>
                              </div>
                              <div className="flex gap-2 mt-3">
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
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
