"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { sellerAPI } from "@/lib/api"
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, DollarSign } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function SettlementsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [settlements, setSettlements] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [periodYm, setPeriodYm] = useState("")
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null)
  const [settlementLines, setSettlementLines] = useState<any[]>([])
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  const loadSettlements = async (page: number, period?: string) => {
    try {
      setIsLoading(true)
      const params: any = { page, size: 10 }
      if (period) params.periodYm = period

      const response = await sellerAPI.getSettlements(params)
      setSettlements(response.content || [])
      setTotalPages(response.totalPages || 0)
      setTotalElements(response.totalElements || 0)
      setCurrentPage(page)
    } catch (error: any) {
      toast({
        title: "정산 목록 조회 실패",
        description: error.message || "정산 목록을 불러오는데 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadSettlementDetail = async (sellerSettlementId: number) => {
    try {
      const [detail, lines] = await Promise.all([
        sellerAPI.getSettlementDetail(sellerSettlementId),
        sellerAPI.getSettlementLines(sellerSettlementId),
      ])
      setSelectedSettlement(detail)
      setSettlementLines(lines || [])
      setShowDetailDialog(true)
    } catch (error: any) {
      toast({
        title: "정산 상세 조회 실패",
        description: error.message || "정산 상세 정보를 불러오는데 실패했습니다",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      router.push("/intro")
      return
    }

    loadSettlements(0)
  }, [])

  const handleSearch = () => {
    if (periodYm && !/^\d{4}-\d{2}$/.test(periodYm)) {
      toast({
        title: "입력 오류",
        description: "yyyy-MM 형식으로 입력해주세요 (예: 2025-01)",
        variant: "destructive",
      })
      return
    }
    loadSettlements(0, periodYm)
  }

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      loadSettlements(currentPage - 1, periodYm)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      loadSettlements(currentPage + 1, periodYm)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      READY: { text: "대기", className: "bg-yellow-100 text-yellow-800" },
      PAID: { text: "완료", className: "bg-green-100 text-green-800" },
      CANCELED: { text: "취소", className: "bg-red-100 text-red-800" },
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Link href="/seller">
              <Button variant="ghost" size="icon" className="rounded-lg">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">판매자 정산</h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>정산 기간 조회</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="periodYm">기간 (yyyy-MM)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="periodYm"
                    type="text"
                    placeholder="2025-01"
                    value={periodYm}
                    onChange={(e) => setPeriodYm(e.target.value)}
                    className="rounded-lg"
                  />
                  <Button onClick={handleSearch} className="rounded-lg">
                    <Calendar className="h-4 w-4 mr-2" />
                    조회
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 text-sm text-muted-foreground">총 {totalElements}건의 정산 내역</div>

        <div className="space-y-4">
          {settlements.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">정산 내역이 없습니다</p>
              </CardContent>
            </Card>
          ) : (
            settlements.map((settlement) => {
              const statusBadge = getStatusBadge(settlement.status)
              return (
                <Card key={settlement.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6" onClick={() => loadSettlementDetail(settlement.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{settlement.periodYm}</h3>
                          <Badge className={statusBadge.className}>{statusBadge.text}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">정산 ID: {settlement.id}</p>
                        {settlement.paidAt && (
                          <p className="text-sm text-muted-foreground mt-1">
                            지급일: {new Date(settlement.paidAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">₩{settlement.amount?.toLocaleString() || "0"}</p>
                        <p className="text-sm text-muted-foreground mt-1">정산 금액</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
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
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              className="rounded-lg bg-transparent"
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>정산 상세 내역</DialogTitle>
            <DialogDescription>{selectedSettlement?.periodYm} 정산 상세 정보</DialogDescription>
          </DialogHeader>

          {selectedSettlement && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">정산 기간</p>
                      <p className="font-medium">{selectedSettlement.periodYm}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">상태</p>
                      <Badge className={getStatusBadge(selectedSettlement.status).className}>
                        {getStatusBadge(selectedSettlement.status).text}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">정산 금액</p>
                      <p className="font-bold text-lg text-primary">
                        ₩{selectedSettlement.amount?.toLocaleString() || "0"}
                      </p>
                    </div>
                    {selectedSettlement.paidAt && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">지급일</p>
                        <p className="font-medium">{new Date(selectedSettlement.paidAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="font-semibold mb-3">상세 내역</h3>
                <div className="space-y-2">
                  {settlementLines.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">상세 내역이 없습니다</p>
                  ) : (
                    settlementLines.map((line) => (
                      <Card key={line.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">상품 ID: {line.productId}</p>
                              <p className="text-sm text-muted-foreground">대여 ID: {line.rentalItemId}</p>
                              <p className="text-sm text-muted-foreground">회원 ID: {line.memberId}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">₩{line.rentalAmount?.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">
                                수수료: ₩{line.feeAmount?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
