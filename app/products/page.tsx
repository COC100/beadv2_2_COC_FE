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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, SlidersHorizontal, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { productAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [sortBy, setSortBy] = useState("LATEST")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const categoryParam = searchParams.get("category")
    if (categoryParam && CATEGORIES.some((c) => c.value === categoryParam)) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  const fetchProducts = useCallback(
    async (cursor?: string) => {
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
          sortType: sortBy,
          size: 20,
        }

        if (cursor) params.cursor = cursor
        if (searchQuery) params.keyword = searchQuery
        if (selectedCategory !== "ALL") params.category = selectedCategory
        if (minPrice) params.minPrice = Number(minPrice)
        if (maxPrice) params.maxPrice = Number(maxPrice)
        if (startDate) params.startDate = format(startDate, "yyyy-MM-dd")
        if (endDate) params.endDate = format(endDate, "yyyy-MM-dd")

        const response = await productAPI.list(params)

        if (cursor) {
          setProducts((prev) => [...prev, ...(response.products || [])])
        } else {
          setProducts(response.products || [])
        }

        setNextCursor(response.nextCursor)
        setHasNext(response.hasNext)
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
    },
    [searchQuery, selectedCategory, sortBy, minPrice, maxPrice, startDate, endDate, router, toast, loading],
  )

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, selectedCategory, sortBy, minPrice, maxPrice, startDate, endDate])

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

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("ALL")
    setSortBy("LATEST")
    setMinPrice("")
    setMaxPrice("")
    setStartDate(undefined)
    setEndDate(undefined)
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
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="상품명을 검색하세요"
                  className="pl-10 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4" />
                필터
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-white rounded-lg border p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Sort */}
                  <div className="space-y-2">
                    <Label>정렬</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LATEST">최신순</SelectItem>
                        <SelectItem value="OLDEST">오래된순</SelectItem>
                        <SelectItem value="PRICE-HIGH">가격 높은순</SelectItem>
                        <SelectItem value="PRICE-LOW">가격 낮은순</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label>카테고리</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <Label>최소 가격</Label>
                    <Input
                      type="number"
                      placeholder="최소 금액"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>최대 가격</Label>
                    <Input
                      type="number"
                      placeholder="최대 금액"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Rental Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>대여 시작일</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP", { locale: ko }) : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>대여 종료일</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP", { locale: ko }) : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) => (startDate ? date < startDate : false)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleResetFilters}>
                    초기화
                  </Button>
                </div>
              </div>
            )}
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">카테고리:</span>
              <span className="font-medium">{CATEGORIES.find((c) => c.value === selectedCategory)?.label}</span>
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
                          src={product.thumbnailUrl || "/placeholder.svg?height=300&width=300&query=no+image"}
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
