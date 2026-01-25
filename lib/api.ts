const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""
const API_BASIC_AUTH_USERNAME = process.env.NEXT_PUBLIC_API_BASIC_AUTH_USERNAME || ""
const API_BASIC_AUTH_PASSWORD = process.env.NEXT_PUBLIC_API_BASIC_AUTH_PASSWORD || ""

console.log("[v0] API_BASE_URL:", API_BASE_URL)
console.log("[v0] Basic Auth configured:", !!API_BASIC_AUTH_USERNAME)

// Common API response wrapper
export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
}

// Helper function to handle redirects on auth failure
const handleAuthError = () => {
  if (typeof window === "undefined") return

  const publicPaths = ["/", "/login", "/signup", "/forgot-password"]
  const currentPath = window.location.pathname

  if (!publicPaths.some((path) => currentPath.startsWith(path))) {
    window.location.href = "/"
  }
}

let isRefreshing = false
let refreshPromise: Promise<string> | null = null

// Helper function for API calls
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth = false,
  isRetry = false,
): Promise<{ data: T; headers: Headers }> {
  const url = `${API_BASE_URL}${endpoint}`

  console.log("[v0] API Request:", { url, requiresAuth, isRetry })

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  const hasToken = typeof window !== "undefined" && localStorage.getItem("accessToken")

  if (requiresAuth && !hasToken) {
    console.error("[v0] No auth token found for protected endpoint, redirecting to /")
    handleAuthError()
    throw new Error("인증 토큰이 없습니다")
  }

  // Add HTTP Basic Auth if configured (for server-level authentication)
  // Basic Auth must be set first if present, as it's for server access
  if (API_BASIC_AUTH_USERNAME && API_BASIC_AUTH_PASSWORD) {
    const basicAuth = btoa(`${API_BASIC_AUTH_USERNAME}:${API_BASIC_AUTH_PASSWORD}`)
    headers.Authorization = `Basic ${basicAuth}`
    console.log("[v0] Adding Basic Auth header")
  }
  
  // Add Bearer token if available (may override Basic Auth for API-level auth)
  // For servers that need both, this might need adjustment
  if (hasToken && !API_BASIC_AUTH_USERNAME) {
    headers.Authorization = `Bearer ${localStorage.getItem("accessToken")}`
  } else if (hasToken && API_BASIC_AUTH_USERNAME) {
    // If both are needed, we keep Basic Auth and add Bearer as X-Bearer-Token
    headers["X-Bearer-Token"] = `Bearer ${localStorage.getItem("accessToken")}`
    console.log("[v0] Adding Bearer token as X-Bearer-Token (Basic Auth present)")
  }

  if (API_BASE_URL.includes("ngrok")) {
    headers["ngrok-skip-browser-warning"] = "true"
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    })

    console.log("[v0] API Response:", response.status, response.statusText)

    const contentType = response.headers.get("content-type")
    console.log("[v0] Content-Type:", contentType)

    if (response.status === 401 && hasToken && !isRetry) {
      console.log("[v0] 401 Unauthorized - attempting token refresh")

      try {
        if (!isRefreshing) {
          isRefreshing = true
          console.log("[v0] Starting token refresh...")
          refreshPromise = authAPI
            .reissueToken()
            .then((result) => {
              isRefreshing = false
              refreshPromise = null
              console.log("[v0] Token refresh successful")
              return result.accessToken
            })
            .catch((error) => {
              isRefreshing = false
              refreshPromise = null
              console.error("[v0] Token refresh failed in promise:", error)
              throw error
            })
        } else {
          console.log("[v0] Token refresh already in progress, waiting...")
        }

        if (refreshPromise) {
          await refreshPromise
          console.log("[v0] Token refreshed, retrying original request")
          return fetchAPI<T>(endpoint, options, requiresAuth, true)
        }
      } catch (refreshError) {
        console.error("[v0] Token refresh failed:", refreshError)
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken")
        }
        handleAuthError()
        throw new Error("토큰 갱신에 실패했습니다. 다시 로그인해주세요.")
      }
    }

    if (response.status === 401) {
      console.error("[v0] 401 Unauthorized - clearing token and redirecting")
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken")
      }
      handleAuthError()
      throw new Error("인증되지 않았습니다")
    }

    if (response.status === 403) {
      console.error("[v0] 403 Forbidden - insufficient permissions")
      throw new Error("접근 권한이 없습니다. 관리자 권한이 필요합니다.")
    }

    if (!response.ok) {
      const clonedResponse = response.clone()
      let errorMessage = `${response.statusText}`

      try {
        const errorData = await clonedResponse.json()
        console.log("[v0] Error response data:", errorData)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        try {
          const errorText = await clonedResponse.text()
          if (errorText.startsWith("<!DOCTYPE") || errorText.startsWith("<html")) {
            errorMessage = "서버 오류가 발생했습니다."
          } else if (errorText) {
            errorMessage = errorText
          }
        } catch {
          // Ignore if both JSON and text parsing fail
        }
      }
      throw new Error(errorMessage)
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      console.log("[v0] Response data structure: 204 No Content")
      return { data: null as T, headers: response.headers }
    }

    const clonedResponse = response.clone()

    if (contentType && !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("[v0] Non-JSON response:", responseText.substring(0, 200))

      if (responseText.startsWith("<!DOCTYPE") || responseText.startsWith("<html")) {
        throw new Error("서버가 HTML 응답을 반환했습니다.")
      }

      throw new Error("서버 응답 형식이 올바르지 않습니다")
    }

    const data: ApiResponse<T> = await clonedResponse.json()

    console.log("[v0] Response data structure:", {
      success: data.success,
      code: data.code,
      message: data.message,
      dataType: typeof data.data,
    })

    return { data: data.data, headers: response.headers }
  } catch (error: any) {
    console.error("[v0] API Error:", error)
    throw error
  }
}

