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
import { Search, UserX, UserCheck } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function AdminMembersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState("")
  const [blacklists, setBlacklists] = useState<any[]>([])
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [showBlacklistForm, setShowBlacklistForm] = useState(false)
  const [blacklistReason, setBlacklistReason] = useState("")
  const [blacklistMemo, setBlacklistMemo] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const searchParams = useSearchParams()

  useEffect(() => {
    loadMembers()
    loadBlacklists()
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

  const loadBlacklists = async () => {
    try {
      const response = await adminAPI.getBlacklists({ status: "ACTIVE" })
      setBlacklists(response.data.content || [])
    } catch (error: any) {
      console.error("Failed to load blacklists:", error)
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
      const response = await adminAPI.searchMemberByEmail(searchEmail)
      setMembers([response.data])
      setTotalPages(1)
    } catch (error: any) {
      toast({
        title: "회원 검색 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const isBlacklisted = (memberId: number) => {
    return blacklists.some((bl) => bl.memberId === memberId)
  }

  const handleAddBlacklist = async () => {
    if (!selectedMember || !blacklistReason.trim()) {
      toast({
        title: "필수 정보를 입력하세요",
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

      setShowBlacklistForm(false)
      setSelectedMember(null)
      setBlacklistReason("")
      setBlacklistMemo("")
      loadBlacklists()
    } catch (error: any) {
      toast({
        title: "블랙리스트 등록 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleReleaseBlacklist = async (memberId: number) => {
    if (!confirm("블랙리스트를 해제하시겠습니까?")) return

    try {
      await adminAPI.releaseBlacklist(memberId)

      toast({
        title: "블랙리스트 해제 완료",
        description: "회원이 블랙리스트에서 해제되었습니다",
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
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">회원 관리</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>회원 검색</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="이메일로 검색"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} className="bg-transparent">
                  <Search className="h-4 w-4 mr-2" />
                  검색
                </Button>
                <Button variant="outline" onClick={loadMembers} className="bg-transparent">
                  전체 목록
                </Button>
              </div>
            </CardContent>
          </Card>

          {showBlacklistForm && selectedMember && (
            <Card className="mb-6 border-red-200">
              <CardHeader>
                <CardTitle>블랙리스트 등록 - {selectedMember.email}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>사유 *</Label>
                  <Input
                    placeholder="블랙리스트 등록 사유를 입력하세요"
                    value={blacklistReason}
                    onChange={(e) => setBlacklistReason(e.target.value)}
                  />
                </div>
                <div>
                  <Label>메모</Label>
                  <Input
                    placeholder="추가 메모 (선택)"
                    value={blacklistMemo}
                    onChange={(e) => setBlacklistMemo(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddBlacklist} variant="destructive">
                    등록
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBlacklistForm(false)
                      setSelectedMember(null)
                      setBlacklistReason("")
                      setBlacklistMemo("")
                    }}
                    className="bg-transparent"
                  >
                    취소
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>회원 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">로딩 중...</div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">회원이 없습니다</div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => (
                    <Card key={member.memberId} className={isBlacklisted(member.memberId) ? "border-red-200" : ""}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{member.email}</span>
                              <Badge variant={member.role === "SELLER" ? "default" : "secondary"}>{member.role}</Badge>
                              <Badge variant={member.status === "ACTIVE" ? "default" : "secondary"}>{member.status}</Badge>
                              {isBlacklisted(member.memberId) && (
                                <Badge variant="destructive">블랙리스트</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div>이름: {member.name}</div>
                              <div>전화번호: {member.phone}</div>
                              <div>가입일: {new Date(member.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isBlacklisted(member.memberId) ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReleaseBlacklist(member.memberId)}
                                className="bg-transparent"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                해제
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedMember(member)
                                  setShowBlacklistForm(true)
                                }}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                블랙리스트
                              </Button>
                            )}
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
