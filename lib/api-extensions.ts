import { fetchAPI } from "./api"

// Chat Service APIs
export const chatAPI = {
  createRoom: (data: { sellerId: number; memberId: number }) =>
    fetchAPI<{
      roomId: number
      roomKey: string
      sellerId: number
      memberId: number
      createdAt: string
      updatedAt: string
    }>(
      "/seller-service/api/chat/rooms",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  getRoom: (roomId: number) =>
    fetchAPI<{
      roomId: number
      roomKey: string
      sellerId: number
      memberId: number
      createdAt: string
      updatedAt: string
    }>(`/seller-service/api/chat/rooms/${roomId}`, {}, true),

  getMessages: (roomId: number, params?: { cursorId?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.cursorId !== undefined) queryParams.append("cursorId", params.cursorId.toString())
      if (params.size !== undefined) queryParams.append("size", params.size.toString())
    }
    return fetchAPI<{
      messages: Array<{
        messageId: number
        roomId: number
        senderId: number
        senderRole: string
        content: string
        sentAt: string
      }>
      nextCursorId: number
      hasNext: boolean
    }>(
      `/seller-service/api/chat/rooms/${roomId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },
}

// AI Service APIs
export const aiAPI = {
  getRecommendations: (data: { productId?: number; query?: string; categories?: string[]; size?: number }) =>
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

  getRecentRecommendations: (params?: { size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.size !== undefined) {
      queryParams.append("size", params.size.toString())
    }
    return fetchAPI<
      Array<{
        productId: number
        name: string
        category: string
        specs: Record<string, string>
        status: string
        distance: number
      }>
    >(
      `/ai-service/api/ai/recommendations/recent${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  generateDescription: (data: {
    productName: string
    category: string
    specs?: Record<string, string>
    pricePerDay?: number
  }) =>
    fetchAPI<{ description: string }>(
      "/ai-service/api/ai/descriptions",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  chatTest: (message: string) =>
    fetchAPI<string>(
      "/ai-service/api/ai/chat-test",
      {
        method: "POST",
        body: JSON.stringify({ message }),
      },
      false,
    ),
}

// Admin Service APIs
export const adminAPI = {
  // Member Management
  getMembers: (params?: {
    keyword?: string
    status?: string
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
    return fetchAPI<{
      content: Array<{
        memberId: number
        email: string
        name: string
        phone: string
        role: string
        status: string
        createdAt: string
      }>
      totalElements: number
      totalPages: number
      number: number
    }>(
      `/member-service/api/admin/members${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  updateMemberStatus: (memberId: number, status: string) =>
    fetchAPI(
      `/member-service/api/admin/members/${memberId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
      true,
    ),

  // Seller Management
  getPendingSellers: (params?: { page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    return fetchAPI<{
      content: Array<{
        sellerId: number
        memberId: number
        storeName: string
        bizRegNo: string
        storePhone: string
        status: string
        createdAt: string
      }>
      totalElements: number
      totalPages: number
    }>(
      `/seller-service/api/admin/sellers/pending${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  approveSeller: (sellerId: number) =>
    fetchAPI(
      `/seller-service/api/admin/sellers/${sellerId}/approve`,
      {
        method: "PATCH",
      },
      true,
    ),

  rejectSeller: (sellerId: number) =>
    fetchAPI(
      `/seller-service/api/admin/sellers/${sellerId}/reject`,
      {
        method: "PATCH",
      },
      true,
    ),

  // Settlement Management
  getAllSettlements: (params?: { periodYm?: string; page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    return fetchAPI<{
      content: Array<{
        id: number
        batchId: number
        sellerId: number
        periodYm: string
        totalRentalAmount: number
        totalFeeAmount: number
        settlementAmount: number
        status: string
        paidAt: string
        createdAt: string
      }>
      totalElements: number
      totalPages: number
    }>(
      `/seller-service/internal/settlements/seller-settlements${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  paySettlement: (sellerSettlementId: number, paidAt?: string) => {
    const queryParams = paidAt ? `?paidAt=${encodeURIComponent(paidAt)}` : ""
    return fetchAPI(
      `/seller-service/internal/settlements/seller-settlements/${sellerSettlementId}/pay${queryParams}`,
      {
        method: "POST",
      },
      true,
    )
  },

  // Notice Management
  getNotices: (params?: { page?: number; size?: number }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    return fetchAPI<{
      content: Array<{
        noticeId: number
        title: string
        content: string
        createdAt: string
        updatedAt: string
      }>
      totalElements: number
      totalPages: number
    }>(
      `/seller-service/api/admin/notices${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
      {},
      true,
    )
  },

  getNotice: (noticeId: number) =>
    fetchAPI<{
      noticeId: number
      title: string
      content: string
      createdAt: string
      updatedAt: string
    }>(`/seller-service/api/admin/notices/${noticeId}`, {}, true),

  createNotice: (data: { title: string; content: string }) =>
    fetchAPI(
      "/seller-service/api/admin/notices",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),

  updateNotice: (noticeId: number, data: { title?: string; content?: string }) =>
    fetchAPI(
      `/seller-service/api/admin/notices/${noticeId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      true,
    ),

  deleteNotice: (noticeId: number) =>
    fetchAPI(
      `/seller-service/api/admin/notices/${noticeId}`,
      {
        method: "DELETE",
      },
      true,
    ),
}
