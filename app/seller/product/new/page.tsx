"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, X } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewProductPage() {
  const [images, setImages] = useState<string[]>([])

  const categories = [
    { value: "LAPTOP", label: "노트북" },
    { value: "DESKTOP", label: "데스크톱" },
    { value: "CAMERA", label: "카메라" },
    { value: "TABLET", label: "태블릿" },
    { value: "MOBILE", label: "모바일" },
    { value: "MONITOR", label: "모니터" },
    { value: "ACCESSORY", label: "액세서리" },
    { value: "DRONE", label: "드론" },
    { value: "AUDIO", label: "오디오" },
    { value: "PROJECTOR", label: "프로젝터" },
  ]

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

        <h1 className="text-3xl font-bold mb-8">상품 등록</h1>

        <div className="max-w-3xl">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="productName">
                  상품명 <span className="text-red-500">*</span>
                </Label>
                <Input id="productName" placeholder="예: MacBook Pro 16인치 M3" className="rounded-lg" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  카테고리 <span className="text-red-500">*</span>
                </Label>
                <Select required>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerDay">
                  1일 대여 가격 <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input id="pricePerDay" type="number" placeholder="25000" className="rounded-lg" required />
                  <span className="text-sm text-muted-foreground">원</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  상세 설명 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="상품의 상세 정보를 입력하세요"
                  rows={5}
                  className="rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  상품 이미지 <span className="text-red-500">*</span>
                </Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">클릭하거나 이미지를 드래그하여 업로드</p>
                  <p className="text-xs text-muted-foreground">최대 5장, JPG, PNG 형식 (각 10MB 이하)</p>
                </div>
                {images.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mt-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`상품 이미지 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => setImages(images.filter((_, i) => i !== index))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 rounded-lg h-11" size="lg">
                  등록하기
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
