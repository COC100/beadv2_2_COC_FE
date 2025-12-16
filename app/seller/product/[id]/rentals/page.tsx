"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { sellerAPI } from "@/lib/api"

export default async function ProductRentalsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const productId = resolvedParams.id

  return <ProductRentalsContent productId={productId} />
}

function ProductRentalsContent({ productId }: { productId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [rentals, setRentals] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push("/intro")
        return
      }

      try {
        console.log("[v0] Loading rentals for productId:", productId)

        const response = await sellerAPI.getRentals({
          productId: Number(productId),
          startDate: "2020-01-01",
          endDate: "2099-12-31",
          size: 100,
        })
        console.log("[v0] Rentals API response:", response)

        const rentalsData = response.data || []
        console.log("[v0] Rentals data:", rentalsData)
        setRentals(Array.isArray(rentalsData) ? rentalsData : [])
      } catch (error: any) {
        console.error("[v0] Failed to load rentals:", error)
        toast({
          title: "오류",
          description: error.message || "데이터를 불러오는데 실패했습니다",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [productId, router, toast])

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      REQUESTED: { text: "요청됨", className: "bg-yellow-100 text-yellow-800" },
      ACCEPTED: { text: "수락됨", className: "bg-blue-100 text-blue-800" },
      REJECTED: { text: "거절됨", className: "bg-red-100 text-red-800" },
      PAID: { text: "결제 완료", className: "bg-green-100 text-green-800" },
      RENTING: { text: "렌탈 중", className: "bg-purple-100 text-purple-800" },
      RETURNED: { text: "반납 완료", className: "bg-gray-100 text-gray-800" },
      CANCELED: { text: "취소됨", className: "bg-gray-100 text-gray-800" },
    }
    const config = statusMap[status] || { text: status, className: "bg-gray-100" }
    return <Badge className={config.className}>{config.text}</Badge>
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/seller">
              <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-1" />
                뒤로가기
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">상품 예약 내역</h1>
          <p className="text-muted-foreground mt-2">총 {rentals.length}건의 예약</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {rentals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">예약 내역이 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rentals.map((rental) => (
              <Card key={rental.rentalItemId}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(rental.status)}
                        <span className="text-sm text-muted-foreground">#{rental.rentalItemId}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {rental.startDate} ~ {rental.endDate}
                          </span>
                        </div>
                        {rental.paidAt && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>결제일: {new Date(rental.paidAt).toLocaleString("ko-KR")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">₩{rental.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
