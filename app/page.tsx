"use client"

import { useEffect } from "react"

import { useState } from "react"

import Link from "next/link"
import { Camera, Laptop, Tablet, Headphones, ChevronRight, Package, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { productAPI } from "@/lib/api"

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.list({ size: 8 })
        if (response.success && response.data) {
          setProducts(response.data.content || [])
        }
      } catch (error) {
        console.error("[v0] Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const categories = [
    { name: "노트북", icon: Laptop, href: "/products?category=LAPTOP" },
    { name: "카메라", icon: Camera, href: "/products?category=CAMERA" },
    { name: "태블릿", icon: Tablet, href: "/products?category=TABLET" },
    { name: "오디오", icon: Headphones, href: "/products?category=AUDIO" },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative bg-blue-50 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">전자기기 렌탈 플랫폼</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                필요한 순간만
                <br />
                <span className="text-primary">스마트하게 렌탈</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                최신 전자기기를 합리적인 가격에
                <br />
                원하는 기간만큼 이용하세요
              </p>
              <div className="flex gap-3">
                <Link href="/products">
                  <Button size="lg" className="rounded-lg">
                    상품 둘러보기
                  </Button>
                </Link>
                <Link href="/become-seller">
                  <Button size="lg" variant="outline" className="rounded-lg bg-transparent">
                    판매자 되기
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img src="/macbook-pro-laptop.png" alt="MacBook Pro" className="w-full h-auto drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-8 md:gap-16">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="flex flex-col items-center gap-2 group hover:text-primary transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <category.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            ))}
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

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">상품을 불러오는 중...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow group border-gray-200">
                    <div className="aspect-square overflow-hidden bg-gray-50 relative">
                      {product.badge && (
                        <Badge className="absolute top-2 left-2 z-10 bg-primary text-white text-xs">
                          {product.badge}
                        </Badge>
                      )}
                      <img
                        src={product.thumbnailUrl || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                      <h3 className="font-medium text-sm mb-2 line-clamp-2 leading-tight">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-accent text-white hover:bg-accent text-xs font-bold">
                          ₩{product.price?.toLocaleString()}
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

      <section className="py-16 bg-gray-50">
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

      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">판매자로 수익 창출하기</h2>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            사용하지 않는 전자기기를 Modi에 등록하고 수익을 만들어보세요
          </p>
          <Link href="/become-seller">
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
