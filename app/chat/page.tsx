"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MessageCircle, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { chatAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRequireAuth } from "@/hooks/use-auth"

interface ChatRoom {
  roomId: number
  roomKey: string
  sellerId: number
  memberId: number
  createdAt: string
  updatedAt: string
}

export default function ChatListPage() {
  useRequireAuth()
  const { toast } = useToast()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChatRooms()
  }, [])

  const loadChatRooms = async () => {
    setLoading(true)
    try {
      const response = await chatAPI.getRooms()
      setRooms(response.data)
    } catch (error: any) {
      console.error("[v0] Failed to load chat rooms:", error)
      toast({
        title: "채팅방 목록 로딩 실패",
        description: error.message || "채팅방 목록을 불러올 수 없습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      const hours = date.getHours().toString().padStart(2, "0")
      const minutes = date.getMinutes().toString().padStart(2, "0")
      return `${hours}:${minutes}`
    } else if (days === 1) {
      return "어제"
    } else if (days < 7) {
      return `${days}일 전`
    } else {
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const day = date.getDate().toString().padStart(2, "0")
      return `${month}.${day}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">채팅</h1>
            <p className="text-muted-foreground">판매자와의 대화 목록입니다.</p>
          </div>

          {rooms.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">아직 채팅방이 없습니다.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  상품 페이지에서 '모디톡 문의' 버튼을 눌러 판매자와 대화를 시작해보세요!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <Link key={room.roomId} href={`/chat/${room.roomId}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <MessageCircle className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">채팅방 #{room.roomId}</h3>
                              <Badge variant="outline" className="text-xs">
                                판매자 ID: {room.sellerId}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              채팅방 키: {room.roomKey}
                            </p>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-muted-foreground">{formatDate(room.updatedAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
