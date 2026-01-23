"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api-extensions"
import { useRequireAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Plus, Edit, Trash2 } from "lucide-react"

export default function AdminNoticesPage() {
  useRequireAuth()

  const { toast } = useToast()
  const [notices, setNotices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [showDialog, setShowDialog] = useState(false)
  const [editingNotice, setEditingNotice] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    loadNotices()
  }, [page])

  const loadNotices = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getNotices({
        page,
        size: 20,
      })
      setNotices(response.data.content)
      setTotalPages(response.data.totalPages)
    } catch (error: any) {
      toast({
        title: "공지사항 조회 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingNotice(null)
    setTitle("")
    setContent("")
    setShowDialog(true)
  }

  const handleEdit = (notice: any) => {
    setEditingNotice(notice)
    setTitle(notice.title)
    setContent(notice.content)
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!title || !content) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingNotice) {
        await adminAPI.updateNotice(editingNotice.noticeId, { title, content })
        toast({
          title: "수정 완료",
          description: "공지사항이 수정되었습니다.",
        })
      } else {
        await adminAPI.createNotice({ title, content })
        toast({
          title: "등록 완료",
          description: "공지사항이 등록되었습니다.",
        })
      }
      setShowDialog(false)
      loadNotices()
    } catch (error: any) {
      toast({
        title: "저장 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (noticeId: number) => {
    if (!confirm("정말 이 공지사항을 삭제하시겠습니까?")) return

    try {
      await adminAPI.deleteNotice(noticeId)
      toast({
        title: "삭제 완료",
        description: "공지사항이 삭제되었습니다.",
      })
      loadNotices()
    } catch (error: any) {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">공지사항 관리</h1>
          <p className="text-muted-foreground">공지사항을 등록, 수정, 삭제합니다.</p>
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
          <Link href="/admin/settlements">
            <Button variant="outline" className="bg-transparent">정산 관리</Button>
          </Link>
        </div>

        <div className="mb-6 flex justify-end">
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            공지사항 등록
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>공지사항 목록</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">로딩 중...</div>
            ) : notices.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">공지사항이 없습니다</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead>수정일</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notices.map((notice) => (
                    <TableRow key={notice.noticeId}>
                      <TableCell>{notice.noticeId}</TableCell>
                      <TableCell className="font-medium">{notice.title}</TableCell>
                      <TableCell>{new Date(notice.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{new Date(notice.updatedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(notice)} className="bg-transparent">
                            <Edit className="h-4 w-4 mr-1" />
                            수정
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(notice.noticeId)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            삭제
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNotice ? "공지사항 수정" : "공지사항 등록"}</DialogTitle>
            <DialogDescription>공지사항의 제목과 내용을 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="공지사항 제목"
              />
            </div>
            <div>
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="공지사항 내용"
                rows={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="bg-transparent">
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
