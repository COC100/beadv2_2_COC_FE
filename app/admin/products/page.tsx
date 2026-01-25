"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adminAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Search, Package, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { useSearchParams } from "next/navigation"

type ProductModerationStatus = "PENDING" | "CLEAR" | "REVIEW" | "BLOCKED"
type ProductStatus = "ACTIVE" | "INACTIVE" | "DELETE"

interface ProductModeration {
  productId: number
  name: string
  sellerId: number
  status: ProductStatus
  moderationStatus: ProductModerationStatus
  createdAt: string
}

const moderationStatusLabels: Record<ProductModerationStatus, string> = {
  PENDING: "검수 대기",
  CLEAR: "승인",
  REVIEW: "재검토",
  BLOCKED: "차단",
}

const moderationStatusColors: Record<ProductModerationStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CLEAR: "bg-green-100 text-green-800",
  REVIEW: "bg-orange-100 text-orange-800",
  BLOCKED: "bg-red-100 text-red-800",
}

const productStatusLabels: Record<ProductStatus, string> = {
  ACTIVE: "활성",
  INACTIVE: "비활성",
  DELETE: "삭제",
}

export default function AdminProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<ProductModeration[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [moderationStatus, setModerationStatus] = useState<string>("PENDING")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const result = await adminAPI.getProductModerations({
        moderationStatus,
        page,
        size: 20,
        sort: "createdAt,asc",
      })

      if (result.data) {
        setProducts(result.data.content || [])
        setTotalPages(result.data.totalPages || 0)
        setTotalElements(result.data.totalElements || 0)
      }
    } catch (error: any) {
      console.error("Failed to fetch products:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [page, moderationStatus])

  const handleCreateModerationRequest = async (productId: number) => {
    try {
      await adminAPI.createProductModerationRequest(productId)
      toast({
        title: "검수 요청 생성",
        description: "상품 검수 요청이 생성되었습니다.",
      })
      fetchProducts()
    } catch (error: any) {
      toast({
        title: "요청 실패",
        description: error.message || "검수 요청 생성에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleApproveModeration = async (productId: number) => {
    try {
      await adminAPI.approveProductModeration(productId)
      toast({
        title: "승인 완료",
        description: "상품이 승인되었습니다.",
      })
      fetchProducts()
    } catch (error: any) {
      toast({
        title: "승인 실패",
        description: error.message || "상품 승인에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Package className="h-8 w-8" />
              상품 관리
            </h1>
            <p className="text-muted-foreground">상품 검수 요청을 관리합니다</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>상품 검수 목록</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="상품명으로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={moderationStatus} onValueChange={setModerationStatus}>
                  <SelectTrigger className="w-full sm:w-48 bg-white">
                    <SelectValue placeholder="검수 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">검수 대기</SelectItem>
                    <SelectItem value="CLEAR">승인</SelectItem>
                    <SelectItem value="REVIEW">재검토</SelectItem>
                    <SelectItem value="BLOCKED">차단</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">검수 요청이 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>상품 ID</TableHead>
                          <TableHead>상품명</TableHead>
                          <TableHead>판매자 ID</TableHead>
                          <TableHead>상품 상태</TableHead>
                          <TableHead>검수 상태</TableHead>
                          <TableHead>등록일</TableHead>
                          <TableHead className="text-right">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.productId}>
                            <TableCell className="font-medium">{product.productId}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.sellerId}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{productStatusLabels[product.status]}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={moderationStatusColors[product.moderationStatus]}>
                                {moderationStatusLabels[product.moderationStatus]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(product.createdAt), "yyyy-MM-dd HH:mm", { locale: ko })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(`/products/${product.productId}`, "_blank")}
                                  className="bg-transparent"
                                >
                                  상세보기
                                </Button>
                                {product.moderationStatus === "REVIEW" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveModeration(product.productId)}
                                    className="bg-green-600 text-white hover:bg-green-700"
                                  >
                                    승인
                                  </Button>
                                )}
                                {product.moderationStatus === "PENDING" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleCreateModerationRequest(product.productId)}
                                    className="bg-primary text-primary-foreground"
                                  >
                                    검수 요청
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      총 {totalElements}건 중 {page * 20 + 1}-{Math.min((page + 1) * 20, totalElements)}건
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 0}
                        className="bg-transparent"
                      >
                        이전
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages - 1}
                        className="bg-transparent"
                      >
                        다음
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
