"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, Plus, AlertCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { memberAPI, rentalAPI, cartAPI, productAPI } from "@/lib/api"
import { handlePhoneInput } from "@/lib/utils"

export default function ReservationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  })
  const [formData, setFormData] = useState({
    name: "",
    recipient: "",
    phone: "",
    address: "",
    detailAddress: "",
    zipCode: "",
  })
  const [productData, setProductData] = useState<Record<number, any>>({})

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push("/intro")
        return
      }

      try {
        const addressResponse = await memberAPI.getAddresses()
        const addressData = addressResponse.data
        const addressList = Array.isArray(addressData) ? addressData : addressData?.addressList || []
        setAddresses(addressList)

        const defaultAddr = addressList.find((a: any) => a.isDefault)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.addressId)
        } else if (addressList.length > 0) {
          setSelectedAddressId(addressList[0].addressId)
        }

        const cartResponse = await cartAPI.list()
        const cartData = cartResponse.data
        const items = Array.isArray(cartData) ? cartData : cartData?.items || []

        const productIds = [...new Set(items.map((item: any) => item.productId))]
        const products: Record<number, any> = {}

        await Promise.all(
          productIds.map(async (productId) => {
            try {
              const productResponse = await productAPI.getDetail(productId)
              products[productId] = productResponse.data
            } catch (err) {
              console.error(`[v0] Failed to load product ${productId}:`, err)
            }
          }),
        )

        setProductData(products)
        setCartItems(items)
      } catch (error: any) {
        console.error("[v0] Failed to load reservation data:", error)
        if (error.message.includes("401")) {
          router.push("/intro")
        } else {
          toast({
            title: "데이터 로딩 실패",
            description: "예약 정보를 불러오는데 실패했습니다",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, toast])

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await memberAPI.createAddress({
        addressLabel: formData.name,
        recipientName: formData.recipient,
        recipientPhone: formData.phone,
        postcode: formData.zipCode,
        roadAddress: formData.address,
        detailAddress: formData.detailAddress,
        isDefault: addresses.length === 0,
        type: "MEMBER",
      })

      const response = await memberAPI.getAddresses()
      const addressData = response.data
      setAddresses(Array.isArray(addressData) ? addressData : addressData?.addressList || [])
      setIsDialogOpen(false)
      toast({
        title: "주소 추가 완료",
        description: "주소가 성공적으로 추가되었습니다",
      })
    } catch (error: any) {
      console.error("[v0] Failed to add address:", error)
      toast({
        title: "주소 추가 실패",
        description: error.message || "주소 추가에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const handleReservation = async () => {
    if (!selectedAddressId) {
      setErrorDialog({
        open: true,
        message: "배송받을 주소를 선택해주세요.",
      })
      return
    }

    try {
      const cartItemIds = cartItems.map((item) => item.cartItemId)
      console.log("[v0] Creating rental from cart with items:", cartItemIds)
      await rentalAPI.createFromCart(cartItemIds)

      try {
        await Promise.all(cartItemIds.map((itemId) => cartAPI.deleteItem(itemId)))
        console.log("[v0] Cart cleared successfully")
      } catch (clearError) {
        console.warn("[v0] Failed to clear cart (non-critical):", clearError)
      }

      toast({
        title: "예약 신청 완료",
        description: "예약이 성공적으로 신청되었습니다",
      })
      router.push("/mypage/rentals")
    } catch (error: any) {
      console.error("[v0] Failed to create rental:", error)
      setErrorDialog({
        open: true,
        message: error.message || "예약 신청에 실패했습니다. 다시 시도해주세요.",
      })
    }
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    const product = productData[item.productId]
    const pricePerDay = product?.pricePerDay || item.price || 0
    const days = calculateDays(item.startDate, item.endDate)
    return sum + pricePerDay * days
  }, 0)

  const handlePostcodeSearch = () => {
    if (!(window as any).daum || !(window as any).daum.Postcode) {
      toast({
        title: "우편번호 검색 불가",
        description: "우편번호 검색 서비스를 불러올 수 없습니다. 페이지를 새로고침해주세요.",
        variant: "destructive",
      })
      return
    }
    ;new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        setFormData({
          ...formData,
          zipCode: data.zonecode,
          address: data.roadAddress,
        })
      },
    }).open()
  }

  if (loading) {
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

      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl">예약 신청 실패</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base pt-2">{errorDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog({ open: false, message: "" })} className="rounded-xl">
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                        <Plus className="h-4 w-4 mr-1" />
                        주소 추가
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-2xl">
                      <DialogHeader>
                        <DialogTitle>주소 추가</DialogTitle>
                        <DialogDescription>배송받을 주소 정보를 입력하세요</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddAddress} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">주소지 이름</Label>
                          <Input
                            id="name"
                            placeholder="예: 집, 회사"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="rounded-xl"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="recipient">받는 사람</Label>
                          <Input
                            id="recipient"
                            placeholder="이름"
                            value={formData.recipient}
                            onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                            className="rounded-xl"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">연락처</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="010-0000-0000"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: handlePhoneInput(e.target.value) })}
                            className="rounded-xl"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">우편번호</Label>
                          <div className="flex gap-2">
                            <Input
                              id="zipCode"
                              placeholder="12345"
                              value={formData.zipCode}
                              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                              className="rounded-xl"
                              required
                              readOnly
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-xl bg-transparent"
                              onClick={handlePostcodeSearch}
                            >
                              우편번호 찾기
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">주소</Label>
                          <Input
                            id="address"
                            placeholder="도로명 주소"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="rounded-xl"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="detailAddress">상세 주소</Label>
                          <Input
                            id="detailAddress"
                            placeholder="동/호수"
                            value={formData.detailAddress}
                            onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                            className="rounded-xl"
                            required
                          />
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button type="submit" className="flex-1 rounded-xl">
                            추가하기
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="flex-1 rounded-xl"
                          >
                            취소
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <RadioGroup
                  value={selectedAddressId?.toString()}
                  onValueChange={(value) => setSelectedAddressId(Number.parseInt(value))}
                >
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <Card key={addr.addressId} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <RadioGroupItem
                              value={addr.addressId.toString()}
                              id={`address-${addr.addressId}`}
                              className="mt-1"
                            />
                            <Label htmlFor={`address-${addr.addressId}`} className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">{addr.addressLabel}</span>
                                {addr.isDefault && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    기본 배송지
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{addr.roadAddress}</p>
                              <p className="text-sm text-muted-foreground mb-1">{addr.detailAddress}</p>
                              <p className="text-sm text-muted-foreground">{addr.recipientPhone}</p>
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
                  {cartItems.map((item) => {
                    const product = productData[item.productId]
                    const thumbnailImage = product?.images?.find((img: any) => img.imageId === product.thumbnailImageId)
                    const pricePerDay = product?.pricePerDay || item.price || 0
                    const days = calculateDays(item.startDate, item.endDate)

                    return (
                      <div key={item.cartItemId} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={thumbnailImage?.url || product?.images?.[0]?.url || "/images/image.png"}
                            alt={product?.name || `상품 #${item.productId}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold mb-1">{product?.name || `상품 #${item.productId}`}</p>
                          <p className="text-sm text-muted-foreground mb-1">
                            {item.startDate} ~ {item.endDate} ({days}일)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ₩{pricePerDay.toLocaleString()} x {days}일 = ₩{(pricePerDay * days).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
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

                <Button className="w-full h-11 rounded-lg" size="lg" onClick={handleReservation}>
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