// Member Service APIs
export const memberAPI = {
  signup: (data: {
    email: string
    password: string
    name: string
    phone: string
    verificationToken: string
  }) =>
    fetchAPI(
      "/member-service/api/members/signup",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false,
    ),

  getProfile: () => fetchAPI("/member-service/api/members/profile", {}, true),

  updateProfile: (data: { name?: string; phone?: string }) =>
    fetchAPI(
      "/member-service/api/members/profile",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
    ),

  updatePassword: (data: {
    name: string
    password: string
    email: string
    verificationCode: string
  }) =>
    fetchAPI(
      "/member-service/api/members/passwords",
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      true,
    ),

  deleteAccount: () =>
    fetchAPI(
      "/member-service/api/members",
      {
        method: "DELETE",
      },
      true,
    ),

  // Address APIs
  getAddresses: () => fetchAPI<any[]>("/member-service/api/addresses/profile", {}, true),

  createAddress: (data: {
    addressLabel: string
    recipientName: string
    recipientPhone: string
    type: string
    postcode: string
    roadAddress: string
    detailAddress: string
    isDefault: boolean
  }) =>
    fetchAPI(
      "/member-service/api/addresses/profile",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  updateAddress: (addressId: number, data: any) =>
    fetchAPI(
      `/member-service/api/addresses/profile/${addressId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
    ),

  deleteAddress: (addressId: number) =>
    fetchAPI(
      `/member-service/api/addresses/profile/${addressId}`,
      {
        method: "DELETE",
      },
      true,
    ),
}

// Auth APIs
export const authAPI = {
  login: async (data: { email: string; password: string }) => {
    const url = `${API_BASE_URL}/member-service/api/auth/login`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Add HTTP Basic Auth if configured
    if (API_BASIC_AUTH_USERNAME && API_BASIC_AUTH_PASSWORD) {
      const basicAuth = btoa(`${API_BASIC_AUTH_USERNAME}:${API_BASIC_AUTH_PASSWORD}`)
      headers.Authorization = `Basic ${basicAuth}`
    }

    if (API_BASE_URL.includes("ngrok")) {
      headers["ngrok-skip-browser-warning"] = "true"
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: "include",
    })

    if (!response.ok) {
      let errorMessage = `${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // Ignore parsing error
      }
      throw new Error(errorMessage)
    }

    const responseData: ApiResponse<string> = await response.json()

    return {
      accessToken: responseData.data,
    }
  },

  reissueToken: async () => {
    const url = `${API_BASE_URL}/member-service/api/auth/reissue`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Add HTTP Basic Auth if configured
    if (API_BASIC_AUTH_USERNAME && API_BASIC_AUTH_PASSWORD) {
      const basicAuth = btoa(`${API_BASIC_AUTH_USERNAME}:${API_BASIC_AUTH_PASSWORD}`)
      headers.Authorization = `Basic ${basicAuth}`
    }

    if (API_BASE_URL.includes("ngrok")) {
      headers["ngrok-skip-browser-warning"] = "true"
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("토큰 재발급 실패")
    }

    const responseData: ApiResponse<string> = await response.json()

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", responseData.data)
    }

    return {
      accessToken: responseData.data,
    }
  },

  logout: async () => {
    const url = `${API_BASE_URL}/member-service/api/auth/logout`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Add HTTP Basic Auth if configured
    if (API_BASIC_AUTH_USERNAME && API_BASIC_AUTH_PASSWORD) {
      const basicAuth = btoa(`${API_BASIC_AUTH_USERNAME}:${API_BASIC_AUTH_PASSWORD}`)
      headers.Authorization = `Basic ${basicAuth}`
    }

    if (API_BASE_URL.includes("ngrok")) {
      headers["ngrok-skip-browser-warning"] = "true"
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("로그아웃 실패")
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
    }

    return
  },

  sendVerificationEmail: (email: string) =>
    fetchAPI<{ result: string }>(
      "/member-service/api/auth/email/verify/send",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
      false,
    ),

  confirmVerificationCode: (email: string, code: string) =>
    fetchAPI<{ verified: boolean; verificationToken: string }>(
      "/member-service/api/auth/email/verify/confirm",
      {
        method: "POST",
        body: JSON.stringify({ email, code }),
      },
      false,
    ),

  sendPasswordResetEmail: (email: string) =>
    fetchAPI<void>(
      "/member-service/api/auth/password/reset/send",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
      false,
    ),

  confirmPasswordResetCode: (email: string, code: string) =>
    fetchAPI<{ resetToken: string }>(
      "/member-service/api/auth/password/reset/confirm",
      {
        method: "POST",
        body: JSON.stringify({ email, code }),
      },
      false,
    ),

  resetPassword: (resetToken: string, newPassword: string) =>
    fetchAPI<void>(
      "/member-service/api/auth/password/reset",
      {
        method: "POST",
        body: JSON.stringify({ resetToken, newPassword }),
      },
      false,
    ),

  oauth2Signup: async (data: {
    signupToken: string
    email: string
    phone: string
    verificationToken: string
  }) => {
    const url = `${API_BASE_URL}/member-service/api/auth/oauth2/signup`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Add HTTP Basic Auth if configured
    if (API_BASIC_AUTH_USERNAME && API_BASIC_AUTH_PASSWORD) {
      const basicAuth = btoa(`${API_BASIC_AUTH_USERNAME}:${API_BASIC_AUTH_PASSWORD}`)
      headers.Authorization = `Basic ${basicAuth}`
    }

    if (API_BASE_URL.includes("ngrok")) {
      headers["ngrok-skip-browser-warning"] = "true"
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: "include",
    })

    if (!response.ok) {
      let errorMessage = `${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // Ignore parsing error
      }
      throw new Error(errorMessage)
    }

    // API_SPEC.md: Response는 순수 String으로 accessToken 반환
    const accessToken = await response.text()

    return {
      accessToken: accessToken.trim().replace(/^"|"$/g, ""), // 따옴표 제거
    }
  },

  oauth2Connect: async (data: {
    signupToken: string
  }) => {
    return fetchAPI<void>(
      "/member-service/api/auth/oauth2/connect",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    )
  },
}

// Account Service APIs
export const accountAPI = {
  getBalance: () => fetchAPI<{ balance: number; createdAt: string }>("/account-service/api/accounts/balance", {}, true),

  getTransactions: () => fetchAPI<any[]>("/account-service/api/accounts/transactions", {}, true),

  requestWithdrawal: (amount: number) =>
    fetchAPI(
      "/account-service/api/accounts/withdrawals",
      {
        method: "POST",
        body: JSON.stringify({ amount }),
      },
      true,
    ),

  // Deposit APIs
  requestDeposit: (amount: number) =>
    fetchAPI<{ id: string; orderId: string; amount: number; status: string }>(
      "/account-service/api/deposits/pg/request",
      {
        method: "POST",
        body: JSON.stringify({ amount }),
      },
      true,
    ),

  getDepositConfig: () =>
    fetchAPI<{ clientKey: string; successUrl?: string; failUrl?: string }>(
      "/account-service/api/deposits/pg/config",
      {},
      false,
    ),

  approveDeposit: (data: { paymentKey: string; orderId: string; amount: number }) =>
    fetchAPI(
      "/account-service/api/deposits/pg/approve",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  cancelDeposit: (orderId: string) =>
    fetchAPI(
      "/account-service/api/deposits/pg/cancel",
      {
        method: "POST",
        body: JSON.stringify({ orderId }),
      },
      true,
    ),

  handleFailDeposit: (data: { code: string; message: string; orderId: string }) =>
    fetchAPI(
      "/account-service/api/deposits/pg/payments/fail",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),
}

// Seller Service APIs
export const sellerAPI = {
  register: async (data: { storeName: string; bizRegNo?: string; storePhone?: string }) => {
    const result = await fetchAPI(
      "/seller-service/api/sellers",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    )
    return result
  },

  getSelf: () => fetchAPI<any>("/seller-service/api/sellers/self", {}, true),

  getInfo: (sellerId: number) => {
    const hasToken = typeof window !== "undefined" && !!localStorage.getItem("accessToken")
    return fetchAPI<any>(`/seller-service/api/sellers/${sellerId}`, {}, hasToken)
  },

  getDetail: (sellerId: number) => {
    const hasToken = typeof window !== "undefined" && !!localStorage.getItem("accessToken")
    return fetchAPI<any>(`/seller-service/api/sellers/${sellerId}`, {}, hasToken)
  },

  updateSelf: (data: { storeName: string; bizRegNo?: string; storePhone?: string }) =>
    fetchAPI(
      "/seller-service/api/sellers/self",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
    ),

  getRentals: (params: {
    productId?: number
    status: string
    startDate: string
    endDate: string
    page?: number
    size?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params.productId) queryParams.append("productId", params.productId.toString())
    queryParams.append("status", params.status)
    queryParams.append("startDate", params.startDate)
    queryParams.append("endDate", params.endDate)
    if (params.page !== undefined) queryParams.append("page", params.page.toString())
    if (params.size !== undefined) queryParams.append("size", params.size.toString())
    
    return fetchAPI<any[]>(
      `/seller-service/api/sellers/self/rentals?${queryParams.toString()}`,
      {},
      true,
    )
  },

  getProductSummary: (productId: number) =>
    fetchAPI<{ productId: number; productName: string; thumbnailImageUrl: string }>(
      `/seller-service/api/sellers/products/${productId}`,
      {},
      true,
    ),
}

// Chat APIs
export const chatAPI = {
  createRoom: (data: { sellerId: number; memberId: number }) =>
    fetchAPI(
      "/seller-service/api/chat/rooms",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  getRooms: () => fetchAPI<any[]>("/seller-service/api/chat/rooms", {}, true),

  getRoom: (roomId: number) => fetchAPI<any>(`/seller-service/api/chat/rooms/${roomId}`, {}, true),

  getMessages: (roomId: number, params?: { cursorId?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.cursorId) queryParams.append("cursorId", params.cursorId.toString())
    if (params?.size) queryParams.append("size", params.size.toString())
    
    return fetchAPI<{ messages: any[]; nextCursorId: number; hasNext: boolean }>(
      `/seller-service/api/chat/rooms/${roomId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  leaveRoom: (roomId: number) =>
    fetchAPI(
      `/seller-service/api/chat/rooms/${roomId}/leave`,
      {
        method: "POST",
      },
      true,
    ),
}

// Settlement APIs (Seller)
export const settlementAPI = {
  getSelfSettlements: (params?: { periodYm?: string; page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.periodYm) queryParams.append("periodYm", params.periodYm)
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())
    
    return fetchAPI<{
      content: any[]
      totalElements: number
      totalPages: number
    }>(
      `/seller-service/api/settlements/sellers/self${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  getSettlementDetail: (sellerSettlementId: number) =>
    fetchAPI<any>(`/seller-service/api/settlements/sellers/self/${sellerSettlementId}`, {}, true),

  getSettlementLines: (sellerSettlementId: number) =>
    fetchAPI<any[]>(`/seller-service/api/settlements/sellers/self/${sellerSettlementId}/lines`, {}, true),

  cancelSettlement: (sellerSettlementId: number) =>
    fetchAPI<any>(
      `/seller-service/api/settlements/sellers/self/${sellerSettlementId}/cancel`,
      {
        method: "POST",
      },
      true,
    ),
}

// Product Service APIs
export const productAPI = {
  search: (params?: {
    keyword?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    sellerId?: number
    startDate?: string
    endDate?: string
    cursor?: string
    size?: number
    sortType?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const endpoint = `/product-service/api/products/search${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return fetchAPI<{
      products: any[]
      nextCursor: string
      hasNext: boolean
    }>(endpoint, {}, false)
  },

  bulkGet: (productIds: number[]) =>
    fetchAPI<any[]>(
      "/product-service/api/products/bulk",
      {
        method: "POST",
        body: JSON.stringify({ productIds }),
      },
      false,
    ),

  getRecentSearches: (size?: number) => {
    const queryParams = size ? `?size=${size}` : ""
    return fetchAPI<string[]>(`/product-service/api/products/recent-searches${queryParams}`, {}, true)
  },

  getPopularKeywords: (params?: { size?: number; startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.size) queryParams.append("size", params.size.toString())
    if (params?.startDate) queryParams.append("startDate", params.startDate)
    if (params?.endDate) queryParams.append("endDate", params.endDate)
    
    return fetchAPI<Array<{ keyword: string; count: number }>>(
      `/product-service/api/products/popular-keywords${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      false,
    )
  },

  getPopularProducts: (params?: { size?: number; startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.size) queryParams.append("size", params.size.toString())
    if (params?.startDate) queryParams.append("startDate", params.startDate)
    if (params?.endDate) queryParams.append("endDate", params.endDate)
    
    return fetchAPI<Array<{ productId: number; productName: string; viewCount: number }>>(
      `/product-service/api/products/popular-products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      false,
    )
  },

  getSellerProducts: (params?: { page?: number; size?: number; sort?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())
    if (params?.sort) queryParams.append("sort", params.sort)
    
    return fetchAPI<{
      content: any[]
      totalElements: number
      totalPages: number
      number: number
      size: number
      first: boolean
      last: boolean
    }>(`/product-service/api/products/seller${queryParams.toString() ? `?${queryParams.toString()}` : ""}`, {}, true)
  },

  getDetail: (productId: number) => {
    return fetchAPI<any>(`/product-service/api/products/${productId}`, {}, false)
  },

  create: (data: {
    name: string
    description: string
    pricePerDay: number
    securityDepositAmount?: number
    category: string
    specs?: Record<string, string>
    images?: string[]
  }) =>
    fetchAPI(
      "/product-service/api/products",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  update: (productId: number, data: any) =>
    fetchAPI(
      `/product-service/api/products/${productId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
    ),

  activate: (productId: number) =>
    fetchAPI(
      `/product-service/api/products/${productId}/active`,
      {
        method: "PATCH",
      },
      true,
    ),

  deactivate: (productId: number) =>
    fetchAPI(
      `/product-service/api/products/${productId}/inactive`,
      {
        method: "PATCH",
      },
      true,
    ),

  delete: (productId: number) =>
    fetchAPI(
      `/product-service/api/products/${productId}`,
      {
        method: "DELETE",
      },
      true,
    ),

  generateDescription: (data: {
    name: string
    category: string
    specs: Record<string, string>
  }) =>
    fetchAPI<string>(
      "/ai-service/api/ai/descriptions",
      {
        method: "POST",
        body: JSON.stringify({
          productName: data.name,
          category: data.category,
          specs: data.specs,
        }),
      },
      true,
    ),

  getRecommendations: (data: {
    productId?: number
    query?: string
    categories?: string[]
    size?: number
  }) =>
    fetchAPI<{
      message: string
      items: Array<{
        productId: number
        name: string
        category: string
        specs: Record<string, string>
        status: string
        distance: number
      }>
    }>(
      "/ai-service/api/ai/recommendations",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false,
    ),

  getRecentRecommendations: (size?: number) => {
    const queryParams = size ? `?size=${size}` : ""
    return fetchAPI<Array<{
      productId: number
      name: string
      category: string
      specs: Record<string, string>
      status: string
      distance: number
    }>>(`/ai-service/api/ai/recommendations/recent${queryParams}`, {}, true)
  },

  uploadImage: async (file: File, dir?: string) => {
    const formData = new FormData()
    formData.append("file", file)
    if (dir) formData.append("dir", dir)

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    const headers: HeadersInit = {}

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    if (API_BASE_URL.includes("ngrok")) {
      headers["ngrok-skip-browser-warning"] = "true"
    }

    const response = await fetch(`${API_BASE_URL}/product-service/api/images/upload`, {
      method: "POST",
      body: formData,
      headers,
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "이미지 업로드에 실패했습니다")
    }

    const data: ApiResponse<string> = await response.json()
    return data.data
  },
}

// Rental Service APIs
export const rentalAPI = {
  createFromCart: (cartItemIds: number[]) =>
    fetchAPI(
      "/rental-service/api/rentals/carts",
      {
        method: "POST",
        body: JSON.stringify({ cartItemIds }),
      },
      true,
    ),

  create: (data: { productId: number; startDate: string; endDate: string }) =>
    fetchAPI(
      "/rental-service/api/rentals",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  accept: (rentalItemId: number) =>
    fetchAPI(
      `/rental-service/api/rentals/${rentalItemId}/accept`,
      {
        method: "PATCH",
      },
      true,
    ),

  reject: (rentalItemId: number) =>
    fetchAPI(
      `/rental-service/api/rentals/${rentalItemId}/reject`,
      {
        method: "PATCH",
      },
      true,
    ),

  pay: (rentalId: number) =>
    fetchAPI(
      `/rental-service/api/rentals/${rentalId}/pay`,
      {
        method: "POST",
      },
      true,
    ),

  startRental: (rentalItemId: number) =>
    fetchAPI(
      `/rental-service/api/rentals/${rentalItemId}/rent`,
      {
        method: "POST",
      },
      true,
    ),

  cancel: (rentalItemId: number) =>
    fetchAPI(
      `/rental-service/api/rentals/${rentalItemId}/cancel`,
      {
        method: "PATCH",
      },
      true,
    ),

  returnItem: (
    rentalItemId: number,
    data?: {
      damageFee?: number
      damageReason?: string
      lateFee?: number
      lateReason?: string
      memo?: string
    },
  ) =>
    fetchAPI(
      `/rental-service/api/rentals/${rentalItemId}/return`,
      {
        method: "POST",
        body: JSON.stringify(data || {}),
      },
      true,
    ),

  refund: (rentalItemId: number) =>
    fetchAPI(
      `/rental-service/api/rentals/${rentalItemId}/refund`,
      {
        method: "POST",
      },
      true,
    ),

  extend: (rentalItemId: number, newEndDate: string) =>
    fetchAPI(
      `/rental-service/api/rentals/${rentalItemId}/extend`,
      {
        method: "POST",
        body: JSON.stringify({ newEndDate }),
      },
      true,
    ),

  getDetail: (rentalId: number) => fetchAPI<any>(`/rental-service/api/rentals/${rentalId}`, {}, true),

  search: (params?: { startDate?: string; endDate?: string; rentalStatus?: string }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })
    }
    return fetchAPI<any[]>(
      `/rental-service/api/rentals${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  getUnavailableDates: (productId: number, ym: string) =>
    fetchAPI<{ productId: number; ym: string; unavailableDates: string[] }>(
      `/rental-service/api/rentals/${productId}/unavailable-dates?ym=${ym}`,
      {},
      false,
    ),
}

// Cart APIs
export const cartAPI = {
  list: () => fetchAPI<{ items: any[]; updatedAt: string }>("/rental-service/api/carts", {}, true),

  addItem: (data: { productId: number; startDate: string; endDate: string }) =>
    fetchAPI(
      "/rental-service/api/carts/items",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  updateItem: (cartItemId: number, data: { startDate: string; endDate: string }) =>
    fetchAPI(
      `/rental-service/api/carts/me/items/${cartItemId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
    ),

  deleteItem: (cartItemId: number) =>
    fetchAPI(
      `/rental-service/api/carts/me/items/${cartItemId}`,
      {
        method: "DELETE",
      },
      true,
    ),
}

// Review APIs
export const reviewAPI = {
  create: (data: { rentalItemId: number; sellerId: number; rating: number; content: string }) =>
    fetchAPI(
      "/support-service/api/reviews",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  update: (reviewId: number, data: { rating?: number; content?: string }) =>
    fetchAPI(
      `/support-service/api/reviews/${reviewId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      true,
    ),

  delete: (reviewId: number) =>
    fetchAPI(
      `/support-service/api/reviews/${reviewId}`,
      {
        method: "DELETE",
      },
      true,
    ),

  list: (params?: { sellerId?: number; rating?: number; page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    return fetchAPI<any[]>(`/support-service/api/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ""}`, {}, false)
  },

  getMyReviews: (params?: { rating?: number; page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.rating) queryParams.append("rating", params.rating.toString())
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())
    
    return fetchAPI<any[]>(`/support-service/api/reviews/me${queryParams.toString() ? `?${queryParams.toString()}` : ""}`, {}, true)
  },

  getSummary: (sellerId: number) =>
    fetchAPI<{ sellerId: number; summary: string; reviewCount: number; summarizedAt: string } | null>(
      `/support-service/api/reviews/summary?sellerId=${sellerId}`,
      {},
      false,
    ),
}

// Support Service APIs - Notices
export const noticeAPI = {
  getNotices: (params?: { keyword?: string; page?: number; size?: number; sort?: string }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.keyword) queryParams.append("keyword", params.keyword)
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.size !== undefined) queryParams.append("size", params.size.toString())
      if (params.sort) queryParams.append("sort", params.sort)
    }
    return fetchAPI<{
      content: any[]
      totalElements: number
      totalPages: number
    }>(`/support-service/api/notices${queryParams.toString() ? `?${queryParams.toString()}` : ""}`, {}, false)
  },

  getNoticeDetail: (noticeId: number) => fetchAPI<any>(`/support-service/api/notices/${noticeId}`, {}, false),
}

// Support Service APIs - FAQs
export const faqAPI = {
  list: (params?: { keyword?: string; category?: string; page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })
    }
    return fetchAPI<{
      content: any[]
      totalElements: number
      totalPages: number
    }>(`/support-service/api/faqs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`, {}, false)
  },
}

// Support Service APIs - Inquiries
export const inquiryAPI = {
  create: (data: { category: string; title: string; content: string }) =>
    fetchAPI(
      "/support-service/api/inquiries",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  update: (inquiryId: number, data: { category: string; title: string; content: string }) =>
    fetchAPI(
      `/support-service/api/inquiries/${inquiryId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
    ),

  delete: (inquiryId: number) =>
    fetchAPI(
      `/support-service/api/inquiries/${inquiryId}`,
      {
        method: "DELETE",
      },
      true,
    ),

  list: (params?: { status?: string; page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })
    }
    return fetchAPI<{
      content: any[]
      totalElements: number
      totalPages: number
    }>(`/support-service/api/inquiries${queryParams.toString() ? `?${queryParams.toString()}` : ""}`, {}, true)
  },

  getDetail: (inquiryId: number) => fetchAPI<any>(`/support-service/api/inquiries/${inquiryId}`, {}, true),
}

// Admin APIs
export const adminAPI = {
  // Member Management
  getMembers: (params?: { blacklistStatus?: string; email?: string; page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.blacklistStatus) queryParams.append("blacklistStatus", params.blacklistStatus)
      if (params.email) queryParams.append("email", params.email)
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.size !== undefined) queryParams.append("size", params.size.toString())
    }
    return fetchAPI<{
      content: any[]
      totalElements: number
      totalPages: number
    }>(`/support-service/api/admin/blacklists${queryParams.toString() ? `?${queryParams.toString()}` : ""}`, {}, true)
  },

  searchMember: (email: string) =>
    fetchAPI<any>(`/support-service/api/admin/blacklists?email=${encodeURIComponent(email)}`, {}, true),

  // Blacklist Management
  getBlacklists: (params?: { memberId?: number; status?: string; page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.memberId) queryParams.append("memberId", params.memberId.toString())
      if (params.status) queryParams.append("status", params.status)
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.size !== undefined) queryParams.append("size", params.size.toString())
    }
    return fetchAPI<{
      content: any[]
      totalElements: number
      totalPages: number
    }>(`/support-service/api/admin/blacklists${queryParams.toString() ? `?${queryParams.toString()}` : ""}`, {}, true)
  },

  searchBlacklist: (email: string) =>
    fetchAPI<any>(`/support-service/api/admin/blacklists/search?email=${encodeURIComponent(email)}`, {}, true),

  addBlacklist: (data: { memberId: number; reason: string; memo?: string }) =>
    fetchAPI(
      "/support-service/api/admin/blacklists",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  releaseBlacklist: (memberId: number) =>
    fetchAPI(
      `/support-service/api/admin/blacklists/${memberId}/release`,
      {
        method: "PATCH",
      },
      true,
    ),

  // Seller Management
  getSellerRegistrations: (params?: { status?: string; page?: number; size?: number; sort?: string }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.status) queryParams.append("status", params.status)
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.size !== undefined) queryParams.append("size", params.size.toString())
      if (params.sort) queryParams.append("sort", params.sort)
    }
    return fetchAPI<{
      content: any[]
      totalElements: number
      totalPages: number
    }>(
      `/support-service/api/admin/sellers/registrations${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  approveSeller: (memberId: number) =>
    fetchAPI(
      `/support-service/api/admin/sellers/${memberId}/approve`,
      {
        method: "PATCH",
      },
      true,
    ),

  rejectSeller: (memberId: number) =>
    fetchAPI(
      `/support-service/api/admin/sellers/${memberId}/reject`,
      {
        method: "PATCH",
      },
      true,
    ),

  // Settlement Management
  getSellerSettlements: (params?: {
    periodYm?: string
    sellerId?: number
    status?: string
    page?: number
    size?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.periodYm) queryParams.append("periodYm", params.periodYm)
      if (params.sellerId) queryParams.append("sellerId", params.sellerId.toString())
      if (params.status) queryParams.append("status", params.status)
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.size !== undefined) queryParams.append("size", params.size.toString())
    }
    return fetchAPI<{
      content: any[]
      totalElements: number
      totalPages: number
    }>(
      `/seller-service/api/admin/settlements/seller-settlements${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  paySettlement: (sellerSettlementId: number, paidAt?: string) => {
    const queryParams = paidAt ? `?paidAt=${encodeURIComponent(paidAt)}` : ""
    return fetchAPI(
      `/seller-service/api/admin/settlements/seller-settlements/${sellerSettlementId}/pay${queryParams}`,
      {
        method: "POST",
      },
      true,
    )
  },

  bulkPaySettlements: (data: {
    sellerId?: number
    periodYm?: string
    status?: string
    paidAt?: string
  }) =>
    fetchAPI(
      "/seller-service/api/admin/settlements/seller-settlements/pay-bulk",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  runSettlementBatch: (data: {
    periodYm: string
    startDate?: string
    endDate?: string
    sellerId?: number
    pageSize?: number
  }) =>
    fetchAPI(
      "/seller-service/api/admin/settlements/batches/run",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  // Product Moderation
  getProductModerations: (params?: {
    moderationStatus?: string
    page?: number
    size?: number
    sort?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.moderationStatus) queryParams.append("moderationStatus", params.moderationStatus)
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.size !== undefined) queryParams.append("size", params.size.toString())
      if (params.sort) queryParams.append("sort", params.sort)
    }
    return fetchAPI<{
      content: any[]
      totalElements: number
      totalPages: number
    }>(
      `/product-service/api/admin/products/moderation-requests${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  createProductModerationRequest: (productId: number) =>
    fetchAPI(
      `/product-service/api/admin/products/${productId}/moderation-requests`,
      {
        method: "POST",
      },
      true,
    ),

  // Notice Management
  getAdminNotices: (params?: { status?: string; keyword?: string; page?: number; size?: number; sort?: string }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.status) queryParams.append("status", params.status)
      if (params.keyword) queryParams.append("keyword", params.keyword)
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.size !== undefined) queryParams.append("size", params.size.toString())
      if (params.sort) queryParams.append("sort", params.sort)
    }
    return fetchAPI<{
      content: any[]
      totalElements: number
      totalPages: number
    }>(
      `/support-service/api/admin/notices${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  getAdminNoticeDetail: (noticeId: number) => fetchAPI<any>(`/support-service/api/admin/notices/${noticeId}`, {}, true),

  createNotice: (data: { title: string; content: string; pinned?: boolean; status?: string; displayStartAt?: string; displayEndAt?: string }) =>
    fetchAPI(
      "/support-service/api/admin/notices",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  updateNotice: (noticeId: number, data: { title?: string; content?: string; pinned?: boolean; displayStartAt?: string; displayEndAt?: string }) =>
    fetchAPI(
      `/support-service/api/admin/notices/${noticeId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      true,
    ),

  deleteNotice: (noticeId: number) =>
    fetchAPI(
      `/support-service/api/admin/notices/${noticeId}`,
      {
        method: "DELETE",
      },
      true,
    ),

  publishNotice: (noticeId: number) =>
    fetchAPI(
      `/support-service/api/admin/notices/${noticeId}/publish`,
      {
        method: "PATCH",
      },
      true,
    ),

  draftNotice: (noticeId: number) =>
    fetchAPI(
      `/support-service/api/admin/notices/${noticeId}/draft`,
      {
        method: "PATCH",
      },
      true,
    ),

  // Admin Member Management
  createAdminMember: (data: { email: string; password: string; name: string; phone: string }) =>
    fetchAPI(
      "/support-service/api/admin/members",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  // FAQ Management
  getFAQs: (params?: { page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())
    
    return fetchAPI<{
      content: any[]
      totalElements: number
      totalPages: number
    }>(
      `/support-service/api/admin/faqs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  createFAQ: (data: { category: string; question: string; answer: string }) =>
    fetchAPI(
      "/support-service/api/admin/faqs",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  updateFAQ: (faqId: number, data: { category: string; question: string; answer: string }) =>
    fetchAPI(
      `/support-service/api/admin/faqs/${faqId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
    ),

  deleteFAQ: (faqId: number) =>
    fetchAPI(
      `/support-service/api/admin/faqs/${faqId}`,
      {
        method: "DELETE",
      },
      true,
    ),

  // Inquiry Management
  getInquiries: (params?: { status?: string; page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.status) queryParams.append("status", params.status)
      if (params.page !== undefined) queryParams.append("page", params.page.toString())
      if (params.size !== undefined) queryParams.append("size", params.size.toString())
    }
    return fetchAPI<{
      content: any[]
      totalElements: number
      totalPages: number
    }>(
      `/support-service/api/admin/inquiries${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  getInquiryDetail: (inquiryId: number) =>
    fetchAPI<any>(`/support-service/api/admin/inquiries/${inquiryId}`, {}, true),

  answerInquiry: (inquiryId: number, data: { answer: string }) =>
    fetchAPI(
      `/support-service/api/admin/inquiries/${inquiryId}/answer`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),
}

// Delivery APIs (Support Service)
export const deliveryAPI = {
  register: (data: { rentalItemId: number; carrierCode: string; trackingNumber: string }) =>
    fetchAPI(
      "/support-service/api/deliveries",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  update: (rentalItemId: number, data: { carrierCode: string; trackingNumber: string }) =>
    fetchAPI(
      `/support-service/api/deliveries/${rentalItemId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      true,
    ),

  getById: (deliveryId: number) =>
    fetchAPI<any>(`/support-service/api/deliveries/${deliveryId}`, {}, true),

  getByRentalItem: (rentalItemId: number) =>
    fetchAPI<any>(`/support-service/api/deliveries/rental-items/${rentalItemId}`, {}, true),
}

// AI Service APIs
export const aiAPI = {
  generateProductDescription: (data: { name: string; category: string; specs?: Record<string, string> }) =>
    fetchAPI(
      "/ai-service/api/ai/products/generate-description",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  getRecommendations: (params?: { limit?: number }) => {
    const queryParams = params?.limit ? `?limit=${params.limit}` : ""
    return fetchAPI<any[]>(`/ai-service/api/ai/products/recommendations${queryParams}`, {}, true)
  },
}
