"use client"

import type React from "react"

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
import { MapPin, Calendar, CreditCard, AlertCircle, Plus, Edit2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { handlePhoneInput } from "@/lib/utils"

export default function RentalApplicationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [product, setProduct] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  })
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [addressFormData, setAddressFormData] = useState({
    name: "",
    recipient: "",
    phone: "",
    address: "",
    detailAddress: "",
    zipCode: "",
  })

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
        const [productResponse, addressResponse] = await Promise.all([
          productAPI.getDetail(Number(productId)),
          memberAPI.getAddresses(),
        ])

        setProduct(productResponse.data)
        const addressData = addressResponse.data
        setAddresses(Array.isArray(addressData) ? addressData : addressData?.addressList || [])

        // Select default address
        const addressesArray = Array.isArray(addressData) ? addressData : addressData?.addressList || []
        const defaultAddr = addressesArray.find((a: any) => a.isDefault)
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

    const confirmed = window.confirm("렌탈 신청을 하시겠습니까?")
    if (!confirmed) return

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
      let errorTitle = "렌탈 신청 실패"
      let errorMessage = error.message || "렌탈 신청에 실패했습니다"

      // Parse specific error scenarios
      if (errorMessage.includes("겹치") || errorMessage.includes("예약 불가") || errorMessage.includes("기간")) {
        errorTitle = "날짜 중복"
        errorMessage = "선택하신 기간에 이미 예약이 있어 렌탈이 불가능합니다. 다른 날짜를 선택해주세요."
      } else if (errorMessage.includes("재고") || errorMessage.includes("수량")) {
        errorTitle = "재고 부족"
        errorMessage = "현재 재고가 부족하여 렌탈이 불가능합니다. 다른 상품을 선택해주세요."
      } else if (errorMessage.includes("예치금") || errorMessage.includes("잔액")) {
        errorTitle = "예치금 부족"
        errorMessage = "예치금이 부족합니다. 예치금을 충전한 후 다시 시도해주세요."
      } else if (errorMessage.includes("상품") && errorMessage.includes("없")) {
        errorTitle = "상품 없음"
        errorMessage = "해당 상품을 찾을 수 없습니다. 상품이 삭제되었거나 판매가 중단되었을 수 있습니다."
      } else if (errorMessage.includes("권한") || errorMessage.includes("허용")) {
        errorTitle = "권한 없음"
        errorMessage = "렌탈 신청 권한이 없습니다. 로그인 상태를 확인해주세요."
      }

      // Show error dialog
      setErrorDialog({
        open: true,
        title: errorTitle,
        message: errorMessage,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    setAddressFormData({
      name: "",
      recipient: "",
      phone: "",
      address: "",
      detailAddress: "",
      zipCode: "",
    })
    setIsAddressDialogOpen(true)
  }

  const handleEditAddress = (address: any) => {
    setEditingAddress(address)
    setAddressFormData({
      name: address.addressLabel || "",
      recipient: address.recipientName || "",
      phone: address.recipientPhone || "",
      address: address.roadAddress || "",
      detailAddress: address.detailAddress || "",
      zipCode: address.postcode || "",
    })
    setIsAddressDialogOpen(true)
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingAddress) {
        await memberAPI.updateAddress(editingAddress.addressId, {
          addressLabel: addressFormData.name,
          recipientName: addressFormData.recipient,
          recipientPhone: addressFormData.phone,
          postcode: addressFormData.zipCode,
          roadAddress: addressFormData.address,
          detailAddress: addressFormData.detailAddress,
          isDefault: editingAddress.isDefault,
          type: "MEMBER",
        })
        toast({
          title: "주소 수정 완료",
          description: "주소가 성공적으로 수정되었습니다",
        })
      } else {
        await memberAPI.createAddress({
          addressLabel: addressFormData.name,
          recipientName: addressFormData.recipient,
          recipientPhone: addressFormData.phone,
          postcode: addressFormData.zipCode,
          roadAddress: addressFormData.address,
          detailAddress: addressFormData.detailAddress,
          isDefault: addresses.length === 0,
          type: "MEMBER",
        })
        toast({
          title: "주소 추가 완료",
          description: "주소가 성공적으로 추가되었습니다",
        })
      }

      const addressResponse = await memberAPI.getAddresses()
      const addressData = addressResponse.data
      setAddresses(Array.isArray(addressData) ? addressData : addressData?.addressList || [])

      setIsAddressDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "주소 저장 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

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
        setAddressFormData({
          ...addressFormData,
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  배송지 선택
                </h2>
                <Button variant="outline" size="sm" onClick={handleAddAddress} className="rounded-lg bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  주소 추가
                </Button>
              </div>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditAddress(address)}
                      className="rounded-lg"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
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

      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "주소 수정" : "주소 추가"}</DialogTitle>
            <DialogDescription>배송받을 주소 정보를 입력하세요</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddressSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">주소지 이름 *</Label>
              <Input
                id="name"
                placeholder="예: 집, 회사"
                value={addressFormData.name}
                onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">받는 사람 *</Label>
              <Input
                id="recipient"
                placeholder="이름"
                value={addressFormData.recipient}
                onChange={(e) => setAddressFormData({ ...addressFormData, recipient: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">연락처 *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-0000-0000"
                value={addressFormData.phone}
                onChange={(e) => setAddressFormData({ ...addressFormData, phone: handlePhoneInput(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">우편번호 *</Label>
              <div className="flex gap-2">
                <Input
                  id="zipCode"
                  placeholder="12345"
                  value={addressFormData.zipCode}
                  onChange={(e) => setAddressFormData({ ...addressFormData, zipCode: e.target.value })}
                  required
                  readOnly
                />
                <Button type="button" variant="outline" onClick={handlePostcodeSearch}>
                  우편번호 찾기
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">주소 *</Label>
              <Input
                id="address"
                placeholder="도로명 주소"
                value={addressFormData.address}
                onChange={(e) => setAddressFormData({ ...addressFormData, address: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="detailAddress">상세 주소 *</Label>
              <Input
                id="detailAddress"
                placeholder="동/호수"
                value={addressFormData.detailAddress}
                onChange={(e) => setAddressFormData({ ...addressFormData, detailAddress: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingAddress ? "수정하기" : "추가하기"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsAddressDialogOpen(false)} className="flex-1">
                취소
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {errorDialog.title}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">{errorDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorDialog({ ...errorDialog, open: false })}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
