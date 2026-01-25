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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"
import { Search, UserX, UserCheck } from "lucide-react"

export default function AdminMembersPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Search tab states
  const [searchEmail, setSearchEmail] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // List tab states
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // Blacklist dialog state
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [blacklistReason, setBlacklistReason] = useState("")
  const [blacklistMemo, setBlacklistMemo] = useState("")

  // Auto-load members when statusFilter or page changes
  useEffect(() => {
    loadMembers()
  }, [statusFilter, page])

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "이메일을 입력하세요",
        variant: "destructive",
      })
      return
    }

    try {
      setSearchLoading(true)
      const response = await adminAPI.searchBlacklist(searchEmail.trim())
      const results = response.data
      console.log("[v0] Search results:", results)
      
      // Handle both single object and array responses
      if (Array.isArray(results)) {
        setSearchResults(results)
      } else if (results) {
        setSearchResults([results])
      } else {
        setSearchResults([])
      }
    } catch (error: any) {
      console.error("[v0] Search failed:", error)
      toast({
        title: "검색 실패",
        description: error.message || "회원 검색에 실패했습니다",
        variant: "destructive",
      })
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getBlacklists({ 
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page, 
        size: 20 
      })
      setMembers(response.data.content || [])
      setTotalPages(response.data.totalPages || 0)
    } catch (error: any) {
      console.error("[v0] Load members failed:", error)
      toast({
        title: "회원 목록 로딩 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenBlacklistDialog = (member: any) => {
    setSelectedMember(member)
    setBlacklistReason("")
    setBlacklistMemo("")
    setShowBlacklistDialog(true)
  }

  const handleAddBlacklist = async () => {
    if (!blacklistReason.trim()) {
      toast({
        title: "사유를 입력하세요",
        variant: "destructive",
      })
      return
    }

    try {
      await adminAPI.addBlacklist({
        memberId: selectedMember.memberId,
        reason: blacklistReason,
        memo: blacklistMemo || undefined,
      })

      toast({
        title: "블랙리스트 등록 완료",
        description: "회원이 블랙리스트에 등록되었습니다",
      })

      setShowBlacklistDialog(false)
      // Refresh both search results and member list
      if (searchEmail.trim()) {
        handleSearch()
      }
      loadMembers()
    } catch (error: any) {
      toast({
        title: "블랙리스트 등록 실패",
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

      // Refresh both search results and member list
      if (searchEmail.trim()) {
        handleSearch()
      }
      loadMembers()
    } catch (error: any) {
      toast({
        title: "블랙리스트 해제 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const renderMemberCard = (member: any) => (
    <div key={member.memberId} className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="font-medium">{member.email}</div>
          <div className="text-sm text-muted-foreground">회원 ID: {member.memberId}</div>
          <div className="text-sm text-muted-foreground">이름: {member.name}</div>
          {member.phone && (
            <div className="text-sm text-muted-foreground">전화번호: {member.phone}</div>
          )}
          <div className="text-sm text-muted-foreground">
            가입일: {new Date(member.createdAt).toLocaleDateString()}
          </div>
          <Badge variant={member.status === "ACTIVE" ? "default" : "destructive"}>
            {member.status === "ACTIVE" ? "활성" : "정지"}
          </Badge>
        </div>
        <div className="flex gap-2">
          {member.status === "ACTIVE" ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleOpenBlacklistDialog(member)}
            >
              <UserX className="h-4 w-4 mr-1" />
              블랙리스트 등록
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleReleaseBlacklist(member.memberId, member.email)}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              블랙리스트 해제
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">회원 관리</h1>
          <p className="text-muted-foreground">회원을 조회하고 관리할 수 있습니다</p>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="search">회원 검색</TabsTrigger>
            <TabsTrigger value="list" onClick={() => loadMembers()}>
              회원 목록
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>이메일로 회원 검색</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="searchEmail" className="sr-only">
                      이메일
                    </Label>
                    <Input
                      id="searchEmail"
                      placeholder="이메일을 입력하세요"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={searchLoading}>
                    <Search className="h-4 w-4 mr-2" />
                    검색
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchEmail("")
                      setSearchResults([])
                    }}
                  >
                    초기화
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>검색 결과</CardTitle>
              </CardHeader>
              <CardContent>
                {searchLoading ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {searchEmail ? "검색 결과가 없습니다" : "이메일을 입력하고 검색하세요"}
                  </p>
                ) : (
                  <div className="space-y-4">{searchResults.map((member) => renderMemberCard(member))}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* List Tab */}
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>회원 목록</span>
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === "ALL" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setStatusFilter("ALL")
                        setPage(0)
                      }}
                    >
                      전체
                    </Button>
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
                      variant={statusFilter === "SUSPENDED" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setStatusFilter("SUSPENDED")
                        setPage(0)
                      }}
                    >
                      정지
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                  </div>
                ) : members.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">회원이 없습니다</p>
                ) : (
                  <div className="space-y-4">{members.map((member) => renderMemberCard(member))}</div>
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
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showBlacklistDialog} onOpenChange={setShowBlacklistDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>블랙리스트 등록</DialogTitle>
            <DialogDescription>
              {selectedMember?.email} 회원을 블랙리스트에 등록합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">사유 *</Label>
              <Input
                id="reason"
                placeholder="블랙리스트 등록 사유를 입력하세요"
                value={blacklistReason}
                onChange={(e) => setBlacklistReason(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memo">메모</Label>
              <Textarea
                id="memo"
                placeholder="추가 메모 (선택사항)"
                value={blacklistMemo}
                onChange={(e) => setBlacklistMemo(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlacklistDialog(false)}>
              취소
            </Button>
            <Button onClick={handleAddBlacklist}>
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  )
}
