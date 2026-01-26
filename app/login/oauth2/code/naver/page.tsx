"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function NaverCallbackPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      // OAuth Provider로부터 받은 코드와 state
      const code = searchParams.get("code")
      const state = searchParams.get("state")
      const oauthError = searchParams.get("error")
      const errorDescription = searchParams.get("error_description")

      // OAuth 에러 처리
      if (oauthError) {
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "oauth_callback",
              provider: "naver",
              error: oauthError,
              errorDescription: errorDescription || "네이버 로그인이 취소되었습니다",
            },
            window.location.origin
          )
          window.close()
        }
        return
      }

      // 코드가 없으면 에러
      if (!code || !state) {
        setError("잘못된 콜백 요청입니다")
        return
      }

      try {
        // 백엔드 API로 코드 전송
        const response = await fetch(`${API_BASE_URL}/api/auth/oauth2/naver/callback?code=${code}&state=${state}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "로그인 처리 중 오류가 발생했습니다")
        }

        // 부모 창으로 결과 전송
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "oauth_callback",
              provider: "naver",
              status: data.status,
              accessToken: data.accessToken,
              signupToken: data.signupToken,
            },
            window.location.origin
          )
          window.close()
        }
      } catch (err: any) {
        console.error("[v0] Naver OAuth callback error:", err)
        setError(err.message || "로그인 처리 중 오류가 발생했습니다")
        
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "oauth_callback",
              provider: "naver",
              error: "callback_error",
              errorDescription: err.message || "로그인 처리 중 오류가 발생했습니다",
            },
            window.location.origin
          )
          window.close()
        }
      }
    }

    handleCallback()
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {error ? (
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            onClick={() => window.close()} 
            className="text-sm text-muted-foreground underline"
          >
            창 닫기
          </button>
        </div>
      ) : (
        <p className="text-muted-foreground">처리 중...</p>
      )}
    </div>
  )
}
