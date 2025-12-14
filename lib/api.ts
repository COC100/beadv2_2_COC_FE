const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

// API Response wrapper type
export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
}

// Helper function to make API calls
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}, requiresAuth = false): Promise<ApiResponse<T>> {
  const fullUrl = `${API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  }

  // Only add auth header if explicitly required
  if (requiresAuth) {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    if (!token) {
      throw new Error("Authentication required")
    }
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(errorData.message || `API Error: ${response.statusText}`)
  }

  return response.json()
}

// Member API (member-service)
export const memberAPI = {
  // 회원가입 (인증 불필요)
  signup: (data: { email: string; password: string; name: string; phone: string }) =>
    fetchAPI(
      "/member-service/api/members/signup",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false,
    ),

  // 내 정보 조회 (인증 필요)
  getProfile: () => fetchAPI("/member-service/api/members/profile", { method: "GET" }, true),

  // 내 정보 수정 (인증 필요)
  updateProfile: (data: { name?: string; phone?: string }) =>
    fetchAPI(
      "/member-service/api/members/profile",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 비밀번호 수정 (인증 필요)
  updatePassword: (
    memberId: number,
    data: { name: string; password: string; email: string; verificationCode: string },
  ) =>
    fetchAPI(
      `/member-service/api/members/${memberId}/passwords`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 회원 탈퇴 (인증 필요)
  deleteAccount: () =>
    fetchAPI(
      "/member-service/api/members",
      {
        method: "DELETE",
      },
      true,
    ),
}

// Auth API (member-service)
export const authAPI = {
  // 로그인 (인증 불필요)
  login: (data: { email: string; password: string }) =>
    fetchAPI<{
      accessToken: string
      refreshToken: string
      member: { id: number; email: string; name: string; role: string }
    }>(
      "/member-service/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false,
    ),

  // 이메일 인증 코드 전송
  sendEmailVerification: (data: { email: string }) =>
    fetchAPI(
      "/member-service/api/auth/email/verify/send",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false,
    ),

  // 이메일 인증 확인
  confirmEmailVerification: (data: { email: string; code: string }) =>
    fetchAPI<{ verified: boolean }>(
      "/member-service/api/auth/email/verify/confirm",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false,
    ),
}

// Address API (member-service)
export const addressAPI = {
  // 내 배송지 목록 (인증 필요)
  list: () => fetchAPI<{ addressList: any[] }>("/member-service/api/addresses/profile", { method: "GET" }, true),

  // 배송지 등록 (인증 필요)
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
    fetchAPI(
      "/member-service/api/addresses/profile",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 배송지 수정 (인증 필요)
  update: (
    addressId: number,
    data: Partial<{
      addressLabel: string
      recipientName: string
      recipientPhone: string
      type: string
      postcode: string
      roadAddress: string
      detailAddress: string
      isDefault: boolean
    }>,
  ) =>
    fetchAPI(
      `/member-service/api/addresses/profile/${addressId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 배송지 삭제 (인증 필요)
  delete: (addressId: number) =>
    fetchAPI(
      `/member-service/api/addresses/profile/${addressId}`,
      {
        method: "DELETE",
      },
      true,
    ),
}

// Product API (product-service)
export const productAPI = {
  // 상품 스크롤 목록 (인증 불필요)
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
    const searchParams = new URLSearchParams()
    if (params?.keyword) searchParams.append("keyword", params.keyword)
    if (params?.category) searchParams.append("category", params.category)
    if (params?.minPrice) searchParams.append("minPrice", params.minPrice.toString())
    if (params?.maxPrice) searchParams.append("maxPrice", params.maxPrice.toString())
    if (params?.sellerId) searchParams.append("sellerId", params.sellerId.toString())
    if (params?.startDate) searchParams.append("startDate", params.startDate)
    if (params?.endDate) searchParams.append("endDate", params.endDate)
    if (params?.cursor) searchParams.append("cursor", params.cursor)
    searchParams.append("size", (params?.size || 20).toString())
    searchParams.append("sortType", params?.sortType || "LATEST")

    const query = searchParams.toString()
    return fetchAPI<{ products: any[]; nextCursor: string; hasNext: boolean }>(
      `/product-service/api/products?${query}`,
      { method: "GET" },
      false,
    )
  },

  // 상품 상세 (인증 불필요)
  getDetail: (productId: number) => fetchAPI(`/product-service/api/products/${productId}`, { method: "GET" }, false),

  // 상품 등록 (인증 필요)
  create: (data: { name: string; description: string; pricePerDay: number; category: string; images?: string[] }) =>
    fetchAPI(
      "/product-service/api/products",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 상품 수정 (인증 필요)
  update: (
    productId: number,
    data: { name: string; description: string; pricePerDay: number; category: string; images?: any[] },
  ) =>
    fetchAPI(
      `/product-service/api/products/${productId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 상품 활성화 (인증 필요)
  activate: (productId: number) =>
    fetchAPI(
      `/product-service/api/products/${productId}/active`,
      {
        method: "PATCH",
      },
      true,
    ),

  // 상품 비활성화 (인증 필요)
  deactivate: (productId: number) =>
    fetchAPI(
      `/product-service/api/products/${productId}/inactive`,
      {
        method: "PATCH",
      },
      true,
    ),

  // 상품 삭제 (인증 필요)
  delete: (productId: number) =>
    fetchAPI(
      `/product-service/api/products/${productId}`,
      {
        method: "DELETE",
      },
      true,
    ),

  // 이미지 업로드 (인증 필요)
  uploadImage: (file: File, dir?: string) => {
    const formData = new FormData()
    formData.append("file", file)
    if (dir) formData.append("dir", dir)

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    return fetch(`${API_BASE_URL}/product-service/api/images/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then((res) => res.json())
  },
}

// Cart API (rental-service)
export const cartAPI = {
  // 내 장바구니 (인증 필요)
  list: () => fetchAPI<{ items: any[]; updatedAt: string }>("/rental-service/api/carts", { method: "GET" }, true),

  // 장바구니 아이템 추가 (인증 필요)
  addItem: (data: { productId: number; startDate: string; endDate: string }) =>
    fetchAPI(
      "/rental-service/api/carts/items",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 장바구니 아이템 수정 (인증 필요)
  updateItem: (cartItemId: number, data: { startDate: string; endDate: string }) =>
    fetchAPI(
      `/rental-service/api/carts/me/items/${cartItemId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 장바구니 아이템 삭제 (인증 필요)
  deleteItem: (cartItemId: number) =>
    fetchAPI(
      `/rental-service/api/carts/me/items/${cartItemId}`,
      {
        method: "DELETE",
      },
      true,
    ),
}

// Rental API (rental-service)
export const rentalAPI = {
  // 장바구니로 대여 생성 (인증 필요)
  createFromCart: (data: { cartItemIds: number[] }) =>
    fetchAPI(
      "/rental-service/api/rentals/carts",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 바로 대여 생성 (인증 필요)
  create: (data: { productId: number; startDate: string; endDate: string }) =>
    fetchAPI(
      "/rental-service/api/rentals",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 판매자 수락 (인증 필요)
  accept: (rentalItemId: number) =>
    fetchAPI(
      `/rental-service/api/rentals/${rentalItemId}/accept`,
      {
        method: "PATCH",
      },
      true,
    ),

  // 판매자 거절 (인증 필요)
  reject: (rentalItemId: number) =>
    fetchAPI(
      `/rental-service/api/rentals/${rentalItemId}/reject`,
      {
        method: "PATCH",
      },
      true,
    ),

  // 결제 완료 처리 (인증 필요)
  pay: (rentalId: number) =>
    fetchAPI<{ rentalId: number; paidAt: string; amount: number; balance: number; rentalStatus: string }>(
      `/rental-service/api/rentals/${rentalId}/pay`,
      {
        method: "POST",
      },
      true,
    ),

  // 대여 취소 (인증 필요)
  cancel: (rentalItemId: number) =>
    fetchAPI(
      `/rental-service/api/rentals/${rentalItemId}/cancel`,
      {
        method: "PATCH",
      },
      true,
    ),

  // 반납 처리 (인증 필요)
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

  // 환불 (인증 필요)
  refund: (rentalItemId: number) =>
    fetchAPI(
      `/rental-service/api/rentals/${rentalItemId}/refund`,
      {
        method: "POST",
      },
      true,
    ),

  // 대여 연장 (인증 필요)
  extend: (rentalItemId: number, data: { newEndDate: string }) =>
    fetchAPI(
      `/rental-service/api/rentals/${rentalItemId}/extend`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 대여 상세 (인증 필요)
  getDetail: (rentalId: number) =>
    fetchAPI<{ rentalId: number; paidAt: string; items: any[] }>(
      `/rental-service/api/rentals/${rentalId}`,
      { method: "GET" },
      true,
    ),

  // 대여 검색 (인증 필요)
  list: (params?: { startDate?: string; endDate?: string; rentalStatus?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.append("startDate", params.startDate)
    if (params?.endDate) searchParams.append("endDate", params.endDate)
    if (params?.rentalStatus) searchParams.append("rentalStatus", params.rentalStatus)

    const query = searchParams.toString()
    return fetchAPI<any[]>(`/rental-service/api/rentals${query ? `?${query}` : ""}`, { method: "GET" }, true)
  },
}

// Account API (account-service)
export const accountAPI = {
  // 내 예치금 (인증 필요)
  getBalance: () =>
    fetchAPI<{ balance: number; createdAt: string }>("/account-service/api/accounts/balance", { method: "GET" }, true),

  // 내 거래내역 (인증 필요)
  getTransactions: () => fetchAPI<any[]>("/account-service/api/accounts/transactions", { method: "GET" }, true),

  // 충전 요청 (인증 필요)
  requestDeposit: (data: { amount: number }) =>
    fetchAPI(
      "/account-service/api/deposits/pg/request",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 결제 승인 (인증 필요)
  approveDeposit: (data: { paymentKey: string; orderId: string; amount: number }) =>
    fetchAPI(
      "/account-service/api/deposits/pg/approve",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 위젯 설정 조회 (인증 필요)
  getTossConfig: () =>
    fetchAPI<{ clientKey: string; successUrl: string; failUrl: string }>(
      "/account-service/api/deposits/pg/config",
      { method: "GET" },
      true,
    ),

  // 충전 취소/환불 (인증 필요)
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

// Seller API (seller-service)
export const sellerAPI = {
  // 판매자 등록 (인증 필요)
  register: (data: { storeName: string; bizRegNo?: string; storePhone?: string }) =>
    fetchAPI(
      "/seller-service/api/sellers",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 내 판매자 정보 (인증 필요)
  getProfile: () => fetchAPI("/seller-service/api/sellers/self", { method: "GET" }, true),

  // 내 대여 목록 (인증 필요)
  getRentals: (params?: {
    productId?: number
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    size?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.productId) searchParams.append("productId", params.productId.toString())
    if (params?.status) searchParams.append("status", params.status)
    if (params?.startDate) searchParams.append("startDate", params.startDate)
    if (params?.endDate) searchParams.append("endDate", params.endDate)
    if (params?.page !== undefined) searchParams.append("page", params.page.toString())
    if (params?.size !== undefined) searchParams.append("size", params.size.toString())

    const query = searchParams.toString()
    return fetchAPI<any[]>(
      `/seller-service/api/sellers/self/rentals${query ? `?${query}` : ""}`,
      { method: "GET" },
      true,
    )
  },

  // 내 판매자 수정 (인증 필요)
  updateProfile: (data: { storeName: string; bizRegNo?: string; storePhone?: string; status: string }) =>
    fetchAPI(
      "/seller-service/api/sellers/self",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true,
    ),

  // 내 정산 목록 (인증 필요)
  getSettlements: (params?: { periodYm?: string; page?: number; size?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.periodYm) searchParams.append("periodYm", params.periodYm)
    if (params?.page !== undefined) searchParams.append("page", params.page.toString())
    if (params?.size !== undefined) searchParams.append("size", params.size.toString())

    const query = searchParams.toString()
    return fetchAPI(`/seller-service/api/settlements/sellers/self${query ? `?${query}` : ""}`, { method: "GET" }, true)
  },

  // 정산 상세 (인증 필요)
  getSettlementDetail: (sellerSettlementId: number) =>
    fetchAPI(`/seller-service/api/settlements/sellers/self/${sellerSettlementId}`, { method: "GET" }, true),

  // 정산 라인 상세 (인증 필요)
  getSettlementLines: (sellerSettlementId: number) =>
    fetchAPI<any[]>(
      `/seller-service/api/settlements/sellers/self/${sellerSettlementId}/lines`,
      { method: "GET" },
      true,
    ),
}
