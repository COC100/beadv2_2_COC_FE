"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Star } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { reviewAPI } from "@/lib/api"

export default function ReviewCreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [rentalItemId, setRentalItemId] = useState<number | null>(null)
  const [productInfo, setProductInfo] = useState<any>(null)

  useEffect(() => {
    const itemId = searchParams.get("rentalItemId")
    if (itemId) {
      setRentalItemId(Number(itemId))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rentalItemId) {
      toast({
        title: "오류",
        description: "렌탈 정보를 찾을 수 없습니다",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "내용을 입력하세요",
        description: "리뷰 내용을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Note: sellerId needs to be fetched from rental item data
      // For now, using a placeholder. In production, you'd fetch this from rental API
      const sellerId = productInfo?.sellerId || 0

      await reviewAPI.create({
        rentalItemId,
        sellerId,
        rating,
        content: content.trim(),
      })

      toast({
        title: "리뷰 작성 완료",
        description: "리뷰가 성공적으로 등록되었습니다",
      })

      router.push("/mypage/rentals")
    } catch (error: any) {
      console.error("[v0] Failed to create review:", error)
      toast({
        title: "리뷰 작성 실패",
        description: error.message || "리뷰를 작성할 수 없습니다",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/mypage/rentals"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          렌탈 내역으로
        </Link>

        <h1 className="text-3xl font-bold mb-8">후기 작성</h1>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="mb-2 block">평점</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} type="button" onClick={() => setRating(value)} className="focus:outline-none">
                      <Star
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                          value <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-lg font-semibold">{rating}.0</span>
                </div>
              </div>

              <div>
                <Label htmlFor="content" className="mb-2 block">
                  리뷰 내용
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="상품과 판매자에 대한 솔직한 후기를 남겨주세요"
                  className="min-h-[200px] rounded-lg"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 rounded-lg">
                  취소
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 rounded-lg">
                  {loading ? "등록 중..." : "리뷰 등록"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
