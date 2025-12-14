const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

console.log("[v0] API_BASE_URL:", API_BASE_URL)

// Common API response wrapper
export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
}

// Helper function to handle redirects on auth failure
const handleAuthError = () => {
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname
    const publicPaths = ["/login", "/signup", "/intro", "/forgot-password"]
    if (!publicPaths.some((path) => currentPath.startsWith(path))) {
      window.location.href = "/intro"
    }
  }
}

// Helper function for API calls
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}, requiresAuth = true): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  console.log("[v0] API Request:", { url, requiresAuth })

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (requiresAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      console.error("[v0] No auth token found, redirecting to intro")
      handleAuthError()
      throw new Error("인증 토큰이 없습니다")
    }
    headers.Authorization = `Bearer ${token}`
  }

  if (API_BASE_URL.includes("ngrok")) {
    headers["ngrok-skip-browser-warning"] = "true"
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    console.log("[v0] API Response:", response.status, response.statusText)

    const contentType = response.headers.get("content-type")
    console.log("[v0] Content-Type:", contentType)

    if (response.status === 401) {
      if (requiresAuth) {
        console.error("[v0] 401 Unauthorized on authenticated endpoint, clearing token and redirecting")
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("user")
        }
        handleAuthError()
      } else {
        console.warn("[v0] 401 on public endpoint - backend may require auth incorrectly")
      }
      throw new Error("인증되지 않았습니다")
    }

    if (!response.ok) {
      let errorMessage = `${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        const errorText = await response.text()
        if (errorText.startsWith("<!DOCTYPE") || errorText.startsWith("<html")) {
          errorMessage = "서버 오류가 발생했습니다."
        } else if (errorText) {
          errorMessage = errorText
        }
      }
      throw new Error(errorMessage)
    }

    if (contentType && !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("[v0] Non-JSON response:", responseText.substring(0, 200))

      if (responseText.startsWith("<!DOCTYPE") || responseText.startsWith("<html")) {
        throw new Error("서버가 HTML 응답을 반환했습니다. ngrok을 사용하는 경우 경고 페이지를 우회해야 합니다.")
      }

      throw new Error("서버 응답 형식이 올바르지 않습니다")
    }

    const data: ApiResponse<T> = await response.json()
    return data.data
  } catch (error: any) {
    console.error("[v0] API Error:", error)
    throw new Error(error.message || "요청 처리 중 오류가 발생했습니다")
  }
}

// Member Service APIs
export const memberAPI = {
  signup: (data: {
    email: string
    password: string
    name: string
    phone: string
  }) =>
    fetchAPI(
      "/member-service/api/members/signup",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false,
    ),

  login: (data: { email: string; password: string }) =>
    fetchAPI<{ accessToken: string; refreshToken: string; member: any }>(
      "/member-service/api/auth/login",
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

  updatePassword: (
    memberId: number,
    data: {
      name: string
      password: string
      email: string
      verificationCode: string
    },
  ) =>
    fetchAPI(
      `/member-service/api/members/${memberId}/passwords`,
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
  getAddresses: () => fetchAPI<{ addressList: any[] }>("/member-service/api/addresses/profile", {}, true),

  createAddress: (data: any) =>
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

// Account Service APIs
export const accountAPI = {
  getBalance: () => fetchAPI<{ balance: number; createdAt: string }>("/account-service/api/accounts/balance", {}, true),

  getTransactions: () => fetchAPI<any[]>("/account-service/api/accounts/transactions", {}, true),

  requestDeposit: (amount: number) =>
    fetchAPI(
      "/account-service/api/deposits/pg/request",
      {
        method: "POST",
        body: JSON.stringify({ amount }),
      },
      true,
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

  getDepositConfig: () =>
    fetchAPI<{ clientKey: string; successUrl: string; failUrl: string }>(
      "/account-service/api/deposits/pg/config",
      {},
      true,
    ),

  cancelDeposit: (data: { paymentKey: string; orderId: string; amount: number; reason: string }) =>
    fetchAPI(
      "/account-service/api/deposits/pg/cancel",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),
}

// Product Service APIs
export const productAPI = {
  list: (params?: {
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
    const endpoint = `/product-service/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const hasToken = typeof window !== "undefined" && !!localStorage.getItem("accessToken")
    return fetchAPI<{
      products: any[]
      nextCursor: string
      hasNext: boolean
    }>(endpoint, {}, hasToken)
  },

  getDetail: (productId: number) => {
    const hasToken = typeof window !== "undefined" && !!localStorage.getItem("accessToken")
    return fetchAPI<any>(`/product-service/api/products/${productId}`, {}, hasToken)
  },

  create: (data: {
    name: string
    description: string
    pricePerDay: number
    category: string
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

  uploadImage: (file: File, dir?: string) => {
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

    return fetch(`${API_BASE_URL}/product-service/api/images/upload`, {
      method: "POST",
      body: formData,
      headers,
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || "이미지 업로드에 실패했습니다")
        }
        const data: ApiResponse<string> = await response.json()
        return data.data
      })
      .catch((error) => {
        console.error("[v0] Image upload error:", error)
        throw error
      })
  },
}

// Rental Service APIs
export const rentalAPI = {
  create: (data: { productId: number; startDate: string; endDate: string }) =>
    fetchAPI(
      "/rental-service/api/rentals",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  createFromCart: (cartItemIds: number[]) =>
    fetchAPI(
      "/rental-service/api/rentals/carts",
      {
        method: "POST",
        body: JSON.stringify({ cartItemIds }),
      },
      true,
    ),

  list: (params?: { startDate?: string; endDate?: string; rentalStatus?: string }) => {
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

  getDetail: (rentalId: number) => fetchAPI<any>(`/rental-service/api/rentals/${rentalId}`, {}, true),

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
    fetchAPI<any>(
      `/rental-service/api/rentals/${rentalId}/pay`,
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
}

// Cart APIs (Rental Service)
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

// Seller Service APIs
export const sellerAPI = {
  register: (data: { storeName: string; bizRegNo?: string; storePhone?: string }) =>
    fetchAPI(
      "/seller-service/api/sellers",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  getSelf: () => fetchAPI<any>("/seller-service/api/sellers/self", {}, true),

  updateSelf: (data: { storeName: string; bizRegNo?: string; storePhone?: string; status: string }) =>
    fetchAPI(
      "/seller-service/api/sellers/self",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
    ),

  getRentals: (params?: {
    productId?: number
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    size?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    return fetchAPI<any[]>(
      `/seller-service/api/sellers/self/rentals${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  getSettlements: (params?: { periodYm?: string; page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    return fetchAPI<any>(
      `/seller-service/api/settlements/sellers/self${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  getSettlementDetail: (sellerSettlementId: number) =>
    fetchAPI<any>(`/seller-service/api/settlements/sellers/self/${sellerSettlementId}`, {}, true),

  getSettlementLines: (sellerSettlementId: number) =>
    fetchAPI<any[]>(`/seller-service/api/settlements/sellers/self/${sellerSettlementId}/lines`, {}, true),

  paySettlement: (sellerSettlementId: number, paidAt?: string) =>
    fetchAPI(
      `/seller-service/api/settlements/sellers/self/${sellerSettlementId}/pay`,
      {
        method: "POST",
        body: JSON.stringify(paidAt ? { paidAt } : {}),
      },
      true,
    ),

  cancelSettlement: (sellerSettlementId: number) =>
    fetchAPI(
      `/seller-service/api/settlements/sellers/self/${sellerSettlementId}/cancel`,
      {
        method: "POST",
      },
      true,
    ),
}
