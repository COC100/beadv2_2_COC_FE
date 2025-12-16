"use client"
import Link from "next/link"
import { Plus, Package, DollarSign, Edit, ChevronLeft, ChevronRight, Receipt } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { sellerAPI, productAPI } from "@/lib/api"
import { getUserRoleFromToken } from "@/lib/utils"

export default function SellerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [sellerInfo, setSellerInfo] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLastPage, setIsLastPage] = useState(false)
  const [statusChanging, setStatusChanging] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    const loadSellerData = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push("/intro")
        return
      }

      const userRole = getUserRoleFromToken()
      if (userRole === "MEMBER") {
        router.push("/become-seller")
        return
      }

      try {
        const sellerResponse = await sellerAPI.getSelf()
        console.log("[v0] Seller API response:", sellerResponse)
        setSellerInfo(sellerResponse.data)

        try {
          const productsResponse = await productAPI.getSellerProducts({
            page: currentPage,
            size: 20,
            sort: "createdAt,desc",
          })
          console.log("[v0] Products API response:", productsResponse)
          const productsData = productsResponse.data
          setProducts(productsData.content || [])
          setTotalProducts(productsData.totalElements || 0)
          setTotalPages(productsData.totalPages || 0)
          setIsLastPage(productsData.last || false)
        } catch (productError) {
          console.error("[v0] Failed to load products (non-critical):", productError)
          setProducts([])
          setTotalProducts(0)
        }

        setIsLoading(false)
      } catch (error: any) {
        console.error("[v0] Failed to load seller data:", error)
        if (error.message.includes("404") || error.message.includes("Not Found") || error.message.includes("403")) {
          router.push("/become-seller")
        } else if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          router.push("/intro")
        } else {
          setIsLoading(false)
          setProducts([])
        }
      }
    }

    loadSellerData()
  }, [router, currentPage])

  const handleToggleStatus = async (productId: number, currentStatus: string) => {
    setStatusChanging((prev) => ({ ...prev, [productId]: true }))

    try {
      console.log("[v0] Toggling product status:", { productId, currentStatus })

      if (currentStatus === "ACTIVE") {
        await productAPI.deactivate(productId)
        toast({
          title: "상태 변경 완료",
          description: "상품이 예약 불가 상태로 변경되었습니다",
        })
      } else {
        await productAPI.activate(productId)
        toast({
          title: "상태 변경 완료",
          description: "상품이 예약 가능 상태로 변경되었습니다",
        })
      }

      const productsResponse = await productAPI.getSellerProducts({
        page: currentPage,
        size: 20,
        sort: "createdAt,desc",
      })

      console.log("[v0] Fetched products after status change:", productsResponse)

      // fetchAPI returns { data, headers }, so extract data.content
      const productsData = productsResponse.data
      setProducts(productsData?.content || [])
      setTotalPages(productsData?.totalPages || 0)
      setTotalProducts(productsData?.totalElements || 0)
    } catch (error: any) {
      console.error("[v0] Failed to toggle product status:", error)
      toast({
        title: "상태 변경 실패",
        description: error.message || "상품 상태 변경에 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setStatusChanging((prev) => ({ ...prev, [productId]: false }))
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      PENDING: { text: "승인 대기", className: "bg-yellow-100 text-yellow-800" },
      APPROVED: { text: "승인 완료", className: "bg-green-100 text-green-800" },
      REJECTED: { text: "거절", className: "bg-red-100 text-red-800" },
      ACTIVE: { text: "활성화", className: "bg-green-100 text-green-800" },
      INACTIVE: { text: "비활성화", className: "bg-gray-100 text-gray-800" },
    }
    return statusMap[status] || { text: status, className: "" }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  const monthlySettlement = 0

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">판매자 페이지</h1>
            <div className="flex gap-2">
              <Link href="/seller/settlements">
                <Button variant="outline" className="rounded-lg bg-transparent">
                  <Receipt className="h-4 w-4 mr-2" />
                  정산
                </Button>
              </Link>
              <Link href="/seller/product/new">
                <Button className="rounded-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  상품 등록
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">판매 상품</p>
                  <p className="text-2xl font-bold">{totalProducts}개</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">이번달 정산 예정</p>
                  <p className="text-2xl font-bold">₩{monthlySettlement.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products">판매 상품</TabsTrigger>
            <TabsTrigger value="settings">판매자 정보</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {products.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">등록된 상품이 없습니다</p>
                  <Link href="/seller/product/new">
                    <Button className="rounded-lg">
                      <Plus className="h-4 w-4 mr-2" />첫 상품 등록하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {products.map((product) => (
                  <Card key={product.productId}>
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={product.thumbnailUrl || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold mb-1">{product.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-accent text-white hover:bg-accent">
                                  ₩{product.pricePerDay?.toLocaleString()}/일
                                </Badge>
                                <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"}>
                                  {product.status === "ACTIVE" ? "예약 가능" : "예약 불가"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/seller/product/${product.productId}/edit`}>
                                <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                                  <Edit className="h-4 w-4 mr-1" />
                                  수정
                                </Button>
                              </Link>
                              <Link href={`/products/${product.productId}`}>
                                <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                                  보기
                                </Button>
                              </Link>
                              <Button
                                variant={product.status === "ACTIVE" ? "outline" : "default"}
                                size="sm"
                                className="rounded-lg"
                                onClick={() => handleToggleStatus(product.productId, product.status)}
                                disabled={statusChanging[product.productId]}
                              >
                                {statusChanging[product.productId]
                                  ? "변경 중..."
                                  : product.status === "ACTIVE"
                                    ? "예약 불가로 변경"
                                    : "예약 가능으로 변경"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="rounded-lg bg-transparent"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      이전
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentPage + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={isLastPage}
                      className="rounded-lg bg-transparent"
                    >
                      다음
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">판매자 정보</h2>
                {sellerInfo && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">스토어명</p>
                      <p className="font-medium">{sellerInfo.storeName}</p>
                    </div>
                    {sellerInfo.bizRegNo && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">사업자등록번호</p>
                        <p className="font-medium">{sellerInfo.bizRegNo}</p>
                      </div>
                    )}
                    {sellerInfo.storePhone && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">연락처</p>
                        <p className="font-medium">{sellerInfo.storePhone}</p>
                      </div>
                    )}
                    <div className="pt-4">
                      <Link href="/seller/settings">
                        <Button variant="outline" className="rounded-lg bg-transparent">
                          정보 수정
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
