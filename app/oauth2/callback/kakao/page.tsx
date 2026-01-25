"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OAUTH_CONFIG, validateState } from "@/lib/oauth-config"
import { useToast } from "@/hooks/use-toast"

export default function KakaoCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    console.log("[v0] Kakao callback:", { code, state, error, errorDescription })

    if (error) {
      setStatus("error")
      setErrorMessage(errorDescription || "카카오 로그인이 취소되었습니다")
      return
    }

    if (!code || !state) {
      setStatus("error")
      setErrorMessage("잘못된 요청입니다")
      return
    }

    // State 검증
    if (!validateState(state)) {
      setStatus("error")
      setErrorMessage("보안 검증에 실패했습니다")
      return
    }

    // 백엔드로 code 전송하여 토큰 발급 및 사용자 정보 처리
    handleKakaoLogin(code)
  }, [searchParams])

  const handleKakaoLogin = async (code: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""
      const API_BASIC_AUTH_USERNAME = process.env.NEXT_PUBLIC_API_BASIC_AUTH_USERNAME || ""
      const API_BASIC_AUTH_PASSWORD = process.env.NEXT_PUBLIC_API_BASIC_AUTH_PASSWORD || ""

      console.log("[v0] Sending code to backend:", { code, redirectUri: OAUTH_CONFIG.kakao.redirectUri })

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      // Add HTTP Basic Auth if configured
      if (API_BASIC_AUTH_USERNAME && API_BASIC_AUTH_PASSWORD) {
        const basicAuth = btoa(`${API_BASIC_AUTH_USERNAME}:${API_BASIC_AUTH_PASSWORD}`)
        headers.Authorization = `Basic ${basicAuth}`
        console.log("[v0] Adding Basic Auth to OAuth callback request")
      }

      // 백엔드의 카카오 OAuth2 콜백 엔드포인트로 authorization code 전송
      // 백엔드에서 토큰 발급, 사용자 정보 조회, 회원 확인/가입 처리
      const response = await fetch(`${API_BASE_URL}/oauth2/kakao/callback`, {
        method: "POST",
        headers,
        credentials: "include", // 쿠키 포함 (refresh token 수신용)
        body: JSON.stringify({
          code,
          redirectUri: OAUTH_CONFIG.kakao.redirectUri,
        }),
      })

      console.log("[v0] Response status:", response.status)
      
      const responseText = await response.text()
      console.log("[v0] Response text:", responseText)

      if (!response.ok) {
        // 에러 응답 처리
        try {
          const errorData = JSON.parse(responseText)
          throw new Error(errorData.message || "로그인 처리에 실패했습니다")
        } catch (e) {
          throw new Error("로그인 처리에 실패했습니다")
        }
      }

      // 성공 응답 처리 - JSON 또는 plain text 모두 처리
      let data: any
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        // plain text인 경우 (accessToken만 반환)
        const accessToken = responseText.trim().replace(/^"|"$/g, "")
        if (accessToken) {
          data = { accessToken }
        } else {
          throw new Error("예상치 못한 응답입니다")
        }
      }

      console.log("[v0] Parsed data:", data)

      // 기존 회원인 경우 - 토큰 저장 후 메인으로 이동
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken)
        setStatus("success")
        toast({
          title: "로그인 성공",
          description: "환영합니다!",
        })
        // Force a complete navigation to ensure token is recognized
        setTimeout(() => {
          window.location.href = "/"
        }, 1000)
      }
      // 신규 회원인 경우 - 추가 정보 입력 페이지로 이동
      else if (data.signupToken) {
        router.push(`/oauth2/signup?provider=kakao&token=${data.signupToken}`)
      } else {
        throw new Error("예상치 못한 응답입니다")
      }
    } catch (error: any) {
      console.error("[v0] Kakao login error:", error)
      setStatus("error")
      setErrorMessage(error.message || "로그인 처리 중 오류가 발생했습니다")
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">카카오 로그인 처리 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-lg font-semibold">로그인 성공!</p>
            <p className="text-muted-foreground">메인 페이지로 이동합니다...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-lg font-semibold">로그인 실패</p>
          <p className="text-muted-foreground text-center">{errorMessage}</p>
          <Button onClick={() => router.push("/login")}>로그인 페이지로 돌아가기</Button>
        </CardContent>
      </Card>
    </div>
  )
}
