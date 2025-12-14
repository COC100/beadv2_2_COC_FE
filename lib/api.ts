// API configuration for Modi microservices
// All services are accessed through NEXT_PUBLIC_API_BASE_URL/<service-name>/...

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

export const API_ENDPOINTS = {
  // Member Service
  MEMBER: {
    SIGNUP: `${API_BASE_URL}/member-service/api/members/signup`,
    PROFILE: `${API_BASE_URL}/member-service/api/members/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/member-service/api/members/profile`,
    UPDATE_PASSWORD: (memberId: number) => `${API_BASE_URL}/member-service/api/members/${memberId}/passwords`,
    DELETE_ACCOUNT: `${API_BASE_URL}/member-service/api/members`,
  },

  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/member-service/api/auth/login`,
    EMAIL_VERIFY_SEND: `${API_BASE_URL}/member-service/api/auth/email/verify/send`,
    EMAIL_VERIFY_CONFIRM: `${API_BASE_URL}/member-service/api/auth/email/verify/confirm`,
    PASSWORD_RESET_SEND: `${API_BASE_URL}/member-service/api/auth/password/reset/send`,
    PASSWORD_RESET_CONFIRM: `${API_BASE_URL}/member-service/api/auth/password/reset/confirm`,
  },

  // Address Management
  ADDRESS: {
    LIST: `${API_BASE_URL}/member-service/api/addresses/profile`,
    CREATE: `${API_BASE_URL}/member-service/api/addresses/profile`,
    UPDATE: (addressId: number) => `${API_BASE_URL}/member-service/api/addresses/profile/${addressId}`,
    DELETE: (addressId: number) => `${API_BASE_URL}/member-service/api/addresses/profile/${addressId}`,
  },

  // Account Service (Wallet/Deposit)
  ACCOUNT: {
    BALANCE: `${API_BASE_URL}/account-service/api/accounts/balance`,
    TRANSACTIONS: `${API_BASE_URL}/account-service/api/accounts/transactions`,
    DEPOSIT_REQUEST: `${API_BASE_URL}/account-service/api/deposits/pg/request`,
    DEPOSIT_APPROVE: `${API_BASE_URL}/account-service/api/deposits/pg/approve`,
    DEPOSIT_CONFIG: `${API_BASE_URL}/account-service/api/deposits/pg/config`,
    DEPOSIT_CANCEL: `${API_BASE_URL}/account-service/api/deposits/pg/cancel`,
  },

  // Product Service
  PRODUCT: {
    LIST: `${API_BASE_URL}/product-service/api/products`,
    DETAIL: (productId: number) => `${API_BASE_URL}/product-service/api/products/${productId}`,
    CREATE: `${API_BASE_URL}/product-service/api/products`,
    UPDATE: (productId: number) => `${API_BASE_URL}/product-service/api/products/${productId}`,
    ACTIVATE: (productId: number) => `${API_BASE_URL}/product-service/api/products/${productId}/active`,
    DEACTIVATE: (productId: number) => `${API_BASE_URL}/product-service/api/products/${productId}/inactive`,
    DELETE: (productId: number) => `${API_BASE_URL}/product-service/api/products/${productId}`,
    IMAGE_UPLOAD: `${API_BASE_URL}/product-service/api/images/upload`,
  },

  // Rental Service
  RENTAL: {
    CREATE: `${API_BASE_URL}/rental-service/api/rentals`,
    CREATE_FROM_CART: `${API_BASE_URL}/rental-service/api/rentals/carts`,
    LIST: `${API_BASE_URL}/rental-service/api/rentals`,
    DETAIL: (rentalId: number) => `${API_BASE_URL}/rental-service/api/rentals/${rentalId}`,
    ACCEPT: (rentalItemId: number) => `${API_BASE_URL}/rental-service/api/rentals/${rentalItemId}/accept`,
    REJECT: (rentalItemId: number) => `${API_BASE_URL}/rental-service/api/rentals/${rentalItemId}/reject`,
    PAY: (rentalId: number) => `${API_BASE_URL}/rental-service/api/rentals/${rentalId}/pay`,
    RETURN: (rentalItemId: number) => `${API_BASE_URL}/rental-service/api/rentals/${rentalItemId}/return`,
    CANCEL: (rentalItemId: number) => `${API_BASE_URL}/rental-service/api/rentals/${rentalItemId}/cancel`,
    REFUND: (rentalItemId: number) => `${API_BASE_URL}/rental-service/api/rentals/${rentalItemId}/refund`,
    EXTEND: (rentalItemId: number) => `${API_BASE_URL}/rental-service/api/rentals/${rentalItemId}/extend`,
  },

  // Cart
  CART: {
    LIST: `${API_BASE_URL}/rental-service/api/carts`,
    ADD_ITEM: `${API_BASE_URL}/rental-service/api/carts/items`,
    UPDATE_ITEM: (cartItemId: number) => `${API_BASE_URL}/rental-service/api/carts/me/items/${cartItemId}`,
    DELETE_ITEM: (cartItemId: number) => `${API_BASE_URL}/rental-service/api/carts/me/items/${cartItemId}`,
  },

  // Seller Service
  SELLER: {
    REGISTER: `${API_BASE_URL}/seller-service/api/sellers`,
    SELF: `${API_BASE_URL}/seller-service/api/sellers/self`,
    UPDATE: `${API_BASE_URL}/seller-service/api/sellers/self`,
    RENTALS: `${API_BASE_URL}/seller-service/api/sellers/self/rentals`,
    SETTLEMENTS: `${API_BASE_URL}/seller-service/api/settlements/sellers/self`,
    SETTLEMENT_DETAIL: (settlementId: number) =>
      `${API_BASE_URL}/seller-service/api/settlements/sellers/self/${settlementId}`,
    SETTLEMENT_LINES: (settlementId: number) =>
      `${API_BASE_URL}/seller-service/api/settlements/sellers/self/${settlementId}/lines`,
    SETTLEMENT_PAY: (settlementId: number) =>
      `${API_BASE_URL}/seller-service/api/settlements/sellers/self/${settlementId}/pay`,
    SETTLEMENT_CANCEL: (settlementId: number) =>
      `${API_BASE_URL}/seller-service/api/settlements/sellers/self/${settlementId}/cancel`,
  },
}

export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
}

// Helper function to make API calls with JWT token
export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(errorData.message || `API Error: ${response.statusText}`)
  }

  return response.json()
}

export const memberAPI = {
  login: (email: string, password: string) =>
    fetchAPI(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (data: { email: string; password: string; name: string; phone: string }) =>
    fetchAPI(API_ENDPOINTS.MEMBER.SIGNUP, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProfile: () => fetchAPI(API_ENDPOINTS.MEMBER.PROFILE),

  updateProfile: (data: { name?: string; phone?: string }) =>
    fetchAPI(API_ENDPOINTS.MEMBER.UPDATE_PROFILE, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteAccount: () =>
    fetchAPI(API_ENDPOINTS.MEMBER.DELETE_ACCOUNT, {
      method: "DELETE",
    }),
}

export const addressAPI = {
  list: () => fetchAPI(API_ENDPOINTS.ADDRESS.LIST),

  create: (data: {
    addressLabel: string
    recipientName: string
    recipientPhone: string
    type: string
    postcode: string
    roadAddress: string
    detailAddress: string
    isDefault: boolean
  }) =>
    fetchAPI(API_ENDPOINTS.ADDRESS.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    addressId: number,
    data: {
      addressLabel?: string
      recipientName?: string
      recipientPhone?: string
      type?: string
      postcode?: string
      roadAddress?: string
      detailAddress?: string
      isDefault?: boolean
    },
  ) =>
    fetchAPI(API_ENDPOINTS.ADDRESS.UPDATE(addressId), {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (addressId: number) =>
    fetchAPI(API_ENDPOINTS.ADDRESS.DELETE(addressId), {
      method: "DELETE",
    }),
}

export const accountAPI = {
  getBalance: () => fetchAPI(API_ENDPOINTS.ACCOUNT.BALANCE),

  getTransactions: () => fetchAPI(API_ENDPOINTS.ACCOUNT.TRANSACTIONS),

  requestDeposit: (amount: number) =>
    fetchAPI(API_ENDPOINTS.ACCOUNT.DEPOSIT_REQUEST, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  approveDeposit: (data: { paymentKey: string; orderId: string; amount: number }) =>
    fetchAPI(API_ENDPOINTS.ACCOUNT.DEPOSIT_APPROVE, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getDepositConfig: () => fetchAPI(API_ENDPOINTS.ACCOUNT.DEPOSIT_CONFIG),
}

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
        if (value !== undefined) queryParams.append(key, String(value))
      })
    }
    const url = `${API_ENDPOINTS.PRODUCT.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return fetchAPI(url)
  },

  getDetail: (productId: number) => fetchAPI(API_ENDPOINTS.PRODUCT.DETAIL(productId)),

  create: (data: { name: string; description: string; pricePerDay: number; category: string; images?: string[] }) =>
    fetchAPI(API_ENDPOINTS.PRODUCT.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    productId: number,
    data: {
      name: string
      description: string
      pricePerDay: number
      category: string
      images?: Array<{ imageId?: number; url: string; ordering: number }>
    },
  ) =>
    fetchAPI(API_ENDPOINTS.PRODUCT.UPDATE(productId), {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  activate: (productId: number) =>
    fetchAPI(API_ENDPOINTS.PRODUCT.ACTIVATE(productId), {
      method: "PATCH",
    }),

  deactivate: (productId: number) =>
    fetchAPI(API_ENDPOINTS.PRODUCT.DEACTIVATE(productId), {
      method: "PATCH",
    }),

  delete: (productId: number) =>
    fetchAPI(API_ENDPOINTS.PRODUCT.DELETE(productId), {
      method: "DELETE",
    }),
}

export const cartAPI = {
  list: () => fetchAPI(API_ENDPOINTS.CART.LIST),

  addItem: (data: { productId: number; startDate: string; endDate: string }) =>
    fetchAPI(API_ENDPOINTS.CART.ADD_ITEM, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateItem: (cartItemId: number, data: { startDate: string; endDate: string }) =>
    fetchAPI(API_ENDPOINTS.CART.UPDATE_ITEM(cartItemId), {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteItem: (cartItemId: number) =>
    fetchAPI(API_ENDPOINTS.CART.DELETE_ITEM(cartItemId), {
      method: "DELETE",
    }),
}

export const rentalAPI = {
  create: (data: { productId: number; startDate: string; endDate: string }) =>
    fetchAPI(API_ENDPOINTS.RENTAL.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createFromCart: (cartItemIds: number[]) =>
    fetchAPI(API_ENDPOINTS.RENTAL.CREATE_FROM_CART, {
      method: "POST",
      body: JSON.stringify({ cartItemIds }),
    }),

  list: (params?: { startDate?: string; endDate?: string; rentalStatus?: string }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value)
      })
    }
    const url = `${API_ENDPOINTS.RENTAL.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return fetchAPI(url)
  },

  getDetail: (rentalId: number) => fetchAPI(API_ENDPOINTS.RENTAL.DETAIL(rentalId)),

  accept: (rentalItemId: number) =>
    fetchAPI(API_ENDPOINTS.RENTAL.ACCEPT(rentalItemId), {
      method: "PATCH",
    }),

  reject: (rentalItemId: number) =>
    fetchAPI(API_ENDPOINTS.RENTAL.REJECT(rentalItemId), {
      method: "PATCH",
    }),

  pay: (rentalId: number) =>
    fetchAPI(API_ENDPOINTS.RENTAL.PAY(rentalId), {
      method: "POST",
    }),

  return: (
    rentalItemId: number,
    data?: {
      damageFee?: number
      damageReason?: string
      lateFee?: number
      lateReason?: string
      memo?: string
    },
  ) =>
    fetchAPI(API_ENDPOINTS.RENTAL.RETURN(rentalItemId), {
      method: "POST",
      body: JSON.stringify(data || {}),
    }),

  cancel: (rentalItemId: number) =>
    fetchAPI(API_ENDPOINTS.RENTAL.CANCEL(rentalItemId), {
      method: "PATCH",
    }),

  refund: (rentalItemId: number) =>
    fetchAPI(API_ENDPOINTS.RENTAL.REFUND(rentalItemId), {
      method: "POST",
    }),

  extend: (rentalItemId: number, newEndDate: string) =>
    fetchAPI(API_ENDPOINTS.RENTAL.EXTEND(rentalItemId), {
      method: "POST",
      body: JSON.stringify({ newEndDate }),
    }),
}

export const sellerAPI = {
  register: (data: { storeName: string; bizRegNo?: string; storePhone?: string }) =>
    fetchAPI(API_ENDPOINTS.SELLER.REGISTER, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSelf: () => fetchAPI(API_ENDPOINTS.SELLER.SELF),

  update: (data: { storeName: string; bizRegNo?: string; storePhone?: string; status: string }) =>
    fetchAPI(API_ENDPOINTS.SELLER.UPDATE, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

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
        if (value !== undefined) queryParams.append(key, String(value))
      })
    }
    const url = `${API_ENDPOINTS.SELLER.RENTALS}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return fetchAPI(url)
  },

  getSettlements: (params?: { periodYm?: string; page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value))
      })
    }
    const url = `${API_ENDPOINTS.SELLER.SETTLEMENTS}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return fetchAPI(url)
  },
}
