"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function NaverCallbackPage() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // 부모 창(로그인 페이지)으로 콜백 결과 전송
    if (window.opener) {
      const callbackStatus = searchParams.get("status")
      const accessToken = searchParams.get("token")
      const error = searchParams.get("error")
      const errorDescription = searchParams.get("error_description")
      const signupToken = searchParams.get("signupToken")

      window.opener.postMessage(
        {
          type: "oauth_callback",
          provider: "naver",
          status: callbackStatus,
          accessToken,
          signupToken,
          error,
          errorDescription,
        },
        window.location.origin
      )

      // 팝업 창 닫기
      window.close()
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <p className="text-muted-foreground">처리 중...</p>
    </div>
  )
}
