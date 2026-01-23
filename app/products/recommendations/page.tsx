"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { aiAPI } from "@/lib/api-extensions"
import { useRequireAuth } from "@/hooks/use-auth"
import { Sparkles, Search } from "lucide-react"
import { useSearchParams, Suspense } from "next/navigation"
import Loading from "./loading"

export default function ProductRecommendationsPage() {
  useRequireAuth()

  const searchParams = useSearchParams()
  const queryParam = searchParams.get("query") || ""
  const { toast } = useToast()
  const [query, setQuery] = useState(queryParam)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "검색어 입력",
        description: "추천받고 싶은 상황이나 용도를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await aiAPI.getRecommendations({
        query: query.trim(),
        size: 12,
      })
      setRecommendations(response.data.items)
      setMessage(response.data.message)
      toast({
        title: "추천 완료",
        description: "상황에 맞는 상품을 찾았습니다.",
      })
    } catch (error: any) {
      console.error("[v0] Failed to get recommendations:", error)
      toast({
        title: "추천 실패",
        description: error.message || "상품 추천에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI 상품 추천
          </h1>
          <p className="text-muted-foreground">
            원하는 상황이나 용도를 자연어로 입력하면 AI가 최적의 상품을 추천해드립니다.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="예: 유튜브 영상 촬영에 필요한 카메라 추천해줘"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "검색 중..." : "추천 받기"}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>추천 예시:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>유튜브 영상 촬영에 필요한 장비</li>
                  <li>재택근무용 모니터와 노트북 추천</li>
                  <li>여행 사진 촬영에 좋은 카메라</li>
                  <li>게임 스트리밍을 위한 PC 구성</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-900">{message}</p>
          </div>
        )}

        <Suspense fallback={<Loading />}>
          {recommendations.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">추천 상품 ({recommendations.length}개)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendations.map((item) => (
                  <Link key={item.productId} href={`/products/${item.productId}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardContent className="p-4 flex flex-col h-full">
                        <div className="mb-3">
                          <Badge className="bg-blue-100 text-primary hover:bg-blue-100 mb-2">
                            {item.category}
                          </Badge>
                          {item.status === "ACTIVE" && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 ml-2">
                              예약 가능
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.name}</h3>
                        {item.specs && Object.keys(item.specs).length > 0 && (
                          <div className="text-sm text-muted-foreground mb-3 flex-1">
                            {Object.entries(item.specs)
                              .slice(0, 2)
                              .map(([key, value]) => (
                                <div key={key} className="truncate">
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </div>
                              ))}
                          </div>
                        )}
                        <div className="mt-auto">
                          <Button variant="outline" className="w-full bg-transparent">
                            상세보기
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!loading && recommendations.length === 0 && query && (
            <div className="text-center py-12 text-muted-foreground">
              추천할 상품이 없습니다. 다른 검색어로 시도해보세요.
            </div>
          )}
        </Suspense>
      </div>

      <Footer />
    </div>
  )
}
