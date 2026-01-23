"use client"

import React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { noticeAPI } from "@/lib/api"
import { Search, Pin, Eye } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface Notice {
  id: number
  title: string
  pinned: boolean
  viewCount: number
  createdAt: string
}

const Loading = () => null

export default function NoticesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [keyword, setKeyword] = useState("")
  const [searchInput, setSearchInput] = useState("")

  useEffect(() => {
    const queryKeyword = searchParams?.get("keyword") || ""
    setKeyword(queryKeyword)
    setPage(0)
  }, [searchParams])

  useEffect(() => {
    loadNotices()
  }, [page, keyword])

  const loadNotices = async () => {
    try {
      setLoading(true)
      const response = await noticeAPI.getNotices({ 
        keyword: keyword || undefined, 
        page, 
        size: 20,
        sort: "pinned,desc;createdAt,desc"
      })
      setNotices(response.data.content || [])
      setTotalPages(response.data.totalPages || 0)
    } catch (error: any) {
      console.error("Failed to load notices:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setKeyword(searchInput)
    setPage(0)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleNoticeClick = (noticeId: number) => {
    router.push(`/notices/${noticeId}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">공지사항</h1>
            <p className="text-muted-foreground">MODI의 새로운 소식과 공지사항을 확인하세요</p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input
                  placeholder="공지사항 검색..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSearch} className="bg-transparent">
                  <Search className="h-4 w-4 mr-2" />
                  검색
                </Button>
              </div>
            </CardContent>
          </Card>

          <Suspense fallback={<Loading />}>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : notices.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  공지사항이 없습니다.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notices.map((notice) => (
                  <Card 
                    key={notice.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleNoticeClick(notice.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {notice.pinned && (
                          <Pin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {notice.pinned && (
                              <Badge variant="default" className="text-xs">
                                고정
                              </Badge>
                            )}
                            <h3 className="font-semibold text-lg truncate">{notice.title}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {notice.viewCount.toLocaleString()}
                            </span>
                            <span>
                              {format(new Date(notice.createdAt), "yyyy.MM.dd", { locale: ko })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Suspense>

          {!loading && totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="bg-transparent"
              >
                이전
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.floor(page / 5) * 5 + i
                  if (pageNum >= totalPages) return null
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      onClick={() => setPage(pageNum)}
                      className={page === pageNum ? "" : "bg-transparent"}
                    >
                      {pageNum + 1}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="bg-transparent"
              >
                다음
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
