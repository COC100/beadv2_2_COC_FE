"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Calendar } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { productAPI, cartAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProductDetailContent id={id} />
}

function ProductDetailContent({ id }: { id: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productAPI.getDetail(Number(id))
        if (response.success && response.data) {
          setProduct(response.data)
        } else {
          toast({
            variant: "destructive",
            title: "상품 없음",
            description: "상품을 찾을 수 없습니다.",
          })
          router.push("/products")
        }
      } catch (error) {
        console.error("[v0] Failed to fetch product:", error)
        toast({
          variant: "destructive",
          title: "오류 발생",
          description: "상품 정보를 불러오는데 실패했습니다.",
        })
        router.push("/products")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const calculateTotal = () => {
    if (!startDate || !endDate || !product) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days * product.price : 0
  }

  const handleAddToCart = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "대여 기간 선택",
        description: "대여 기간을 선택해주세요.",
      })
      return
    }

    try {
      const response = await cartAPI.addItem({
        productId: Number(id),
        startDate,
        endDate,
      })

      if (response.success) {
        toast({
          title: "장바구니 추가",
          description: "장바구니에 추가되었습니다.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "추가 실패",
          description: "장바구니 추가에 실패했습니다.",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to add to cart:", error)
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "장바구니 추가에 실패했습니다.",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">상품 정보를 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return null
  }

  const totalPrice = calculateTotal()
  const rentalDays =
    startDate && endDate
      ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={product.thumbnailUrl || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.imageUrls && product.imageUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {product.imageUrls.slice(0, 4).map((image: string, index: number) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:opacity-70 transition-opacity border border-gray-200"
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-3 bg-blue-100 text-primary hover:bg-blue-100">{product.category}</Badge>
              <h1 className="text-3xl font-bold mb-3 leading-tight">{product.name}</h1>
              <div className="flex items-baseline gap-2 mb-6">
                <Badge className="bg-accent text-white hover:bg-accent text-lg font-bold px-3 py-1">
                  ₩{product.price?.toLocaleString()}
                </Badge>
                <span className="text-muted-foreground">/일</span>
              </div>
            </div>

            <Card className="border-2">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  대여 기간 선택
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="startDate" className="text-sm mb-2">
                      시작일
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-sm mb-2">
                      종료일
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split("T")[0]}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {rentalDays > 0 && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {product.price.toLocaleString()}원 x {rentalDays}일
                      </span>
                      <span className="font-medium">₩{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>총 금액</span>
                      <span className="text-primary">₩{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 rounded-lg h-11" disabled={!startDate || !endDate}>
                    렌탈 신청
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAddToCart}
                    disabled={!startDate || !endDate}
                    className="rounded-lg h-11 px-4 bg-transparent"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">상품 설명</h2>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
