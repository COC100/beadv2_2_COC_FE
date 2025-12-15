"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { sellerAPI } from "@/lib/api"
import { handlePhoneInput } from "@/lib/utils"

export default function SellerSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [storeName, setStoreName] = useState("")
  const [businessNumber, setBusinessNumber] = useState("")
  const [storePhone, setStorePhone] = useState("")
  const [currentStatus, setCurrentStatus] = useState("ACTIVE")

  useEffect(() => {
    const loadSellerInfo = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push("/intro")
        return
      }

      try {
        const seller = await sellerAPI.getSelf()
        setStoreName(seller.storeName || "")
        setBusinessNumber(seller.bizRegNo || "")
        setStorePhone(seller.storePhone || "")
        setCurrentStatus(seller.status || "ACTIVE")
      } catch (error: any) {
        console.error("[v0] Failed to load seller info:", error)
        toast({
          title: "로딩 실패",
          description: "판매자 정보를 불러오는데 실패했습니다",
          variant: "destructive",
        })
        if (error.message.includes("404")) {
          router.push("/become-seller")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadSellerInfo()
  }, [router, toast])

  const handleSave = async () => {
    if (!storeName.trim()) {
      toast({
        title: "입력 오류",
        description: "스토어명을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await sellerAPI.updateSelf({
        storeName: storeName.trim(),
        bizRegNo: businessNumber.trim() || undefined,
        storePhone: storePhone.trim() || undefined,
        status: currentStatus,
      })

      toast({
        title: "저장 완료",
        description: "판매자 정보가 수정되었습니다",
      })

      router.push("/seller")
    } catch (error: any) {
      console.error("[v0] Failed to update seller info:", error)
      toast({
        title: "저장 실패",
        description: error.message || "판매자 정보 수정에 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
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

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/seller"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          판매자 페이지로
        </Link>

        <h1 className="text-3xl font-bold mb-8">판매자 정보 수정</h1>

        <div className="max-w-2xl">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="storeName">
                  스토어명 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="스토어명을 입력하세요"
                  className="rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessNumber">사업자등록번호 (선택)</Label>
                <Input
                  id="businessNumber"
                  value={businessNumber}
                  onChange={(e) => setBusinessNumber(e.target.value)}
                  placeholder="123-45-67890"
                  className="rounded-lg"
                />
                <p className="text-xs text-muted-foreground">사업자등록번호는 선택사항입니다</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storePhone">스토어 연락처 (선택)</Label>
                <Input
                  id="storePhone"
                  value={storePhone}
                  onChange={(e) => setStorePhone(handlePhoneInput(e.target.value))}
                  placeholder="02-1234-5678"
                  className="rounded-lg"
                />
                <p className="text-xs text-muted-foreground">스토어 연락처는 선택사항입니다</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 rounded-lg h-11" size="lg" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "저장 중..." : "저장하기"}
                </Button>
                <Link href="/seller" className="flex-1">
                  <Button variant="outline" className="w-full rounded-lg h-11 bg-transparent" size="lg">
                    취소
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
