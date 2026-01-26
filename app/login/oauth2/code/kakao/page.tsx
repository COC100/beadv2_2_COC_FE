"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""
const API_BASIC_AUTH_USERNAME = process.env.NEXT_PUBLIC_API_BASIC_AUTH_USERNAME || ""
const API_BASIC_AUTH_PASSWORD = process.env.NEXT_PUBLIC_API_BASIC_AUTH_PASSWORD || ""

export default function KakaoCallbackPage() {
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
              provider: "kakao",
              error: oauthError,
              errorDescription: errorDescription || "카카오 로그인이 취소되었습니다",
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
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        }

        // Add HTTP Basic Auth if configured
        if (API_BASIC_AUTH_USERNAME && API_BASIC_AUTH_PASSWORD) {
          const basicAuth = btoa(`${API_BASIC_AUTH_USERNAME}:${API_BASIC_AUTH_PASSWORD}`)
          headers.Authorization = `Basic ${basicAuth}`
          console.log("[v0] Adding Basic Auth to Kakao OAuth callback")
        }

        if (API_BASE_URL.includes("ngrok")) {
          headers["ngrok-skip-browser-warning"] = "true"
        }

        const response = await fetch(`${API_BASE_URL}/oauth2/kakao/callback`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            code: code,
            redirectUri: window.location.origin + "/login/oauth2/code/kakao"
          }),
        })

        console.log("[v0] Kakao callback response status:", response.status)
        
        // 응답이 비어있는지 확인
        const contentType = response.headers.get("content-type")
        console.log("[v0] Content-Type:", contentType)
        
        let data: any = {}
        
        // 응답 본문이 있는지 확인
        if (contentType && contentType.includes("application/json")) {
          const text = await response.text()
          console.log("[v0] Response text:", text)
          
          if (text && text.trim()) {
            try {
              data = JSON.parse(text)
            } catch (parseError) {
              console.error("[v0] JSON parse error:", parseError)
              throw new Error("서버 응답을 처리할 수 없습니다")
            }
          }
        }

        if (!response.ok) {
          throw new Error(data.message || "로그인 처리 중 오류가 발생했습니다")
        }

        // 부모 창으로 결과 전송
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "oauth_callback",
              provider: "kakao",
              status: data.status,
              accessToken: data.accessToken,
              signupToken: data.signupToken,
            },
            window.location.origin
          )
          window.close()
        }
      } catch (err: any) {
        console.error("[v0] Kakao OAuth callback error:", err)
        setError(err.message || "로그인 처리 중 오류가 발생했습니다")
        
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "oauth_callback",
              provider: "kakao",
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
