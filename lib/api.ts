// API configuration for Modi microservices

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost"

export const API_ENDPOINTS = {
  // Member Service - Port 8085
  MEMBER: {
    BASE: `${API_BASE_URL}:8085/api`,
    SIGNUP: "/members/signup",
    LOGIN: "/auth/login",
    SOCIAL_LOGIN: (provider: string) => `/auth/social/${provider}`,
    PROFILE: "/members/profile",
    UPDATE_PROFILE: "/members/profile",
    UPDATE_PASSWORD: (id: number) => `/members/${id}/passwords`,
    DELETE_ACCOUNT: (id: number) => `/members/${id}`,
  },

  // Account Service - Port 8081 (Wallet/Deposit)
  ACCOUNT: {
    BASE: `${API_BASE_URL}:8081/api`,
    BALANCE: "/account/balance",
    TRANSACTIONS: "/account/transactions",
    DEPOSIT_CONFIRM: "/account/deposits/confirm",
  },

  // Product Service - Port 8082
  PRODUCT: {
    BASE: `${API_BASE_URL}:8082/api`,
    LIST: "/products",
    DETAIL: (id: number) => `/products/${id}`,
    CREATE: "/products",
    UPDATE: (id: number) => `/products/${id}`,
    DELETE: (id: number) => `/products/${id}`,
    IMAGES: "/images",
  },

  // Rental Service - Port 8083
  RENTAL: {
    BASE: `${API_BASE_URL}:8083/api`,
    CREATE: "/rentals",
    CREATE_FROM_CART: "/rentals/carts",
    LIST: "/rentals",
    DETAIL: (id: number) => `/rentals/${id}`,
    ACCEPT: (itemId: number) => `/rentals/${itemId}/accept`,
    REJECT: (itemId: number) => `/rentals/${itemId}/reject`,
    PAY: (id: number) => `/rentals/${id}/pay`,
    RETURN: (itemId: number) => `/rentals/${itemId}/return`,
    CANCEL: (itemId: number) => `/rentals/${itemId}/cancel`,
    REFUND: (id: number) => `/rentals/${id}/refund`,
    EXTEND: (itemId: number) => `/rentals/${itemId}/extend`,
  },

  // Seller Service - Port 8084
  SELLER: {
    BASE: `${API_BASE_URL}:8084/api`,
    REGISTER: "/sellers",
    PROFILE: "/sellers/me",
    UPDATE_PROFILE: "/sellers/me",
    RENTALS: "/sellers/me/rentals",
    SETTLEMENTS: "/settlements/sellers/me",
    SETTLEMENT_DETAIL: (id: number) => `/settlements/sellers/me/${id}/lines`,
  },

  // Cart endpoints (Member Service)
  CART: {
    BASE: `${API_BASE_URL}:8085/api`,
    LIST: "/carts/me",
    ADD_ITEM: "/carts/me/items",
    UPDATE_ITEM: (itemId: number) => `/carts/me/items/${itemId}`,
    DELETE_ITEM: (itemId: number) => `/carts/me/items/${itemId}`,
  },
}

// Helper function to make API calls with JWT token
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("accessToken")

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}
