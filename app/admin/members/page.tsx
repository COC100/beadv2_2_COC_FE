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
import { Search, UserCheck } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function AdminMembersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [blacklists, setBlacklists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE")
  const searchParams = useSearchParams()

  useEffect(() => {
    loadBlacklists()
  }, [page, statusFilter])

  const loadBlacklists = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getBlacklists({ 
        status: statusFilter,
        page, 
        size: 20 
      })
      setBlacklists(response.data.content || [])
      setTotalPages(response.data.totalPages || 0)
    } catch (error: any) {
      router.push("/intro")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "이메일을 입력하세요",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await adminAPI.searchBlacklist(searchEmail)
      setBlacklists([response.data])
      setTotalPages(1)
    } catch (error: any) {
      toast({
        title: "회원 검색 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleReleaseBlacklist = async (memberId: number, email: string) => {
    if (!confirm(`${email} 회원의 블랙리스트를 해제하시겠습니까?`)) return

    try {
      await adminAPI.releaseBlacklist(memberId)

      toast({
        title: "블랙리스트 해제 완료",
        description: "블랙리스트가 해제되었습니다",
      })

      loadBlacklists()
    } catch (error: any) {
      toast({
        title: "블랙리스트 해제 실패",
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
          <h1 className="text-3xl font-bold mb-2">회원 관리 (블랙리스트)</h1>
          <p className="text-muted-foreground">블랙리스트에 등록된 회원을 조회하고 관리할 수 있습니다</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>회원 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="searchEmail" className="sr-only">
                  이메일
                </Label>
                <Input
                  id="searchEmail"
                  placeholder="이메일로 검색"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                검색
              </Button>
              <Button variant="outline" onClick={() => { setSearchEmail(""); loadBlacklists(); }}>
                초기화
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>블랙리스트 목록</span>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "ACTIVE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter("ACTIVE")
                    setPage(0)
                  }}
                >
                  활성
                </Button>
                <Button
                  variant={statusFilter === "RELEASED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter("RELEASED")
                    setPage(0)
                  }}
                >
                  해제됨
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              </div>
            ) : blacklists.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">블랙리스트 내역이 없습니다</p>
            ) : (
              <div className="space-y-4">
                {blacklists.map((blacklist) => (
                  <div key={blacklist.blacklistId} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-medium">{blacklist.email}</div>
                        <div className="text-sm text-muted-foreground">회원 ID: {blacklist.memberId}</div>
                        <div className="text-sm text-muted-foreground">사유: {blacklist.reason}</div>
                        {blacklist.memo && (
                          <div className="text-sm text-muted-foreground">메모: {blacklist.memo}</div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          등록일: {new Date(blacklist.createdAt).toLocaleDateString()}
                        </div>
                        {blacklist.releasedAt && (
                          <div className="text-sm text-muted-foreground">
                            해제일: {new Date(blacklist.releasedAt).toLocaleDateString()}
                          </div>
                        )}
                        <Badge variant={blacklist.status === "ACTIVE" ? "destructive" : "secondary"}>
                          {blacklist.status === "ACTIVE" ? "활성" : "해제됨"}
                        </Badge>
                      </div>
                      {blacklist.status === "ACTIVE" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReleaseBlacklist(blacklist.memberId, blacklist.email)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          해제
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
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
