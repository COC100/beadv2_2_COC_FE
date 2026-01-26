"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send, Loader2, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { chatAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { getWebSocketClient, ChatMessage as WSChatMessage } from "@/lib/websocket"

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
  const [wsConnected, setWsConnected] = useState(false)
  const [wsConnecting, setWsConnecting] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const { toast } = useToast()

  // Connect to WebSocket and subscribe to room
  useEffect(() => {
    if (!roomId || !open) return

    console.log("[v0] ChatDialog - Initializing WebSocket connection for room:", roomId)
    setWsConnecting(true)

    const wsClient = getWebSocketClient()

    const connectAndSubscribe = async () => {
      try {
        await wsClient.connect(
          () => {
            console.log("[v0] ChatDialog - WebSocket connected successfully")
            setWsConnected(true)
            setWsConnecting(false)

            // Subscribe to room messages
            const unsubscribe = wsClient.subscribeToRoom(roomId, (message: WSChatMessage) => {
              console.log("[v0] ChatDialog - Received message:", message)
              setMessages((prev) => {
                // Check if message already exists
                const exists = prev.some((m) => m.messageId === message.messageId)
                if (exists) return prev
                return [...prev, message]
              })

              // Scroll to bottom
              setTimeout(() => {
                if (scrollAreaRef.current) {
                  const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
                  if (scrollContainer) {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight
                  }
                }
              }, 100)
            })

            unsubscribeRef.current = unsubscribe
          },
          (error) => {
            console.error("[v0] ChatDialog - WebSocket connection error:", error)
            setWsConnected(false)
            setWsConnecting(false)
            toast({
              title: "연결 실패",
              description: "실시간 채팅 연결에 실패했습니다. 페이지를 새로고침해주세요.",
              variant: "destructive",
            })
          }
        )
      } catch (error) {
        console.error("[v0] ChatDialog - Failed to connect:", error)
        setWsConnected(false)
        setWsConnecting(false)
      }
    }

    connectAndSubscribe()

    // Cleanup on unmount
    return () => {
      console.log("[v0] ChatDialog - Cleaning up WebSocket connection")
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [roomId, open])

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
      if (!wsConnected) {
        throw new Error("WebSocket이 연결되어 있지 않습니다.")
      }

      const wsClient = getWebSocketClient()
      await wsClient.sendMessage(roomId, messageContent)

      console.log("[v0] ChatDialog - Message sent successfully")

      // Message will be received via WebSocket subscription
      // No need to manually add to state
    } catch (error: any) {
      console.error("[v0] ChatDialog - Failed to send message:", error)
      toast({
        title: "메시지 전송 실패",
        description: error.message || "메시지를 전송할 수 없습니다.",
        variant: "destructive",
      })
      // Restore message input on error
      setMessageInput(messageContent)
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
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{sellerName}님과의 대화</DialogTitle>
            {wsConnecting ? (
              <Badge variant="outline" className="gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                연결 중
              </Badge>
            ) : wsConnected ? (
              <Badge variant="outline" className="gap-1.5 text-green-600 border-green-600">
                <Wifi className="h-3 w-3" />
                연결됨
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5 text-red-600 border-red-600">
                <WifiOff className="h-3 w-3" />
                연결 안됨
              </Badge>
            )}
          </div>
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
              disabled={sending || !roomId || !wsConnected}
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full"
              disabled={!messageInput.trim() || sending || !roomId || !wsConnected}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          {!wsConnected && !wsConnecting && (
            <p className="text-xs text-destructive mt-2 text-center">실시간 연결이 끊어졌습니다. 페이지를 새로고침해주세요.</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
