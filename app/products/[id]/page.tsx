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

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [productId, setProductId] = useState<number | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await Promise.resolve(params)
        const id = Number(resolvedParams.id)

        console.log("[v0 DEBUG] Resolved product ID:", id)

        if (isNaN(id)) {
          throw new Error("잘못된 상품 ID입니다")
        }

        setProductId(id)
      } catch (error) {
        console.error("[v0 DEBUG] Failed to resolve params:", error)
        toast({
          title: "페이지 로딩 실패",
          description: "상품 정보를 불러올 수 없습니다",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    resolveParams()
  }, [params, toast])

  useEffect(() => {
    if (productId === null) return

    const loadProduct = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          router.push("/intro")
          return
        }
      }

      try {
        console.log("[v0 DEBUG] Loading product ID:", productId)

        const productData = await productAPI.getDetail(productId)
        console.log("[v0 DEBUG] Raw product data:", JSON.stringify(productData, null, 2))

        if (!productData) {
          throw new Error("상품 데이터를 불러올 수 없습니다")
        }

        setProduct(productData)

        // Check if user is seller/owner
        try {
          const seller = await sellerAPI.getSelf()
          console.log("[v0 DEBUG] Seller data:", JSON.stringify(seller, null, 2))
          const isProductOwner = seller?.sellerId === productData?.sellerId
          console.log(
            "[v0 DEBUG] Is owner?",
            isProductOwner,
            "Seller ID:",
            seller?.sellerId,
            "Product Seller ID:",
            productData?.sellerId,
          )
          setIsOwner(isProductOwner)
        } catch (error) {
          console.log("[v0 DEBUG] Not a seller or seller check failed:", error)
          setIsOwner(false)
        }
      } catch (error: any) {
        console.error("[v0 DEBUG] Failed to load product:", error)
        console.error("[v0 DEBUG] Error stack:", error.stack)
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
  }, [productId, router, toast])

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
    if (!productId || !startDate || !endDate) {
      toast({
        title: "날짜를 선택해주세요",
        description: "대여 시작일과 종료일을 선택해주세요",
        variant: "destructive",
      })
      return
    }

    const requestData = {
      productId: productId,
      startDate,
      endDate,
    }
    console.log("[v0] Cart add request:", requestData)

    try {
      await cartAPI.addItem(requestData)
      toast({
        title: "장바구니에 추가되었습니다",
        description: "장바구니에서 확인하실 수 있습니다",
      })
    } catch (error: any) {
      console.error("[v0] Failed to add to cart:", error)
      const errorMessage =
        error.message?.includes("Service Unavailable") || error.message?.includes("503")
          ? "대여 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요."
          : error.message || "장바구니에 추가할 수 없습니다"

      toast({
        title: "장바구니 추가 실패",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleRentalApplication = () => {
    if (!productId || !startDate || !endDate) {
      toast({
        title: "날짜를 선택해주세요",
        description: "대여 시작일과 종료일을 선택해주세요",
        variant: "destructive",
      })
      return
    }

    router.push(`/rental-application?productId=${productId}&startDate=${startDate}&endDate=${endDate}`)
  }

  const handleStatusChange = async (status: "ACTIVE" | "INACTIVE") => {
    if (!productId) return

    try {
      if (status === "ACTIVE") {
        await productAPI.activate(productId)
      } else {
        await productAPI.deactivate(productId)
      }
      toast({
        title: "상태 변경 완료",
        description: `상품이 ${status === "ACTIVE" ? "활성화" : "비활성화"}되었습니다`,
      })
      const updated = await productAPI.getDetail(productId)
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
    if (!productId) return

    if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return

    try {
      await productAPI.delete(productId)
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
            <Link href={`/seller/product/${productId}/edit`}>
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
                예약 불가로 변경
              </Button>
            ) : (
              <Button
                variant="outline"
                className="rounded-lg bg-transparent"
                onClick={() => handleStatusChange("ACTIVE")}
              >
                <Eye className="h-4 w-4 mr-2" />
                예약 가능으로 변경
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
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-blue-100 text-primary hover:bg-blue-100">{product.category}</Badge>
                {product.status === "ACTIVE" ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">예약 가능</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">예약 불가</Badge>
                )}
              </div>
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
