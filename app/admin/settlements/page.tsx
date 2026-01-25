"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"
import { DollarSign, Calendar } from "lucide-react"

export default function AdminSettlementsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [settlements, setSettlements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [periodYm, setPeriodYm] = useState("")
  const [sellerId, setSellerId] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [batchPeriodYm, setBatchPeriodYm] = useState("")

  useEffect(() => {
    loadSettlements()
  }, [page])

  const loadSettlements = async () => {
    try {
      setLoading(true)
      const params: any = { page, size: 20 }
      if (periodYm) params.periodYm = periodYm
      if (sellerId) params.sellerId = Number(sellerId)
      if (status) params.status = status

      const response = await adminAPI.getSellerSettlements(params)
      setSettlements(response.data.content || [])
      setTotalPages(response.data.totalPages || 0)
    } catch (error: any) {
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(0)
    loadSettlements()
  }

  const handlePaySettlement = async (sellerSettlementId: number) => {
    if (!confirm("이 정산을 지급 처리하시겠습니까?")) return

    try {
      await adminAPI.paySellerSettlement(sellerSettlementId)

      toast({
        title: "정산 지급 완료",
        description: "정산이 지급 처리되었습니다",
      })

      loadSettlements()
    } catch (error: any) {
      toast({
        title: "정산 지급 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleBulkPay = async () => {
    if (!confirm("현재 필터 조건에 맞는 모든 정산을 일괄 지급하시겠습니까?")) return

    try {
      const params: any = {}
      if (periodYm) params.periodYm = periodYm
      if (sellerId) params.sellerId = Number(sellerId)
      if (status) params.status = status

      const response = await adminAPI.payBulkSettlements(params)

      toast({
        title: "일괄 지급 완료",
        description: `${response.data.successCount}건 지급 완료, ${response.data.failedCount}건 실패`,
      })

      loadSettlements()
    } catch (error: any) {
      toast({
        title: "일괄 지급 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleRunBatch = async () => {
    if (!batchPeriodYm) {
      toast({
        title: "정산 월을 입력하세요",
        variant: "destructive",
      })
      return
    }

    try {
      await adminAPI.runSettlementBatch({ periodYm: batchPeriodYm })

      toast({
        title: "정산 배치 실행 완료",
        description: "정산 배치가 실행되었습니다",
      })

      setShowBatchForm(false)
      setBatchPeriodYm("")
      loadSettlements()
    } catch (error: any) {
      toast({
        title: "정산 배치 실행 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "READY":
        return "secondary"
      case "PAID":
        return "default"
      case "CANCELED":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "READY":
        return "지급 대기"
      case "PAID":
        return "지급 완료"
      case "CANCELED":
        return "취소됨"
      default:
        return status
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">정산 관리</h1>
            <Button onClick={() => setShowBatchForm(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              정산 배치 실행
            </Button>
          </div>

          {showBatchForm && (
            <Card className="mb-6 border-blue-200">
              <CardHeader>
                <CardTitle>정산 배치 실행</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>정산 월 (YYYY-MM) *</Label>
                  <Input
                    type="month"
                    value={batchPeriodYm}
                    onChange={(e) => setBatchPeriodYm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRunBatch}>실행</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBatchForm(false)
                      setBatchPeriodYm("")
                    }}
                    className="bg-transparent"
                  >
                    취소
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>정산 검색</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>정산 월 (YYYY-MM)</Label>
                  <Input
                    type="month"
                    value={periodYm}
                    onChange={(e) => setPeriodYm(e.target.value)}
                  />
                </div>
                <div>
                  <Label>판매자 ID</Label>
                  <Input
                    type="number"
                    placeholder="판매자 ID"
                    value={sellerId}
                    onChange={(e) => setSellerId(e.target.value)}
                  />
                </div>
                <div>
                  <Label>상태</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">전체</option>
                    <option value="READY">지급 대기</option>
                    <option value="PAID">지급 완료</option>
                    <option value="CANCELED">취소됨</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch}>검색</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPeriodYm("")
                    setSellerId("")
                    setStatus("")
                    setPage(0)
                    loadSettlements()
                  }}
                  className="bg-transparent"
                >
                  초기화
                </Button>
                <Button variant="outline" onClick={handleBulkPay} className="bg-transparent ml-auto">
                  <DollarSign className="h-4 w-4 mr-2" />
                  일괄 지급
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>정산 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">로딩 중...</div>
              ) : settlements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">정산 내역이 없습니다</div>
              ) : (
                <div className="space-y-4">
                  {settlements.map((settlement) => (
                    <Card key={settlement.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">정산 ID: {settlement.id}</span>
                              <Badge variant={getStatusBadgeVariant(settlement.status)}>
                                {getStatusText(settlement.status)}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>판매자 ID: {settlement.sellerId}</div>
                              <div>정산 월: {settlement.periodYm}</div>
                              <div>총 대여 금액: ₩{settlement.totalRentalAmount?.toLocaleString() || 0}</div>
                              <div>수수료: ₩{settlement.totalFeeAmount?.toLocaleString() || 0}</div>
                              <div className="font-semibold text-primary">
                                정산 금액: ₩{settlement.settlementAmount?.toLocaleString() || 0}
                              </div>
                              {settlement.paidAt && (
                                <div>지급일: {new Date(settlement.paidAt).toLocaleDateString()}</div>
                              )}
                            </div>
                          </div>
                          {settlement.status === "READY" && (
                            <Button size="sm" onClick={() => handlePaySettlement(settlement.id)}>
                              <DollarSign className="h-4 w-4 mr-2" />
                              지급
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="bg-transparent"
                  >
                    이전
                  </Button>
                  <span className="flex items-center px-4">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="bg-transparent"
                  >
                    다음
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
