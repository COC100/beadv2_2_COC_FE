"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"
import { CheckCircle, XCircle } from "lucide-react"

export default function AdminSellersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>("PENDING")

  useEffect(() => {
    loadRegistrations()
  }, [page, statusFilter])

  const loadRegistrations = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getSellerRegistrations({ 
        status: statusFilter,
        page, 
        size: 20,
        sort: "createdAt,desc"
      })
      setRegistrations(response.data.content || [])
      setTotalPages(response.data.totalPages || 0)
    } catch (error: any) {
      router.push("/intro")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveSeller = async (memberId: number, storeName: string) => {
    if (!confirm(`${storeName} 판매자 신청을 승인하시겠습니까?`)) return

    try {
      await adminAPI.approveSeller(memberId)

      toast({
        title: "판매자 승인 완료",
        description: "판매자로 승인되었습니다",
      })

      loadRegistrations()
    } catch (error: any) {
      toast({
        title: "판매자 승인 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleRejectSeller = async (memberId: number, storeName: string) => {
    if (!confirm(`${storeName} 판매자 신청을 반려하시겠습니까?`)) return

    try {
      await adminAPI.rejectSeller(memberId)

      toast({
        title: "판매자 신청 반려",
        description: "판매자 신청이 반려되었습니다",
      })

      loadRegistrations()
    } catch (error: any) {
      toast({
        title: "판매자 신청 반려 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">판매자 관리</h1>
          <p className="text-muted-foreground">판매자 신청을 승인하거나 거절할 수 있습니다</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between flex-wrap gap-4">
              <span>판매자 신청 목록</span>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "PENDING" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter("PENDING")
                    setPage(0)
                  }}
                >
                  대기중
                </Button>
                <Button
                  variant={statusFilter === "APPROVED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter("APPROVED")
                    setPage(0)
                  }}
                >
                  승인됨
                </Button>
                <Button
                  variant={statusFilter === "REJECTED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter("REJECTED")
                    setPage(0)
                  }}
                >
                  반려됨
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              </div>
            ) : registrations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">신청 내역이 없습니다</p>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg) => (
                  <div key={reg.registrationId} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-medium text-lg">{reg.storeName}</div>
                        <div className="text-sm text-muted-foreground">사업자번호: {reg.bizRegNo}</div>
                        <div className="text-sm text-muted-foreground">연락처: {reg.storePhone}</div>
                        <div className="text-sm text-muted-foreground">회원 ID: {reg.memberId}</div>
                      </div>
                      <Badge 
                        variant={
                          reg.status === "APPROVED" 
                            ? "default" 
                            : reg.status === "REJECTED" 
                            ? "destructive" 
                            : "secondary"
                        }
                      >
                        {reg.status === "PENDING" ? "대기중" : reg.status === "APPROVED" ? "승인됨" : "반려됨"}
                      </Badge>
                    </div>
                    {reg.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveSeller(reg.memberId, reg.storeName)}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectSeller(reg.memberId, reg.storeName)}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          반려
                        </Button>
                      </div>
                    )}
                    {reg.approvedBy && (
                      <div className="text-xs text-muted-foreground">승인자 ID: {reg.approvedBy}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
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
                >
                  다음
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}
