"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, Loader2, MoreVertical } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { chatAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ChatMessage {
  messageId: number
  roomId: number
  senderId: number
  senderRole: "MEMBER" | "SELLER"
  content: string
  sentAt: string
}

interface ChatRoom {
  roomId: number
  roomKey: string
  sellerId: number
  memberId: number
  createdAt: string
  updatedAt: string
}

export default function ChatRoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [roomId, setRoomId] = useState<number | null>(null)
  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await Promise.resolve(params)
        const id = Number(resolvedParams.roomId)

        if (isNaN(id)) {
          throw new Error("잘못된 채팅방 ID입니다")
        }

        setRoomId(id)
      } catch (error) {
        console.error("[v0] Failed to resolve params:", error)
        toast({
          title: "페이지 로딩 실패",
          description: "채팅방 정보를 불러올 수 없습니다",
          variant: "destructive",
        })
        router.push("/chat")
      }
    }

    resolveParams()
  }, [params, toast, router])

  useEffect(() => {
    if (roomId) {
      loadChatRoom()
    }
  }, [roomId])

  const loadChatRoom = async () => {
    if (!roomId) return

    setLoading(true)
    try {
      const roomResponse = await chatAPI.getRoom(roomId)
      setRoom(roomResponse.data)

      const messagesResponse = await chatAPI.getMessages(roomId, { size: 50 })
      setMessages(messagesResponse.data.messages.reverse())

      // Scroll to bottom
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight
          }
        }
      }, 100)
    } catch (error: any) {
      console.error("[v0] Failed to load chat room:", error)
      toast({
        title: "채팅방 로딩 실패",
        description: error.message || "채팅방을 불러올 수 없습니다.",
        variant: "destructive",
      })
      router.push("/chat")
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageInput.trim() || !roomId || sending) return

    const messageContent = messageInput.trim()
    setMessageInput("")
    setSending(true)

    try {
      // TODO: Implement WebSocket or API endpoint for sending messages
      // For now, we'll just add the message to the local state
      const newMessage: ChatMessage = {
        messageId: Date.now(),
        roomId: roomId,
        senderId: 0,
        senderRole: "MEMBER",
        content: messageContent,
        sentAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, newMessage])

      // Scroll to bottom
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight
          }
        }
      }, 0)

      toast({
        title: "메시지 전송",
        description: "메시지가 전송되었습니다. (데모 모드)",
      })
    } catch (error: any) {
      console.error("[v0] Failed to send message:", error)
      toast({
        title: "메시지 전송 실패",
        description: error.message || "메시지를 전송할 수 없습니다.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleLeaveRoom = async () => {
    if (!roomId) return

    if (!confirm("채팅방을 나가시겠습니까?")) return

    try {
      await chatAPI.leaveRoom(roomId)
      toast({
        title: "채팅방 나가기 완료",
        description: "채팅방에서 나갔습니다.",
      })
      router.push("/chat")
    } catch (error: any) {
      console.error("[v0] Failed to leave room:", error)
      toast({
        title: "채팅방 나가기 실패",
        description: error.message || "채팅방을 나갈 수 없습니다.",
        variant: "destructive",
      })
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/chat")}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-lg font-semibold">채팅</h1>
                  <p className="text-sm text-muted-foreground">채팅방 #{roomId}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLeaveRoom} className="text-destructive">
                    채팅방 나가기
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <ScrollArea ref={scrollAreaRef} className="flex-1">
          <div className="container mx-auto px-4 py-6">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-sm">아직 메시지가 없습니다.</p>
                <p className="text-xs mt-1">첫 메시지를 보내보세요!</p>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.messageId}
                    className={`flex ${message.senderRole === "MEMBER" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        message.senderRole === "MEMBER"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderRole === "MEMBER" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(message.sentAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t bg-white sticky bottom-0">
          <div className="container mx-auto px-4 py-4">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 rounded-full"
                  disabled={sending}
                />
                <Button type="submit" size="icon" className="rounded-full" disabled={!messageInput.trim() || sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                실시간 채팅은 WebSocket 연동이 필요합니다. 현재는 데모 모드입니다.
              </p>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
