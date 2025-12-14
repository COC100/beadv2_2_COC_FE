"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Calendar, Star, MapPin, Edit } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { productAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return <ProductDetailContent id={params.id} />
}

function ProductDetailContent({ id }: { id: string }) {
  const { toast } = useToast()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const isOwner = false

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await productAPI.getDetail(Number(id))
        setProduct(response.data)
      } catch (error) {
        console.error("[v0] Failed to fetch product:", error)
        toast({
          variant: "destructive",
          title: "상품 조회 실패",
          description: "상품 정보를 불러올 수 없습니다.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">상품 정보를 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">상품을 찾을 수 없습니다.</p>
        </div>
        <Footer />
      </div>
    )
  }

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0
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

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      ACTIVE: { text: "활성화", color: "bg-green-100 text-green-800" },
      INACTIVE: { text: "비활성화", color: "bg-gray-100 text-gray-800" },
      DELETED: { text: "삭제됨", color: "bg-red-100 text-red-800" },
    }
    return statusMap[status] || { text: status, color: "" }
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
            <Select defaultValue={product.status}>
              <SelectTrigger className="w-40 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">활성화</SelectItem>
                <SelectItem value="INACTIVE">비활성화</SelectItem>
                <SelectItem value="DELETED">삭제</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((image, index) => (
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
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-3 bg-blue-100 text-primary hover:bg-blue-100">{product.category}</Badge>
              <h1 className="text-3xl font-bold mb-3 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.seller.rating}</span>
                  <span className="text-muted-foreground">({product.seller.reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{product.seller.location}</span>
                </div>
              </div>
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
                  <Button className="flex-1 rounded-lg h-11" disabled={!startDate || !endDate}>
                    렌탈 신청
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!startDate || !endDate}
                    className="rounded-lg h-11 px-4 bg-transparent"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">판매자 정보</h3>
                <div className="space-y-2">
                  <p className="font-medium text-lg">{product.seller.name}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{product.seller.rating}</span>
                    </div>
                    <span className="text-muted-foreground">리뷰 {product.seller.reviews}개</span>
                  </div>
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

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">상세 사양</h2>
              <ul className="space-y-2">
                {product.specs.map((spec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm">{spec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
