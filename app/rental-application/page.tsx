"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { productAPI, memberAPI, rentalAPI } from "@/lib/api"
import { MapPin, Calendar, CreditCard } from "lucide-react"

export default function RentalApplicationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [product, setProduct] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const productId = searchParams.get("productId")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          router.push("/intro")
          return
        }
      }

      if (!productId || !startDate || !endDate) {
        toast({
          title: "잘못된 접근",
          description: "상품 정보가 없습니다",
          variant: "destructive",
        })
        router.push("/products")
        return
      }

      try {
        const [productData, addressData] = await Promise.all([
          productAPI.getDetail(Number(productId)),
          memberAPI.getAddresses(),
        ])

        setProduct(productData)
        setAddresses(addressData || [])

        // Select default address
        const defaultAddr = addressData.find((a: any) => a.isDefault)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.addressId.toString())
        }
      } catch (error: any) {
        toast({
          title: "데이터 로딩 실패",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [productId, startDate, endDate, router, toast])

  const calculateTotal = () => {
    if (!product || !startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days * product.pricePerDay : 0
  }

  const handleSubmit = async () => {
    if (!selectedAddressId) {
      toast({
        title: "배송지를 선택해주세요",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await rentalAPI.create({
        productId: Number(productId),
        startDate: startDate!,
        endDate: endDate!,
      })

      toast({
        title: "렌탈 신청 완료",
        description: "렌탈 신청이 완료되었습니다",
      })

      router.push("/mypage/rentals")
    } catch (error: any) {
      let errorMessage = error.message || "렌탈 신청에 실패했습니다"

      // Parse common error scenarios
      if (errorMessage.includes("예약 불가")) {
        errorMessage = "해당 기간에는 상품을 렌탈할 수 없습니다. 다른 날짜를 선택해주세요."
      } else if (errorMessage.includes("재고")) {
        errorMessage = "재고가 부족합니다. 다른 상품을 선택해주세요."
      } else if (errorMessage.includes("예치금")) {
        errorMessage = "예치금이 부족합니다. 예치금을 충전해주세요."
      }

      toast({
        title: "렌탈 신청 실패",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>로딩 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  const total = calculateTotal()
  const days =
    startDate && endDate
      ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-blue-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">렌탈 신청</h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                상품 정보
              </h2>
              {product && (
                <div className="flex gap-4">
                  <img
                    src={
                      product.thumbnailImageId
                        ? product.images[0]?.url
                        : "/placeholder.svg?height=100&width=100&query=no+image"
                    }
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {startDate} ~ {endDate} ({days}일)
                    </p>
                    <p className="text-lg font-bold text-primary">₩{total.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                배송지 선택
              </h2>
              <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                {addresses.map((address) => (
                  <div key={address.addressId} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value={address.addressId.toString()} id={address.addressId.toString()} />
                    <Label htmlFor={address.addressId.toString()} className="flex-1 cursor-pointer">
                      <div className="font-medium">{address.addressLabel}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {address.roadAddress} {address.detailAddress}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {address.recipientName} / {address.recipientPhone}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                결제 정보
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>상품 금액</span>
                  <span className="font-medium">₩{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>총 결제 금액</span>
                  <span className="text-primary">₩{total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 rounded-lg bg-transparent" onClick={() => router.back()}>
              취소
            </Button>
            <Button className="flex-1 rounded-lg" onClick={handleSubmit} disabled={submitting || !selectedAddressId}>
              {submitting ? "신청 중..." : "렌탈 신청하기"}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
