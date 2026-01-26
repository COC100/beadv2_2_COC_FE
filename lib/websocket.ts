import SockJS from "sockjs-client"
import { Client, Frame, Message, Stomp } from "stompjs"

const WS_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export interface ChatMessage {
  messageId: number
  roomId: number
  senderId: number
  senderRole: "MEMBER" | "SELLER"
  content: string
  sentAt: string
}

export interface ChatMessageSendRequest {
  content: string
}

class WebSocketClient {
  private client: Client | null = null
  private connected: boolean = false
  private subscriptions: Map<string, any> = new Map()
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 3000

  constructor() {
    if (typeof window === "undefined") {
      console.log("[v0] WebSocket - Running on server, skipping initialization")
      return
    }
  }

  connect(onConnected?: () => void, onError?: (error: any) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        console.log("[v0] WebSocket - Already connected")
        if (onConnected) onConnected()
        resolve()
        return
      }

      console.log("[v0] WebSocket - Connecting to:", WS_BASE_URL)

      try {
        // Create WebSocket URL - adjust endpoint as needed
        const wsUrl = `${WS_BASE_URL}/seller-service/ws`
        console.log("[v0] WebSocket - Full URL:", wsUrl)

        const socket = new SockJS(wsUrl)
        this.client = Stomp.over(socket)

        // Disable debug messages in production
        if (process.env.NODE_ENV === "production") {
          this.client.debug = () => {}
        } else {
          this.client.debug = (str) => {
            console.log("[v0] STOMP Debug:", str)
          }
        }

        const token = localStorage.getItem("accessToken")
        const headers: any = {}

        if (token) {
          headers["Authorization"] = `Bearer ${token}`
        }

        this.client.connect(
          headers,
          (frame: Frame) => {
            console.log("[v0] WebSocket - Connected:", frame)
            this.connected = true
            this.reconnectAttempts = 0
            if (onConnected) onConnected()
            resolve()
          },
          (error: string | Frame) => {
            console.error("[v0] WebSocket - Connection error:", error)
            this.connected = false

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              this.reconnectAttempts++
              console.log(
                `[v0] WebSocket - Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
              )
              setTimeout(() => {
                this.connect(onConnected, onError)
              }, this.reconnectDelay)
            } else {
              console.error("[v0] WebSocket - Max reconnect attempts reached")
              if (onError) onError(error)
              reject(error)
            }
          }
        )
      } catch (error) {
        console.error("[v0] WebSocket - Failed to create connection:", error)
        if (onError) onError(error)
        reject(error)
      }
    })
  }

  disconnect() {
    if (this.client && this.connected) {
      console.log("[v0] WebSocket - Disconnecting...")
      this.subscriptions.forEach((subscription, key) => {
        console.log("[v0] WebSocket - Unsubscribing from:", key)
        subscription.unsubscribe()
      })
      this.subscriptions.clear()
      this.client.disconnect(() => {
        console.log("[v0] WebSocket - Disconnected")
      })
      this.connected = false
    }
  }

  subscribeToRoom(roomId: number, onMessage: (message: ChatMessage) => void): () => void {
    if (!this.client || !this.connected) {
      console.error("[v0] WebSocket - Not connected, cannot subscribe")
      return () => {}
    }

    const destination = `/topic/chat/rooms/${roomId}`
    console.log("[v0] WebSocket - Subscribing to:", destination)

    const subscription = this.client.subscribe(destination, (message: Message) => {
      try {
        console.log("[v0] WebSocket - Message received:", message.body)
        const chatMessage: ChatMessage = JSON.parse(message.body)
        onMessage(chatMessage)
      } catch (error) {
        console.error("[v0] WebSocket - Failed to parse message:", error)
      }
    })

    this.subscriptions.set(destination, subscription)

    // Return unsubscribe function
    return () => {
      console.log("[v0] WebSocket - Unsubscribing from:", destination)
      subscription.unsubscribe()
      this.subscriptions.delete(destination)
    }
  }

  sendMessage(roomId: number, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.connected) {
        console.error("[v0] WebSocket - Not connected, cannot send message")
        reject(new Error("WebSocket is not connected"))
        return
      }

      const destination = `/app/chat/rooms/${roomId}/send`
      const payload: ChatMessageSendRequest = { content }

      console.log("[v0] WebSocket - Sending message to:", destination, payload)

      try {
        this.client.send(destination, {}, JSON.stringify(payload))
        console.log("[v0] WebSocket - Message sent successfully")
        resolve()
      } catch (error) {
        console.error("[v0] WebSocket - Failed to send message:", error)
        reject(error)
      }
    })
  }

  isConnected(): boolean {
    return this.connected
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null

export const getWebSocketClient = (): WebSocketClient => {
  if (!wsClient) {
    wsClient = new WebSocketClient()
  }
  return wsClient
}
