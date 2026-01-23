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
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadMembers()
  }, [page])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getMembers({ page, size: 20 })
      setMembers(response.data.content || [])
      setTotalPages(response.data.totalPages || 0)
    } catch (error: any) {
      router.push("/intro")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveSeller = async (memberId: number, email: string) => {
    if (!confirm(`${email} 회원을 판매자로 승인하시겠습니까?`)) return

    try {
      await adminAPI.approveSeller(memberId)

      toast({
        title: "판매자 승인 완료",
        description: "판매자로 승인되었습니다",
      })

      loadMembers()
    } catch (error: any) {
      toast({
        title: "판매자 승인 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleRejectSeller = async (memberId: number, email: string) => {
    if (!confirm(`${email} 회원의 판매자 신청을 반려하시겠습니까?`)) return

    try {
      await adminAPI.rejectSeller(memberId)

      toast({
        title: "판매자 신청 반려",
        description: "판매자 신청이 반려되었습니다",
      })

      loadMembers()
    } catch (error: any) {
      toast({
        title: "판매자 신청 반려 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const pendingSellers = members.filter((m) => m.role === "MEMBER")
  const approvedSellers = members.filter((m) => m.role === "SELLER")

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">판매자 관리</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">대기 중</div>
                <div className="text-3xl font-bold">{pendingSellers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">승인 완료</div>
                <div className="text-3xl font-bold">{approvedSellers.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>판매자 신청 대기 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">로딩 중...</div>
              ) : pendingSellers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">대기 중인 판매자 신청이 없습니다</div>
              ) : (
                <div className="space-y-4">
                  {pendingSellers.map((member) => (
                    <Card key={member.memberId} className="border-yellow-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{member.email}</span>
                              <Badge variant="secondary">{member.role}</Badge>
                              <Badge variant="outline">대기 중</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div>이름: {member.name}</div>
                              <div>전화번호: {member.phone}</div>
                              <div>가입일: {new Date(member.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveSeller(member.memberId, member.email)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              승인
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectSeller(member.memberId, member.email)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              반려
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>승인된 판매자 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {approvedSellers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">승인된 판매자가 없습니다</div>
              ) : (
                <div className="space-y-4">
                  {approvedSellers.map((member) => (
                    <Card key={member.memberId}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{member.email}</span>
                              <Badge variant="default">{member.role}</Badge>
                              <Badge variant="default">승인 완료</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div>이름: {member.name}</div>
                              <div>전화번호: {member.phone}</div>
                              <div>가입일: {new Date(member.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
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
