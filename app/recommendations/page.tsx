"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sparkles, Search, ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { productAPI } from "@/lib/api"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CATEGORIES = [
  { value: "ALL", label: "전체" },
  { value: "CAMERA", label: "카메라" },
  { value: "LAPTOP", label: "노트북" },
  { value: "TABLET", label: "태블릿" },
  { value: "DRONE", label: "드론" },
  { value: "AUDIO", label: "오디오" },
  { value: "OTHER", label: "기타" },
]

export default function RecommendationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("ALL")
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check for authentication token
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        setShowLoginDialog(true)
        return
      }
    }

    if (!query.trim()) {
      toast({
        title: "검색어를 입력하세요",
        description: "상황이나 필요한 제품을 자세히 설명해주세요",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await productAPI.getRecommendations({
        query: query.trim(),
        size: 12,
      })

      setMessage(response.data.message || "")
      const items = response.data.items || []

      if (items.length > 0) {
        const productIds = items.map((item: any) => item.productId)
        const bulkResponse = await productAPI.bulkGet(productIds)
        const productsData = bulkResponse.data || []
        
        let activeProducts = productsData.filter((product: any) => product.status === "ACTIVE")
        
        // Filter by category if not ALL
        if (category !== "ALL") {
          activeProducts = activeProducts.filter((product: any) => product.category === category)
        }
        
        setRecommendations(activeProducts)
      } else {
        setRecommendations([])
      }
    } catch (error: any) {
      console.error("[v0] Failed to get recommendations:", error)
      toast({
        title: "추천 실패",
        description: error.message || "상품 추천에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
      setRecommendations([])
      setMessage("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginClick = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로 돌아가기
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-3">AI 상품 추천</h1>
            <p className="text-muted-foreground">
              필요한 상황이나 제품을 설명하면 AI가 최적의 상품을 추천해드립니다
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px] h-12 rounded-xl">
                    <SelectValue placeholder="카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="예: 여행용 카메라가 필요해요, 프레젠테이션용 노트북 추천해주세요"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="rounded-xl pr-10 h-12"
                    disabled={isLoading}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                <Button type="submit" size="lg" className="rounded-xl gap-2 h-12 px-6" disabled={isLoading}>
                  <Sparkles className="h-5 w-5" />
                  {isLoading ? "검색 중..." : "추천 받기"}
                </Button>
              </div>
            </div>
          </form>

          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">AI가 최적의 상품을 찾고 있습니다...</p>
            </div>
          )}

          {!isLoading && hasSearched && (
            <>
              {message && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-900 dark:text-blue-100">{message}</p>
                </div>
              )}

              {recommendations.length > 0 ? (
                <div>
                  <h2 className="text-xl font-bold mb-4">추천 상품 ({recommendations.length}개)</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {recommendations.map((product) => (
                      <Link key={product.productId} href={`/products/${product.productId}`}>
                        <Card className="hover:shadow-lg transition-shadow group border-gray-200 pt-0 pb-4 px-0 overflow-hidden">
                          <div className="aspect-square bg-gray-50 relative">
                            <img
                              src={product.thumbnailUrl || "/images/image.png"}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/images/image.png"
                              }}
                            />
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-medium text-sm mb-2 line-clamp-2 leading-tight">{product.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="bg-accent text-white hover:bg-accent text-xs font-bold"
                              >
                                ₩{product.pricePerDay?.toLocaleString()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">/일</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">추천할 상품이 없습니다</p>
                  <p className="text-sm text-muted-foreground">다른 검색어로 다시 시도해주세요</p>
                </div>
              )}
            </>
          )}

          {!hasSearched && !isLoading && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 text-center">
              <h3 className="font-semibold mb-4">이렇게 검색해보세요</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setQuery("여행용 카메라가 필요해요")}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  "여행용 카메라가 필요해요"
                </button>
                <button
                  type="button"
                  onClick={() => setQuery("재택근무용 노트북 추천해주세요")}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  "재택근무용 노트북 추천해주세요"
                </button>
                <button
                  type="button"
                  onClick={() => setQuery("영상 편집에 좋은 장비가 필요합니다")}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  "영상 편집에 좋은 장비가 필요합니다"
                </button>
                <button
                  type="button"
                  onClick={() => setQuery("고성능 태블릿을 빌리고 싶어요")}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  "고성능 태블릿을 빌리고 싶어요"
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>로그인이 필요합니다</AlertDialogTitle>
            <AlertDialogDescription>로그인 후 이용 가능합니다</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLoginDialog(false)} className="rounded-xl">
              취소
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLoginClick} className="rounded-xl">
              로그인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
