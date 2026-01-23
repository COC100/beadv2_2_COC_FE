"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { noticeAPI } from "@/lib/api"
import { ArrowLeft, Eye, Pin } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface NoticeDetail {
  id: number
  title: string
  content: string
  status: string
  pinned: boolean
  viewCount: number
  displayStartAt?: string
  displayEndAt?: string
  createdAt: string
  updatedAt: string
}

export default function NoticeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const noticeId = Number(params.id)
  const [notice, setNotice] = useState<NoticeDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotice()
  }, [noticeId])

  const loadNotice = async () => {
    try {
      setLoading(true)
      const response = await noticeAPI.getNoticeDetail(noticeId)
      setNotice(response.data)
    } catch (error: any) {
      console.error("Failed to load notice:", error)
      router.push("/notices")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!notice) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => router.push("/notices")}
            className="mb-6 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>

          <Card>
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-2">
                {notice.pinned && (
                  <Badge variant="default">
                    <Pin className="h-3 w-3 mr-1" />
                    고정
                  </Badge>
                )}
              </div>
              <CardTitle className="text-3xl leading-tight">{notice.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {notice.viewCount.toLocaleString()}
                </span>
                <span>
                  {format(new Date(notice.createdAt), "yyyy년 MM월 dd일", { locale: ko })}
                </span>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div 
                className="prose prose-slate max-w-none leading-relaxed"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {notice.content}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/notices")}
              className="bg-transparent"
            >
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
