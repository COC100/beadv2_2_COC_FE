"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"
import { ArrowLeft, Save, Trash2 } from "lucide-react"

export default function AdminNoticeEditPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const noticeId = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    pinned: false,
    displayStartAt: "",
    displayEndAt: "",
  })

  useEffect(() => {
    loadNotice()
  }, [noticeId])

  const loadNotice = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAdminNoticeDetail(noticeId)
      const notice = response.data

      // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
      const formatDateTimeLocal = (dateStr: string) => {
        if (!dateStr) return ""
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        const hours = String(date.getHours()).padStart(2, "0")
        const minutes = String(date.getMinutes()).padStart(2, "0")
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }

      setFormData({
        title: notice.title || "",
        content: notice.content || "",
        pinned: notice.pinned || false,
        displayStartAt: formatDateTimeLocal(notice.displayStartAt) || "",
        displayEndAt: formatDateTimeLocal(notice.displayEndAt) || "",
      })
    } catch (error: any) {
      console.error("[v0] Failed to load notice:", error)
      toast({
        title: "공지사항 로딩 실패",
        description: error.message,
        variant: "destructive",
      })
      router.push("/admin/notices")
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
      setSubmitting(true)

      // Prepare the data, converting datetime-local to ISO format
      const submitData = {
        title: formData.title,
        content: formData.content,
        pinned: formData.pinned,
        displayStartAt: formData.displayStartAt ? new Date(formData.displayStartAt).toISOString() : undefined,
        displayEndAt: formData.displayEndAt ? new Date(formData.displayEndAt).toISOString() : undefined,
      }

      await adminAPI.updateNotice(noticeId, submitData)

      toast({
        title: "공지사항 수정 완료",
      })

      router.push("/admin/notices")
    } catch (error: any) {
      console.error("[v0] Failed to update notice:", error)
      toast({
        title: "공지사항 수정 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("이 공지사항을 삭제하시겠습니까?")) return

    try {
      setSubmitting(true)
      await adminAPI.deleteNotice(noticeId)

      toast({
        title: "공지사항 삭제 완료",
      })

      router.push("/admin/notices")
    } catch (error: any) {
      console.error("[v0] Failed to delete notice:", error)
      toast({
        title: "공지사항 삭제 실패",
        description: error.message,
        variant: "destructive",
      })
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="mt-4 text-muted-foreground">로딩 중...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/admin/notices")} className="bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
            <h1 className="text-3xl font-bold">공지사항 수정</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>공지사항 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  placeholder="공지사항 제목"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="content">내용 *</Label>
                <Textarea
                  id="content"
                  placeholder="공지사항 내용"
                  rows={12}
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
                  className="h-4 w-4"
                />
                <Label htmlFor="pinned" className="cursor-pointer font-normal">
                  상단 고정
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayStartAt">노출 시작일시</Label>
                  <Input
                    id="displayStartAt"
                    type="datetime-local"
                    value={formData.displayStartAt}
                    onChange={(e) => setFormData({ ...formData, displayStartAt: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="displayEndAt">노출 종료일시</Label>
                  <Input
                    id="displayEndAt"
                    type="datetime-local"
                    value={formData.displayEndAt}
                    onChange={(e) => setFormData({ ...formData, displayEndAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} disabled={submitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {submitting ? "저장 중..." : "수정 완료"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/notices")}
                  disabled={submitting}
                  className="bg-transparent"
                >
                  취소
                </Button>
                <div className="flex-1" />
                <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
