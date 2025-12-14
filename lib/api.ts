const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

// API Response wrapper type
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// Helper function to make API calls with JWT token
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API Error: ${response.statusText}`)
  }

  return response.json()
}

// Member API (member-service)
export const memberAPI = {
  signup: (data: { email: string; password: string; name: string; phoneNumber: string }) =>
    fetchAPI("/member-service/api/members/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetchAPI<{ accessToken: string; refreshToken: string }>("/member-service/api/members/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProfile: () => fetchAPI("/member-service/api/members/me", { method: "GET" }),

  updateProfile: (data: { name: string; phoneNumber: string }) =>
    fetchAPI("/member-service/api/members/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchAPI("/member-service/api/members/me/password", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteAccount: () =>
    fetchAPI("/member-service/api/members/me", {
      method: "DELETE",
    }),
}

// Product API (product-service)
export const productAPI = {
  list: (params?: { category?: string; minPrice?: number; maxPrice?: number; page?: number; size?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.append("category", params.category)
    if (params?.minPrice) searchParams.append("minPrice", params.minPrice.toString())
    if (params?.maxPrice) searchParams.append("maxPrice", params.maxPrice.toString())
    if (params?.page) searchParams.append("page", params.page.toString())
    if (params?.size) searchParams.append("size", params.size.toString())

    const query = searchParams.toString()
    return fetchAPI(`/product-service/api/products${query ? `?${query}` : ""}`, { method: "GET" })
  },

  getDetail: (id: number) => fetchAPI(`/product-service/api/products/${id}`, { method: "GET" }),

  create: (data: FormData) =>
    fetchAPI("/product-service/api/products", {
      method: "POST",
      body: data,
      headers: {}, // Let browser set Content-Type for FormData
    }),

  update: (id: number, data: FormData) =>
    fetchAPI(`/product-service/api/products/${id}`, {
      method: "PATCH",
      body: data,
      headers: {},
    }),

  delete: (id: number) =>
    fetchAPI(`/product-service/api/products/${id}`, {
      method: "DELETE",
    }),
}

// Cart API (member-service)
export const cartAPI = {
  list: () => fetchAPI("/member-service/api/carts/me", { method: "GET" }),

  addItem: (data: { productId: number; startDate: string; endDate: string }) =>
    fetchAPI("/member-service/api/carts/me/items", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateItem: (itemId: number, data: { startDate: string; endDate: string }) =>
    fetchAPI(`/member-service/api/carts/me/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteItem: (itemId: number) =>
    fetchAPI(`/member-service/api/carts/me/items/${itemId}`, {
      method: "DELETE",
    }),
}

// Rental API (rental-service)
export const rentalAPI = {
  create: (data: { productId: number; startDate: string; endDate: string; addressId: number }) =>
    fetchAPI("/rental-service/api/rentals", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createFromCart: (data: { addressId: number }) =>
    fetchAPI("/rental-service/api/rentals/from-cart", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: (params?: { role?: "RENTER" | "SELLER" }) => {
    const query = params?.role ? `?role=${params.role}` : ""
    return fetchAPI(`/rental-service/api/rentals${query}`, { method: "GET" })
  },

  getDetail: (id: number) => fetchAPI(`/rental-service/api/rentals/${id}`, { method: "GET" }),

  accept: (itemId: number) =>
    fetchAPI(`/rental-service/api/rental-items/${itemId}/accept`, {
      method: "PATCH",
    }),

  reject: (itemId: number) =>
    fetchAPI(`/rental-service/api/rental-items/${itemId}/reject`, {
      method: "PATCH",
    }),

  pay: (id: number) =>
    fetchAPI(`/rental-service/api/rentals/${id}/pay`, {
      method: "PATCH",
    }),

  returnItem: (itemId: number) =>
    fetchAPI(`/rental-service/api/rental-items/${itemId}/return`, {
      method: "PATCH",
    }),

  cancel: (itemId: number) =>
    fetchAPI(`/rental-service/api/rental-items/${itemId}/cancel`, {
      method: "PATCH",
    }),

  refund: (id: number) =>
    fetchAPI(`/rental-service/api/rentals/${id}/refund`, {
      method: "PATCH",
    }),

  extend: (itemId: number, data: { extendDays: number }) =>
    fetchAPI(`/rental-service/api/rental-items/${itemId}/extend`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
}

// Seller API (seller-service)
export const sellerAPI = {
  register: (data: { storeName: string; businessNumber?: string; storePhoneNumber?: string; description: string }) =>
    fetchAPI("/seller-service/api/sellers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProfile: () => fetchAPI("/seller-service/api/sellers/me", { method: "GET" }),

  updateProfile: (data: {
    storeName: string
    businessNumber?: string
    storePhoneNumber?: string
    description: string
  }) =>
    fetchAPI("/seller-service/api/sellers/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getRentals: () => fetchAPI("/seller-service/api/sellers/me/rentals", { method: "GET" }),

  getSettlements: () => fetchAPI("/seller-service/api/settlements/sellers/me", { method: "GET" }),

  getSettlementDetail: (id: number) =>
    fetchAPI(`/seller-service/api/settlements/sellers/me/${id}/lines`, { method: "GET" }),
}

// Account API (account-service)
export const accountAPI = {
  getBalance: () => fetchAPI("/account-service/api/wallets/me", { method: "GET" }),

  getTransactions: () => fetchAPI("/account-service/api/transactions/me", { method: "GET" }),

  confirmDeposit: (data: { amount: number; paymentKey: string; orderId: string }) =>
    fetchAPI("/account-service/api/deposits/confirm", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Address API (member-service)
export const addressAPI = {
  list: () => fetchAPI("/member-service/api/addresses/me", { method: "GET" }),

  create: (data: {
    recipientName: string
    phoneNumber: string
    address: string
    detailAddress: string
    zipCode: string
    isDefault: boolean
  }) =>
    fetchAPI("/member-service/api/addresses/me", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number,
    data: {
      recipientName: string
      phoneNumber: string
      address: string
      detailAddress: string
      zipCode: string
      isDefault: boolean
    },
  ) =>
    fetchAPI(`/member-service/api/addresses/me/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchAPI(`/member-service/api/addresses/me/${id}`, {
      method: "DELETE",
    }),
}
