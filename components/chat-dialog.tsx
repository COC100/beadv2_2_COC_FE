"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { chatAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ChatMessage {
  messageId: number
  roomId: number
  senderId: number
  senderRole: "MEMBER" | "SELLER"
  content: string
  sentAt: string
}

interface ChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId: number | null
  sellerId: number
  sellerName: string
}

export function ChatDialog({ open, onOpenChange, roomId: initialRoomId, sellerId, sellerName }: ChatDialogProps) {
  const [roomId, setRoomId] = useState<number | null>(initialRoomId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Load messages when roomId is available
  useEffect(() => {
    if (roomId && open) {
      loadMessages()
    }
  }, [roomId, open])

  const loadMessages = async () => {
    if (!roomId) return

    setLoading(true)
    try {
      const response = await chatAPI.getMessages(roomId, { size: 50 })
      setMessages(response.data.messages.reverse()) // Reverse to show oldest first
      setHasMore(response.data.hasNext)
      setNextCursor(response.data.nextCursorId)

      // Scroll to bottom after loading
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight
          }
        }
      }, 100)
    } catch (error: any) {
      console.error("[v0] Failed to load messages:", error)
      toast({
        title: "메시지 로딩 실패",
        description: error.message || "메시지를 불러올 수 없습니다.",
        variant: "destructive",
      })
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
      // TODO: Implement WebSocket or polling for real-time messaging
      // For now, we'll just add the message to the local state
      // In a real implementation, this would be sent via WebSocket
      
      // Simulated message sending
      const newMessage: ChatMessage = {
        messageId: Date.now(),
        roomId: roomId,
        senderId: 0, // Will be set by server
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">{sellerName}님과의 대화</DialogTitle>
        </DialogHeader>

        <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <div>
                <p className="text-sm">아직 메시지가 없습니다.</p>
                <p className="text-xs mt-1">첫 메시지를 보내보세요!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
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
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="border-t px-6 py-4">
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 rounded-full"
              disabled={sending || !roomId}
            />
            <Button type="submit" size="icon" className="rounded-full" disabled={!messageInput.trim() || sending || !roomId}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            실시간 채팅은 WebSocket 연동이 필요합니다. 현재는 데모 모드입니다.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
