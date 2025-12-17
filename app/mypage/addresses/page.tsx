"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, MapPin, Plus, Edit2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { memberAPI } from "@/lib/api"
import { handlePhoneInput } from "@/lib/utils"

interface Address {
  id: number
  addressId: number
  name: string
  recipient: string
  phone: string
  address: string
  detailAddress: string
  zipCode: string
  isDefault: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    recipient: "",
    phone: "",
    address: "",
    detailAddress: "",
    zipCode: "",
  })

  useEffect(() => {
    const loadAddresses = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push("/intro")
        return
      }

      try {
        const response = await memberAPI.getAddresses()
        console.log("[v0] Address API response:", response)

        const addressData = response.data
        const addressList = Array.isArray(addressData) ? addressData : []

        if (!Array.isArray(addressList)) {
          console.error("[v0] Invalid address list format:", addressList)
          setAddresses([])
          return
        }

        const mappedAddresses = addressList.map((addr: any) => ({
          id: addr.addressId || 0,
          addressId: addr.addressId || 0,
          name: addr.addressLabel || "",
          recipient: addr.recipientName || "",
          phone: addr.recipientPhone || "",
          address: addr.roadAddress || "",
          detailAddress: addr.detailAddress || "",
          zipCode: addr.postcode || "",
          isDefault: addr.isDefault || false,
        }))
        console.log("[v0] Loaded addresses with addressId:", mappedAddresses)
        setAddresses(mappedAddresses)
      } catch (error: any) {
        console.error("[v0] Failed to load addresses:", error)
        if (error.message.includes("401") || error.message.includes("인증")) {
          router.push("/intro")
        } else {
          toast({
            title: "주소 로딩 실패",
            description: error.message || "주소 목록을 불러오는데 실패했습니다",
            variant: "destructive",
          })
        }
        setAddresses([])
      } finally {
        setIsLoading(false)
      }
    }

    loadAddresses()
  }, [router, toast])

  const handleAddAddress = () => {
    setEditingAddress(null)
    setFormData({
      name: "",
      recipient: "",
      phone: "",
      address: "",
      detailAddress: "",
      zipCode: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      name: address.name,
      recipient: address.recipient,
      phone: address.phone,
      address: address.address,
      detailAddress: address.detailAddress,
      zipCode: address.zipCode,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const action = editingAddress ? "수정" : "추가"
    const confirmResult = await new Promise<boolean>((resolve) => {
      const confirmed = window.confirm(`주소를 ${action}하시겠습니까?`)
      resolve(confirmed)
    })

    if (!confirmResult) return

    try {
      if (editingAddress) {
        await memberAPI.updateAddress(editingAddress.addressId, {
          addressLabel: formData.name,
          recipientName: formData.recipient,
          recipientPhone: formData.phone,
          postcode: formData.zipCode,
          roadAddress: formData.address,
          detailAddress: formData.detailAddress,
          isDefault: editingAddress.isDefault,
          type: "MEMBER",
        })
        toast({
          title: "주소 수정 완료",
          description: "주소가 성공적으로 수정되었습니다",
        })
      } else {
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
        toast({
          title: "주소 추가 완료",
          description: "주소가 성공적으로 추가되었습니다",
        })
      }

      const response = await memberAPI.getAddresses()
      const addressData = response.data
      const addressList = Array.isArray(addressData) ? addressData : []

      if (Array.isArray(addressList)) {
        const mappedAddresses = addressList.map((addr: any) => ({
          id: addr.addressId || 0,
          addressId: addr.addressId || 0,
          name: addr.addressLabel || "",
          recipient: addr.recipientName || "",
          phone: addr.recipientPhone || "",
          address: addr.roadAddress || "",
          detailAddress: addr.detailAddress || "",
          zipCode: addr.postcode || "",
          isDefault: addr.isDefault || false,
        }))
        setAddresses(mappedAddresses)
      }
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("[v0] Failed to save address:", error)
      toast({
        title: "주소 저장 실패",
        description: error.message || "주소 저장에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAddress = async (addressId: number) => {
    try {
      await memberAPI.deleteAddress(addressId)
      const response = await memberAPI.getAddresses()
      const addressData = response.data
      const addressList = Array.isArray(addressData) ? addressData : []

      if (Array.isArray(addressList)) {
        const mappedAddresses = addressList.map((addr: any) => ({
          id: addr.addressId || 0,
          addressId: addr.addressId || 0,
          name: addr.addressLabel || "",
          recipient: addr.recipientName || "",
          phone: addr.recipientPhone || "",
          address: addr.roadAddress || "",
          detailAddress: addr.detailAddress || "",
          zipCode: addr.postcode || "",
          isDefault: addr.isDefault || false,
        }))
        setAddresses(mappedAddresses)
      }
      toast({
        title: "주소 삭제 완료",
        description: "주소가 성공적으로 삭제되었습니다",
      })
    } catch (error: any) {
      console.error("[v0] Failed to delete address:", error)
      toast({
        title: "주소 삭제 실패",
        description: error.message || "주소 삭제에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const handleSetDefault = async (addressId: number) => {
    try {
      console.log("[v0] Setting default address with addressId:", addressId)
      const address = addresses.find((a) => a.addressId === addressId)
      if (!address) {
        throw new Error("주소를 찾을 수 없습니다")
      }

      await memberAPI.updateAddress(addressId, {
        addressLabel: address.name,
        recipientName: address.recipient,
        recipientPhone: address.phone,
        postcode: address.zipCode,
        roadAddress: address.address,
        detailAddress: address.detailAddress,
        isDefault: true,
        type: "MEMBER",
      })

      const response = await memberAPI.getAddresses()
      const addressData = response.data
      const addressList = Array.isArray(addressData) ? addressData : []

      if (Array.isArray(addressList)) {
        const mappedAddresses = addressList.map((addr: any) => ({
          id: addr.addressId || 0,
          addressId: addr.addressId || 0,
          name: addr.addressLabel || "",
          recipient: addr.recipientName || "",
          phone: addr.recipientPhone || "",
          address: addr.roadAddress || "",
          detailAddress: addr.detailAddress || "",
          zipCode: addr.postcode || "",
          isDefault: addr.isDefault || false,
        }))
        setAddresses(mappedAddresses)
      }
      toast({
        title: "대표 주소 설정 완료",
        description: "대표 주소지가 변경되었습니다",
      })
    } catch (error: any) {
      console.error("[v0] Failed to set default address:", error)
      toast({
        title: "설정 실패",
        description: error.message || "대표 주소 설정에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const handlePostcodeSearch = () => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/mypage"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            마이페이지로 돌아가기
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">주소지 관리</h1>
              <p className="text-muted-foreground text-lg">배송받을 주소지를 관리하세요</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddAddress} className="rounded-xl h-12">
                  <Plus className="h-4 w-4 mr-2" />
                  주소 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle>{editingAddress ? "주소 수정" : "주소 추가"}</DialogTitle>
                  <DialogDescription>배송받을 주소 정보를 입력하세요</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">주소지 이름 *</Label>
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
                    <Label htmlFor="recipient">받는 사람 *</Label>
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
                    <Label htmlFor="phone">연락처 *</Label>
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
                    <Label htmlFor="zipCode">우편번호 *</Label>
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
                    <Label htmlFor="address">주소 *</Label>
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
                    <Label htmlFor="detailAddress">상세 주소 *</Label>
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
                      {editingAddress ? "수정하기" : "추가하기"}
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
        </div>

        <div className="space-y-4">
          {addresses.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="p-12 text-center">
                <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">등록된 주소가 없습니다</h3>
                <p className="text-muted-foreground mb-6">새로운 배송 주소를 추가해보세요</p>
                <Button onClick={handleAddAddress} className="rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  주소 추가
                </Button>
              </CardContent>
            </Card>
          ) : (
            addresses.map((address) => (
              <Card key={address.addressId} className="rounded-2xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-xl">{address.name}</CardTitle>
                        {address.isDefault && (
                          <Badge variant="default" className="mt-2 rounded-full">
                            대표 주소지
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditAddress(address)}
                        className="rounded-xl"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>주소를 삭제하시겠습니까?</AlertDialogTitle>
                            <AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAddress(address.addressId)}
                              className="rounded-xl bg-destructive hover:bg-destructive/90"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex text-sm">
                    <span className="text-muted-foreground w-24">받는 사람</span>
                    <span className="font-medium">{address.recipient}</span>
                  </div>
                  <div className="flex text-sm">
                    <span className="text-muted-foreground w-24">연락처</span>
                    <span className="font-medium">{address.phone}</span>
                  </div>
                  <div className="flex text-sm">
                    <span className="text-muted-foreground w-24">주소</span>
                    <span className="font-medium">
                      ({address.zipCode}) {address.address} {address.detailAddress}
                    </span>
                  </div>
                  {!address.isDefault && (
                    <div className="pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.addressId)}
                        className="rounded-xl"
                      >
                        대표 주소지로 설정
                      </Button>
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
