"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Star, Package } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { sellerAPI, productAPI, reviewAPI } from "@/lib/api"

export default function SellerProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [seller, setSeller] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewSummary, setReviewSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sellerId, setSellerId] = useState<number | null>(null)
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set())

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await Promise.resolve(params)
        const id = Number(resolvedParams.id)

        if (isNaN(id)) {
          throw new Error("잘못된 판매자 ID입니다")
        }

        setSellerId(id)
      } catch (error) {
        toast({
          title: "페이지 로딩 실패",
          description: "판매자 정보를 불러올 수 없습니다",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    resolveParams()
  }, [params, toast])

  useEffect(() => {
    if (sellerId === null) return

    const loadSellerProfile = async () => {
      try {
        // Load seller info
        const sellerResponse = await sellerAPI.getInfo(sellerId)
        setSeller(sellerResponse.data)

        const productsResponse = await productAPI.list({ sellerId, size: 20 })
        setProducts(productsResponse.data.products || [])

        // Load seller reviews
        const reviewsResponse = await reviewAPI.list(sellerId)
        setReviews(reviewsResponse.data || [])

        // Load review summary
        try {
          const summaryResponse = await reviewAPI.getSummary(sellerId)
          setReviewSummary(summaryResponse.data)
        } catch (error) {
          console.log("[v0] No review summary available")
        }
      } catch (error: any) {
        console.error("[v0] Failed to load seller profile:", error)
        toast({
          title: "판매자 정보 로딩 실패",
          description: error.message || "판매자 정보를 불러올 수 없습니다",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadSellerProfile()
  }, [sellerId, toast])

  const toggleReview = (reviewId: number) => {
    const newExpanded = new Set(expandedReviews)
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId)
    } else {
      newExpanded.add(reviewId)
    }
    setExpandedReviews(newExpanded)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR")
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

  if (!seller) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>판매자를 찾을 수 없습니다</p>
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
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          상품 목록으로
        </Link>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{seller.storeName}</h1>
                {seller.bizRegNo && <p className="text-muted-foreground text-sm mb-2">사업자번호: {seller.bizRegNo}</p>}
                {seller.storePhone && <p className="text-muted-foreground text-sm">연락처: {seller.storePhone}</p>}
              </div>
              {reviewSummary && (
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{reviewSummary.averageRating?.toFixed(1) || "0.0"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">리뷰 {reviewSummary.reviewCount || 0}개</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">판매 상품</h2>
          </div>
          {products.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">등록된 상품이 없습니다</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.productId} href={`/products/${product.productId}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                    <CardContent className="pt-0 pb-4 px-0">
                      <div className="aspect-square bg-gray-50 mb-3 overflow-hidden">
                        <img
                          src={product.thumbnailUrl || "/images/image.png"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/images/image.png"
                          }}
                        />
                      </div>
                      <div className="px-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-bold">₩{product.pricePerDay?.toLocaleString()}/일</span>
                          {product.status === "ACTIVE" ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">예약 가능</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">예약 불가</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">고객 리뷰</h2>
          </div>
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">작성된 리뷰가 없습니다</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
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
                    <div>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
