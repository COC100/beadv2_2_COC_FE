import { Client, IMessage } from "@stomp/stompjs"

const WS_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

// Polyfill for SockJS
if (typeof window !== "undefined") {
  ;(window as any).global = window
}

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

  async connect(onConnected?: () => void, onError?: (error: any) => void): Promise<void> {
    if (this.connected) {
      console.log("[v0] WebSocket - Already connected")
      if (onConnected) onConnected()
      return
    }

    console.log("[v0] WebSocket - Connecting to:", WS_BASE_URL)

    try {
      // Import SockJS dynamically to avoid SSR issues
      const SockJS = (await import("sockjs-client")).default

      const wsUrl = `${WS_BASE_URL}/seller-service/ws`
      console.log("[v0] WebSocket - Full URL:", wsUrl)

      const token = localStorage.getItem("accessToken")
      console.log("[v0] WebSocket - Token exists:", !!token)
      
      const connectHeaders: any = {}

      if (token) {
        connectHeaders["Authorization"] = `Bearer ${token}`
      }

      return new Promise((resolve, reject) => {
        // Create client with modern @stomp/stompjs API
        this.client = new Client({
          webSocketFactory: () => {
            console.log("[v0] WebSocket - Creating SockJS connection to:", wsUrl)
            return new SockJS(wsUrl) as any
          },
          connectHeaders: connectHeaders,
          debug: (str: string) => {
            console.log("[v0] STOMP Debug:", str)
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          onConnect: (frame) => {
            console.log("[v0] WebSocket - Connected successfully:", frame)
            this.connected = true
            this.reconnectAttempts = 0
            if (onConnected) onConnected()
            resolve()
          },
          onStompError: (frame) => {
            console.error("[v0] WebSocket - STOMP error:", frame.headers, frame.body)
            this.connected = false
            if (onError) onError(frame)
            reject(frame)
          },
          onWebSocketError: (event) => {
            console.error("[v0] WebSocket - WebSocket error:", event)
            this.connected = false
            if (onError) onError(event)
            reject(event)
          },
          onWebSocketClose: (event) => {
            console.log("[v0] WebSocket - WebSocket closed:", event)
            this.connected = false
          },
          onDisconnect: () => {
            console.log("[v0] WebSocket - Disconnected")
            this.connected = false
          },
        })

        console.log("[v0] WebSocket - Activating client...")
        this.client.activate()
      })
    } catch (error) {
      console.error("[v0] WebSocket - Failed to create connection:", error)
      if (onError) onError(error)
      throw error
    }
  }

  disconnect() {
    if (this.client && this.connected) {
      console.log("[v0] WebSocket - Disconnecting...")
      this.subscriptions.forEach((subscription, key) => {
        console.log("[v0] WebSocket - Unsubscribing from:", key)
        subscription.unsubscribe()
      })
      this.subscriptions.clear()
      this.client.deactivate()
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

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
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
        this.client.publish({
          destination: destination,
          body: JSON.stringify(payload),
        })
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
