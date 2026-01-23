"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api-extensions"
import { useRequireAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function AdminSettlementsPage() {
  useRequireAuth()

  const { toast } = useToast()
  const [settlements, setSettlements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [periodYm, setPeriodYm] = useState("")

  useEffect(() => {
    loadSettlements()
  }, [page, periodYm])

  const loadSettlements = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getAllSettlements({
        periodYm: periodYm || undefined,
        page,
        size: 20,
      })
      setSettlements(response.data.content)
      setTotalPages(response.data.totalPages)
    } catch (error: any) {
      toast({
        title: "정산 목록 조회 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (settlementId: number) => {
    if (!confirm("정산을 지급 처리하시겠습니까?")) return

    try {
      await adminAPI.paySettlement(settlementId)
      toast({
        title: "지급 완료",
        description: "정산이 지급 처리되었습니다.",
      })
      loadSettlements()
    } catch (error: any) {
      toast({
        title: "지급 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "READY":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">대기</Badge>
      case "PAID":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">지급완료</Badge>
      case "CANCELED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">취소</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">정산 관리</h1>
          <p className="text-muted-foreground">판매자 정산을 수동으로 지급 처리합니다.</p>
        </div>

        <div className="mb-6 flex gap-2">
          <Link href="/admin">
            <Button variant="outline" className="bg-transparent">관리자 대시보드</Button>
          </Link>
          <Link href="/admin/members">
            <Button variant="outline" className="bg-transparent">회원 관리</Button>
          </Link>
          <Link href="/admin/sellers">
            <Button variant="outline" className="bg-transparent">판매자 관리</Button>
          </Link>
          <Link href="/admin/notices">
            <Button variant="outline" className="bg-transparent">공지사항 관리</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>정산 기간 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="month"
                placeholder="YYYY-MM"
                value={periodYm}
                onChange={(e) => setPeriodYm(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => { setPeriodYm(""); setPage(0); }}>초기화</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>정산 목록</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">로딩 중...</div>
            ) : settlements.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">정산 내역이 없습니다</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>판매자ID</TableHead>
                    <TableHead>기간</TableHead>
                    <TableHead>대여 총액</TableHead>
                    <TableHead>수수료</TableHead>
                    <TableHead>정산 금액</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>지급일</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlements.map((settlement) => (
                    <TableRow key={settlement.id}>
                      <TableCell>{settlement.id}</TableCell>
                      <TableCell>{settlement.sellerId}</TableCell>
                      <TableCell>{settlement.periodYm}</TableCell>
                      <TableCell className="text-right">
                        ₩{settlement.totalRentalAmount?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        ₩{settlement.totalFeeAmount?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ₩{settlement.settlementAmount?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                      <TableCell>
                        {settlement.paidAt ? new Date(settlement.paidAt).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        {settlement.status === "READY" && (
                          <Button size="sm" onClick={() => handlePay(settlement.id)}>
                            지급
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="bg-transparent"
            >
              이전
            </Button>
            <span className="flex items-center px-4">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="bg-transparent"
            >
              다음
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
