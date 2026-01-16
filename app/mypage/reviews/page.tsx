"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Star, Edit, Trash2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { reviewAPI } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function MyReviewsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set())
  const [editDialog, setEditDialog] = useState<{ open: boolean; review: any }>({ open: false, review: null })
  const [editRating, setEditRating] = useState(5)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await reviewAPI.myReviews()
        setReviews(response.data || [])
      } catch (error: any) {
        console.error("[v0] Failed to load reviews:", error)
        toast({
          title: "리뷰 조회 실패",
          description: error.message || "리뷰를 불러올 수 없습니다",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [toast])

  const toggleReview = (reviewId: number) => {
    const newExpanded = new Set(expandedReviews)
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId)
    } else {
      newExpanded.add(reviewId)
    }
    setExpandedReviews(newExpanded)
  }

  const handleEdit = (review: any) => {
    setEditRating(review.rating)
    setEditContent(review.content)
    setEditDialog({ open: true, review })
  }

  const handleSaveEdit = async () => {
    if (!editDialog.review) return

    try {
      await reviewAPI.update(editDialog.review.reviewId, {
        rating: editRating,
        content: editContent,
      })

      toast({
        title: "리뷰 수정 완료",
        description: "리뷰가 수정되었습니다",
      })

      setEditDialog({ open: false, review: null })
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "리뷰 수정 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!confirm("정말 이 리뷰를 삭제하시겠습니까?")) return

    try {
      await reviewAPI.delete(reviewId)
      toast({
        title: "리뷰 삭제 완료",
        description: "리뷰가 삭제되었습니다",
      })
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "리뷰 삭제 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>로딩 중...</p>
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
          href="/mypage"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          마이페이지로
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">내 리뷰 관리</h1>
          <p className="text-muted-foreground">작성한 리뷰를 확인하고 수정하세요</p>
        </div>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">작성한 리뷰가 없습니다</p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.reviewId}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{review.rating}.0</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="mb-3">
                    <p
                      className={`text-muted-foreground leading-relaxed ${
                        !expandedReviews.has(review.reviewId) ? "line-clamp-3" : ""
                      }`}
                    >
                      {review.content}
                    </p>
                    {review.content && review.content.length > 150 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-primary"
                        onClick={() => toggleReview(review.reviewId)}
                      >
                        {expandedReviews.has(review.reviewId) ? "접기" : "전체보기"}
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg bg-transparent"
                      onClick={() => handleEdit(review)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-lg"
                      onClick={() => handleDelete(review.reviewId)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>리뷰 수정</DialogTitle>
            <DialogDescription>리뷰 내용을 수정하세요</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">평점</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} type="button" onClick={() => setEditRating(value)} className="focus:outline-none">
                    <Star
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        value <= editRating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-semibold">{editRating}.0</span>
              </div>
            </div>
            <div>
              <Label htmlFor="editContent" className="mb-2 block">
                리뷰 내용
              </Label>
              <Textarea
                id="editContent"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[150px] rounded-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, review: null })}>
              취소
            </Button>
            <Button onClick={handleSaveEdit}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
