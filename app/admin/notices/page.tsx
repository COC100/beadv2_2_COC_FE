"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"
import { Plus, Edit, Trash2, Eye, Pin } from "lucide-react"

export default function AdminNoticesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [notices, setNotices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingNotice, setEditingNotice] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    pinned: false,
    status: "DRAFT",
  })

  useEffect(() => {
    loadNotices()
  }, [page])

  const loadNotices = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getNotices({ page, size: 20 })
      setNotices(response.data.content || [])
      setTotalPages(response.data.totalPages || 0)
    } catch (error: any) {
      console.error("[v0] Failed to load notices:", error)
      toast({
        title: "공지사항 로딩 실패",
        description: error.message || "관리자 권한이 필요합니다.",
        variant: "destructive",
      })
      // Only redirect if it's an auth error (401), not a permission error (403)
      if (error.message?.includes("인증") || error.message?.includes("토큰")) {
        router.push("/intro")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "필수 정보를 입력하세요",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingNotice) {
        await adminAPI.updateNotice(editingNotice.id, formData)
        toast({
          title: "공지사항 수정 완료",
        })
      } else {
        await adminAPI.createNotice(formData)
        toast({
          title: "공지사항 등록 완료",
        })
      }

      setShowForm(false)
      setEditingNotice(null)
      setFormData({
        title: "",
        content: "",
        pinned: false,
        status: "DRAFT",
      })
      loadNotices()
    } catch (error: any) {
      toast({
        title: editingNotice ? "공지사항 수정 실패" : "공지사항 등록 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (noticeId: number) => {
    try {
      const response = await adminAPI.getNoticeDetail(noticeId)
      setEditingNotice(response.data)
      setFormData({
        title: response.data.title || "",
        content: response.data.content || "",
        pinned: response.data.pinned || false,
        status: response.data.status || "DRAFT",
      })
      setShowForm(true)
    } catch (error: any) {
      toast({
        title: "공지사항 로딩 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (noticeId: number) => {
    if (!confirm("이 공지사항을 삭제하시겠습니까?")) return

    try {
      await adminAPI.deleteNotice(noticeId)
      toast({
        title: "공지사항 삭제 완료",
      })
      loadNotices()
    } catch (error: any) {
      toast({
        title: "공지사항 삭제 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handlePublish = async (noticeId: number) => {
    try {
      await adminAPI.publishNotice(noticeId)
      toast({
        title: "공지사항 발행 완료",
      })
      loadNotices()
    } catch (error: any) {
      toast({
        title: "공지사항 발행 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDraft = async (noticeId: number) => {
    try {
      await adminAPI.draftNotice(noticeId)
      toast({
        title: "공지사항 임시저장 완료",
      })
      loadNotices()
    } catch (error: any) {
      toast({
        title: "공지사항 임시저장 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "default"
      case "DRAFT":
        return "secondary"
      case "DELETED":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "발행됨"
      case "DRAFT":
        return "임시저장"
      case "DELETED":
        return "삭제됨"
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
            <h1 className="text-3xl font-bold">공지사항 관리</h1>
            <Button
              onClick={() => {
                setShowForm(true)
                setEditingNotice(null)
                setFormData({
                  title: "",
                  content: "",
                  pinned: false,
                  status: "DRAFT",
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              공지사항 추가
            </Button>
          </div>

          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingNotice ? "공지사항 수정" : "공지사항 등록"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>제목 *</Label>
                  <Input
                    placeholder="공지사항 제목"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>내용 *</Label>
                  <Textarea
                    placeholder="공지사항 내용"
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pinned"
                    checked={formData.pinned}
                    onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  />
                  <Label htmlFor="pinned" className="cursor-pointer">
                    상단 고정
                  </Label>
                </div>
                <div>
                  <Label>상태</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="DRAFT">임시저장</option>
                    <option value="PUBLISHED">발행</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmit}>{editingNotice ? "수정" : "등록"}</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingNotice(null)
                      setFormData({
                        title: "",
                        content: "",
                        pinned: false,
                        status: "DRAFT",
                      })
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
              <CardTitle>공지사항 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">로딩 중...</div>
              ) : notices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">공지사항이 없습니다</div>
              ) : (
                <div className="space-y-4">
                  {notices.map((notice) => (
                    <Card key={notice.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {notice.pinned && <Pin className="h-4 w-4 text-primary" />}
                              <span className="font-semibold">{notice.title}</span>
                              <Badge variant={getStatusBadgeVariant(notice.status)}>
                                {getStatusText(notice.status)}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div>조회수: {notice.viewCount || 0}</div>
                              <div>작성일: {new Date(notice.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {notice.status === "DRAFT" && (
                              <Button size="sm" variant="outline" onClick={() => handlePublish(notice.id)} className="bg-transparent">
                                <Eye className="h-4 w-4 mr-2" />
                                발행
                              </Button>
                            )}
                            {notice.status === "PUBLISHED" && (
                              <Button size="sm" variant="outline" onClick={() => handleDraft(notice.id)} className="bg-transparent">
                                임시저장
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleEdit(notice.id)} className="bg-transparent">
                              <Edit className="h-4 w-4 mr-2" />
                              수정
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(notice.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              삭제
                            </Button>
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
