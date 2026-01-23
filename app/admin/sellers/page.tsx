"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function AdminSellersPage() {
  useRequireAuth()

  const { toast } = useToast()
  const [sellers, setSellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadSellers()
  }, [page])

  const loadSellers = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getPendingSellers({
        page,
        size: 20,
      })
      setSellers(response.data.content)
      setTotalPages(response.data.totalPages)
    } catch (error: any) {
      toast({
        title: "판매자 목록 조회 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (sellerId: number) => {
    if (!confirm("판매자를 승인하시겠습니까?")) return

    try {
      await adminAPI.approveSeller(sellerId)
      toast({
        title: "승인 완료",
        description: "판매자가 승인되었습니다.",
      })
      loadSellers()
    } catch (error: any) {
      toast({
        title: "승인 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleReject = async (sellerId: number) => {
    if (!confirm("판매자를 반려하시겠습니까?")) return

    try {
      await adminAPI.rejectSeller(sellerId)
      toast({
        title: "반려 완료",
        description: "판매자가 반려되었습니다.",
      })
      loadSellers()
    } catch (error: any) {
      toast({
        title: "반려 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">승인됨</Badge>
      case "SUSPENDED":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">대기중</Badge>
      case "CLOSED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">반려됨</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">판매자 관리</h1>
          <p className="text-muted-foreground">판매자 신청 목록을 조회하고 승인/반려합니다.</p>
        </div>

        <div className="mb-6 flex gap-2">
          <Link href="/admin">
            <Button variant="outline" className="bg-transparent">관리자 대시보드</Button>
          </Link>
          <Link href="/admin/members">
            <Button variant="outline" className="bg-transparent">회원 관리</Button>
          </Link>
          <Link href="/admin/settlements">
            <Button variant="outline" className="bg-transparent">정산 관리</Button>
          </Link>
          <Link href="/admin/notices">
            <Button variant="outline" className="bg-transparent">공지사항 관리</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>판매자 신청 목록</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">로딩 중...</div>
            ) : sellers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">대기 중인 판매자가 없습니다</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>회원ID</TableHead>
                    <TableHead>상점명</TableHead>
                    <TableHead>사업자번호</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>신청일</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.map((seller) => (
                    <TableRow key={seller.sellerId}>
                      <TableCell>{seller.sellerId}</TableCell>
                      <TableCell>{seller.memberId}</TableCell>
                      <TableCell className="font-medium">{seller.storeName}</TableCell>
                      <TableCell>{seller.bizRegNo || "-"}</TableCell>
                      <TableCell>{seller.storePhone || "-"}</TableCell>
                      <TableCell>{getStatusBadge(seller.status)}</TableCell>
                      <TableCell>{new Date(seller.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApprove(seller.sellerId)}>
                            승인
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(seller.sellerId)}
                          >
                            반려
                          </Button>
                        </div>
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
