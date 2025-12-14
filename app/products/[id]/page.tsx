"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Calendar, Edit, Eye, EyeOff, Trash2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { productAPI, cartAPI, sellerAPI } from "@/lib/api"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    params.then((p) => setResolvedParams(p))
  }, [params])

  if (!resolvedParams) return <div>Loading...</div>

  return <ProductDetailContent id={resolvedParams.id} />
}

function ProductDetailContent({ id }: { id: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const loadProduct = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          router.push("/intro")
          return
        }
      }

      try {
        const productData = await productAPI.getDetail(Number(id))
        setProduct(productData)

        try {
          const seller = await sellerAPI.getSelf()
          setIsOwner(seller.id === productData.sellerId)
        } catch (error) {
          setIsOwner(false)
        }
      } catch (error: any) {
        console.error("[v0] Failed to load product:", error)
        toast({
          title: "상품 로딩 실패",
          description: error.message || "상품 정보를 불러올 수 없습니다",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id, router, toast])

  const calculateTotal = () => {
    if (!startDate || !endDate || !product) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days * product.pricePerDay : 0
  }

  const totalPrice = calculateTotal()
  const rentalDays =
    startDate && endDate
      ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0

  const handleAddToCart = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "날짜를 선택해주세요",
        description: "대여 시작일과 종료일을 선택해주세요",
        variant: "destructive",
      })
      return
    }

    try {
      await cartAPI.addItem({
        productId: Number(id),
        startDate,
        endDate,
      })
      toast({
        title: "장바구니에 추가되었습니다",
        description: "장바구니에서 확인하실 수 있습니다",
      })
    } catch (error: any) {
      toast({
        title: "장바구니 추가 실패",
        description: error.message || "장바구니에 추가할 수 없습니다",
        variant: "destructive",
      })
    }
  }

  const handleRentalApplication = () => {
    if (!startDate || !endDate) {
      toast({
        title: "날짜를 선택해주세요",
        description: "대여 시작일과 종료일을 선택해주세요",
        variant: "destructive",
      })
      return
    }

    // Navigate to new rental application page with params
    router.push(`/rental-application?productId=${id}&startDate=${startDate}&endDate=${endDate}`)
  }

  const handleStatusChange = async (status: "ACTIVE" | "INACTIVE") => {
    try {
      if (status === "ACTIVE") {
        await productAPI.activate(Number(id))
      } else {
        await productAPI.deactivate(Number(id))
      }
      toast({
        title: "상태 변경 완료",
        description: `상품이 ${status === "ACTIVE" ? "활성화" : "비활성화"}되었습니다`,
      })
      // Reload product
      const updated = await productAPI.getDetail(Number(id))
      setProduct(updated)
    } catch (error: any) {
      toast({
        title: "상태 변경 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return

    try {
      await productAPI.delete(Number(id))
      toast({
        title: "상품 삭제 완료",
        description: "상품이 삭제되었습니다",
      })
      router.push("/seller")
    } catch (error: any) {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      })
    }
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

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>상품을 찾을 수 없습니다</p>
        </div>
        <Footer />
      </div>
    )
  }

  const images =
    product.images && product.images.length > 0
      ? product.images.map((img: any) => img.url)
      : ["/abstract-geometric-shapes.png"]

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

        {isOwner && (
          <div className="flex gap-2 mb-6">
            <Link href={`/seller/product/${id}/edit`}>
              <Button variant="outline" className="rounded-lg bg-transparent">
                <Edit className="h-4 w-4 mr-2" />
                상품 수정
              </Button>
            </Link>
            {product.status === "ACTIVE" ? (
              <Button
                variant="outline"
                className="rounded-lg bg-transparent"
                onClick={() => handleStatusChange("INACTIVE")}
              >
                <EyeOff className="h-4 w-4 mr-2" />
                숨김
              </Button>
            ) : (
              <Button
                variant="outline"
                className="rounded-lg bg-transparent"
                onClick={() => handleStatusChange("ACTIVE")}
              >
                <Eye className="h-4 w-4 mr-2" />
                활성화
              </Button>
            )}
            <Button variant="destructive" className="rounded-lg" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={images[currentImageIndex] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 4).map((image: string, index: number) => (
                  <div
                    key={index}
                    className={`aspect-square bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:opacity-70 transition-opacity border-2 ${
                      currentImageIndex === index ? "border-primary" : "border-gray-200"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
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
                  ₩{product.pricePerDay.toLocaleString()}
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
                        {product.pricePerDay.toLocaleString()}원 x {rentalDays}일
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
                  <Button
                    className="flex-1 rounded-lg h-11"
                    disabled={!startDate || !endDate}
                    onClick={handleRentalApplication}
                  >
                    렌탈 신청
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!startDate || !endDate}
                    className="rounded-lg h-11 px-4 bg-transparent"
                    onClick={handleAddToCart}
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
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
