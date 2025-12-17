"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { productAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRequireAuth } from "@/hooks/use-auth"

const CATEGORIES = [
  { value: "ALL", label: "전체" },
  { value: "LAPTOP", label: "노트북" },
  { value: "DESKTOP", label: "데스크탑" },
  { value: "CAMERA", label: "카메라" },
  { value: "TABLET", label: "태블릿" },
  { value: "MOBILE", label: "모바일" },
  { value: "MONITOR", label: "모니터" },
  { value: "ACCESSORY", label: "액세서리" },
  { value: "DRONE", label: "드론" },
  { value: "AUDIO", label: "오디오" },
  { value: "PROJECTOR", label: "프로젝터" },
]

export default function ProductsPage() {
  useRequireAuth()

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("LATEST")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const categoryParam = searchParams.get("category")
    if (categoryParam && CATEGORIES.some((c) => c.value === categoryParam)) {
      fetchProductsWithParams("", "LATEST")
    } else {
      fetchProductsWithParams("", "LATEST")
    }
  }, [])

  const fetchProductsWithParams = async (keyword: string, sort: string, cursor?: string) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push("/intro")
        return
      }
    }

    if (loading) return

    try {
      setLoading(true)
      const params: any = {
        sortType: sort,
        size: 20,
      }

      if (cursor) params.cursor = cursor
      if (keyword) params.keyword = keyword

      const response = await productAPI.list(params)
      const data = response.data
      console.log("[v0] Products response:", data)

      const activeProducts = (data.products || []).filter((product: any) => product.status === "ACTIVE")

      if (cursor) {
        setProducts((prev) => [...prev, ...activeProducts])
      } else {
        setProducts(activeProducts)
      }

      setNextCursor(data.nextCursor)
      setHasNext(data.hasNext)
    } catch (error: any) {
      console.error("[v0] Failed to fetch products:", error)
      toast({
        title: "상품 로딩 실패",
        description: error.message || "상품 목록을 불러올 수 없습니다",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = useCallback(
    async (cursor?: string) => {
      await fetchProductsWithParams(searchQuery, sortBy, cursor)
    },
    [searchQuery, sortBy],
  )

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loading && nextCursor) {
          fetchProducts(nextCursor)
        }
      },
      { threshold: 0.1 },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [hasNext, loading, nextCursor, fetchProducts])

  const handleSearch = () => {
    setProducts([])
    setNextCursor(null)
    setHasNext(true)
    fetchProductsWithParams(searchQuery, sortBy)
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setSortBy("LATEST")
    setProducts([])
    setNextCursor(null)
    setHasNext(true)
    fetchProductsWithParams("", "LATEST")
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">전체 상품</h1>
            <p className="text-muted-foreground">필요한 전자기기를 찾아보세요</p>
          </div>
        </div>
      </section>

      <section className="border-b bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LATEST">최신순</SelectItem>
                  <SelectItem value="OLDEST">오래된순</SelectItem>
                  <SelectItem value="PRICE_HIGH">가격 높은 순</SelectItem>
                  <SelectItem value="PRICE_LOW">가격 낮은 순</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="상품명을 검색하세요"
                  className="pl-10 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <Button onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" />
                검색
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm text-muted-foreground">
                총 {products.length}개의 상품{hasNext && " (더 보기 가능)"}
              </p>
            </div>
          </div>

          {products.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <Link key={product.productId} href={`/products/${product.productId}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow group border-gray-200">
                      <div className="aspect-square overflow-hidden bg-gray-50 relative">
                        <img
                          src={product.thumbnailUrl || "/images/image.png"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground mb-1">
                          {CATEGORIES.find((c) => c.value === product.category)?.label || product.category}
                        </p>
                        <h3 className="font-medium text-sm mb-2 line-clamp-2 leading-tight">{product.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-accent text-white hover:bg-accent text-xs font-bold">
                            ₩{product.pricePerDay.toLocaleString()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">/일</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {hasNext && (
                <div ref={loadMoreRef} className="text-center py-8">
                  {loading && <p className="text-muted-foreground">로딩 중...</p>}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
