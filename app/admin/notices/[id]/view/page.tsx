"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"
import { ArrowLeft, Pin } from "lucide-react"

export default function AdminNoticeViewPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const noticeId = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<any>(null)

  useEffect(() => {
    loadNotice()
  }, [noticeId])

  const loadNotice = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAdminNoticeDetail(noticeId)
      setNotice(response.data)
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

  if (!notice) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-muted-foreground">공지사항을 찾을 수 없습니다</p>
              <Button className="mt-4" onClick={() => router.push("/admin/notices")}>
                목록으로
              </Button>
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
            <h1 className="text-3xl font-bold">공지사항 상세</h1>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {notice.pinned && <Pin className="h-5 w-5 text-primary" />}
                  <CardTitle className="text-2xl">{notice.title}</CardTitle>
                </div>
                <Badge variant={getStatusBadgeVariant(notice.status)}>
                  {getStatusText(notice.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground border-b pb-4">
                <div>
                  <span className="font-medium">작성일:</span> {new Date(notice.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">조회수:</span> {notice.viewCount || 0}
                </div>
                {notice.displayStartAt && (
                  <div>
                    <span className="font-medium">노출 시작:</span> {new Date(notice.displayStartAt).toLocaleString()}
                  </div>
                )}
                {notice.displayEndAt && (
                  <div>
                    <span className="font-medium">노출 종료:</span> {new Date(notice.displayEndAt).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="prose max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap">{notice.content}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
