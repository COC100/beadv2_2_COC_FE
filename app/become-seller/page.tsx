"use client"

import type React from "react"
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
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Store, DollarSign, Shield, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sellerAPI } from "@/lib/api"
import { handlePhoneInput } from "@/lib/utils"

export default function BecomeSellerPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    businessNumber: "",
    phone: "",
    email: "",
    description: "",
  })
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreed) {
      toast({
        title: "약관 동의 필요",
        description: "판매자 약관에 동의해주세요",
        variant: "destructive",
      })
      return
    }

    setShowConfirmDialog(true)
  }

  const handleConfirmedSubmit = async () => {
    setIsLoading(true)
    setShowConfirmDialog(false)
    try {
      console.log("[v0] Submitting seller registration:", {
        storeName: formData.businessName,
        bizRegNo: formData.businessNumber || undefined,
        storePhone: formData.phone || undefined,
      })

      const response = await sellerAPI.register({
        storeName: formData.businessName,
        bizRegNo: formData.businessNumber || undefined,
        storePhone: formData.phone || undefined,
      })

      console.log("[v0] Seller registration response:", response)

      if (response.data && typeof response.data === "string" && response.data.length > 0) {
        localStorage.setItem("accessToken", response.data)
        console.log("[v0] Updated accessToken after seller registration")
      }

      toast({
        title: "판매자 신청 완료",
        description: "판매자 등록이 완료되었습니다",
      })

      setTimeout(() => {
        router.push("/seller")
      }, 500)
    } catch (error: any) {
      console.error("[v0] Seller registration failed:", error)
      toast({
        title: "판매자 신청 실패",
        description: error.message || "판매자 등록에 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    {
      icon: Store,
      title: "쉬운 상품 등록",
      description: "간단한 절차로 상품을 등록하고 관리할 수 있습니다",
      color: "text-blue-500",
    },
    {
      icon: DollarSign,
      title: "합리적인 수수료",
      description: "업계 최저 수준의 수수료로 더 많은 수익을 창출하세요",
      color: "text-emerald-500",
    },
    {
      icon: Shield,
      title: "안전한 거래",
      description: "예치금 시스템으로 안전하게 거래할 수 있습니다",
      color: "text-purple-500",
    },
    {
      icon: TrendingUp,
      title: "매출 분석",
      description: "실시간으로 매출과 렌탈 현황을 확인할 수 있습니다",
      color: "text-orange-500",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-balance">Modi 판매자로 시작하세요</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            사용하지 않는 전자기기를 등록하고 안정적인 수익을 창출할 수 있습니다
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {benefits.map((benefit, index) => (
            <Card key={index} className="rounded-2xl border-2 hover:border-primary/30 transition-all hover:shadow-xl">
              <CardContent className="p-6 text-center">
                <div
                  className={`w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 ${benefit.color}`}
                >
                  <benefit.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">판매자 신청하기</CardTitle>
              <CardDescription>아래 정보를 입력하여 판매자로 등록하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    상호명 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    placeholder="테크렌탈샵"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessNumber">
                    사업자등록번호 <span className="text-muted-foreground text-sm">(선택)</span>
                  </Label>
                  <Input
                    id="businessNumber"
                    placeholder="123-45-67890"
                    value={formData.businessNumber}
                    onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    연락처 <span className="text-muted-foreground text-sm">(선택)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: handlePhoneInput(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    이메일 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seller@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    사업 소개 <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="판매하실 전자기기와 사업에 대해 간단히 소개해주세요"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
                  <label
                    htmlFor="terms"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    판매자 약관 및 수수료 정책에 동의합니다
                  </label>
                </div>
                <Button type="submit" className="w-full h-12 text-lg rounded-xl" disabled={!agreed || isLoading}>
                  {isLoading ? "신청 중..." : "판매자 신청하기"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>판매자로 등록하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              판매자 등록을 진행합니다. 등록 후 상품을 등록하고 판매할 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit} className="rounded-xl">
              등록하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  )
}
