"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SellerSettingsPage() {
  const [storeName, setStoreName] = useState("테크렌탈샵")
  const [businessNumber, setBusinessNumber] = useState("123-45-67890")
  const [storePhone, setStorePhone] = useState("02-1234-5678")

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
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="02-1234-5678"
                  className="rounded-lg"
                />
                <p className="text-xs text-muted-foreground">스토어 연락처는 선택사항입니다</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 rounded-lg h-11" size="lg">
                  저장하기
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
