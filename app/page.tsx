"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Camera,
  Laptop,
  Tablet,
  Headphones,
  ChevronRight,
  Package,
  Shield,
  Clock,
  ChevronLeft,
  Monitor,
  Smartphone,
  Projector,
  Glasses,
  Cpu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { productAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRequireAuth } from "@/hooks/use-auth"

export default function HomePage() {
  useRequireAuth()

  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "필요한 순간만",
      highlight: "스마트하게 렌탈",
      description: "최신 전자기기를 합리적인 가격에\n원하는 기간만큼 이용하세요",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      image: "/modern-laptop-workspace.jpg",
    },
    {
      title: "최신 기기를",
      highlight: "부담 없이 경험",
      description: "고가의 전자제품도\n렌탈로 부담 없이 사용해보세요",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      image: "/professional-camera-equipment.jpg",
    },
    {
      title: "안전한 거래",
      highlight: "신뢰할 수 있는 플랫폼",
      description: "예치금 시스템으로\n안전하고 편리한 렌탈 경험을 제공합니다",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      image: "/secure-tablet-device.jpg",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken")
        setIsAuthenticated(!!token)
        return !!token
      }
      return false
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)
        const authenticated = checkAuth()

        const response = await productAPI.list({ size: 8, sortType: "LATEST" })
        console.log("[v0] Products API response:", response)

        const productsData = response.data?.products || []
        console.log("[v0] Products data:", productsData)

        const activeProducts = productsData.filter((product: any) => product.status === "ACTIVE")
        setProducts(activeProducts)
      } catch (error: any) {
        console.error("[v0] Failed to fetch products:", error)

        if (error.message?.includes("인증")) {
          console.log("[v0] Product list requires authentication, showing empty state")
          setProducts([])
        } else {
          toast({
            title: "상품 로딩 실패",
            description: "상품 목록을 불러올 수 없습니다.",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [router, toast])

  const categories = [
    { name: "노트북", icon: Laptop, category: "LAPTOP" },
    { name: "데스크탑", icon: Cpu, category: "DESKTOP" },
    { name: "카메라", icon: Camera, category: "CAMERA" },
    { name: "태블릿", icon: Tablet, category: "TABLET" },
    { name: "모바일", icon: Smartphone, category: "MOBILE" },
    { name: "모니터", icon: Monitor, category: "MONITOR" },
    { name: "액세서리", icon: Glasses, category: "ACCESSORY" },
    { name: "드론", icon: Package, category: "DRONE" },
    { name: "오디오", icon: Headphones, category: "AUDIO" },
    { name: "프로젝터", icon: Projector, category: "PROJECTOR" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <section className="relative overflow-hidden">
        <div className="relative h-[500px] md:h-[600px]">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              } ${slide.bgColor}`}
            >
              <div className="container mx-auto px-4 py-16 md:py-24 h-full">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center h-full">
                  <div className="z-10">
                    <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">전자기기 렌탈 플랫폼</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                      {slide.title}
                      <br />
                      <span className="text-primary">{slide.highlight}</span>
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed whitespace-pre-line">
                      {slide.description}
                    </p>
                    <div className="flex gap-3">
                      {isAuthenticated ? (
                        <Link href="/products">
                          <Button size="lg" className="rounded-lg">
                            상품 둘러보기
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/intro">
                          <Button size="lg" className="rounded-lg">
                            시작하기
                          </Button>
                        </Link>
                      )}
                      <Link href="/seller">
                        <Button size="lg" variant="outline" className="rounded-lg bg-white/80">
                          판매자 되기
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="relative">
                    <img
                      src={slide.image || "/placeholder.svg"}
                      alt={slide.title}
                      className="w-full h-auto drop-shadow-2xl rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 p-2 rounded-full shadow-lg transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 dark:text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 p-2 rounded-full shadow-lg transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 dark:text-white" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? "w-8 bg-primary" : "w-2 bg-white/60 dark:bg-gray-400/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 border-b dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-4 md:gap-6">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Link
                  key={category.name}
                  href={`/products?category=${category.category}`}
                  className="flex flex-col items-center gap-2 group hover:text-primary transition-colors"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-center">{category.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">인기 상품</h2>
            <Link href="/products" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
              전체보기
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">상품을 불러올 수 없습니다</p>
              {!isAuthenticated && (
                <Link href="/intro">
                  <Button>로그인하여 상품 보기</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
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
                        <Badge variant="secondary" className="bg-accent text-white hover:bg-accent text-xs font-bold">
                          ₩{product.pricePerDay?.toLocaleString()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">/일</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-10 text-center">Modi만의 장점</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">다양한 제품</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                최신 전자기기부터 전문 장비까지 다양한 제품을 만나보세요
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">안전한 거래</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                예치금 시스템으로 안전하게 거래하고 보상받으세요
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">간편한 이용</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                원하는 기간만큼 빌려 쓰고 반납하는 간편한 프로세스
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-white dark:bg-primary/90">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">판매자로 수익 창출하기</h2>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            사용하지 않는 전자기기를 Modi에 등록하고 수익을 만들어보세요
          </p>
          <Link href="/seller">
            <Button size="lg" variant="secondary" className="rounded-lg">
              판매자 시작하기
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
