"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OAUTH_CONFIG, validateState } from "@/lib/oauth-config"
import { useToast } from "@/hooks/use-toast"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    console.log("[v0] Google callback:", { code, state, error })

    if (error) {
      setStatus("error")
      setErrorMessage("구글 로그인이 취소되었습니다")
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
    handleGoogleLogin(code)
  }, [searchParams])

  const handleGoogleLogin = async (code: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

      console.log("[v0] Sending code to backend:", { code, redirectUri: OAUTH_CONFIG.google.redirectUri })

      // 백엔드에 code를 전송하여 처리
      const response = await fetch(`${API_BASE_URL}/member-service/oauth2/google/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          redirectUri: OAUTH_CONFIG.google.redirectUri,
        }),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      // 응답이 JSON인지 확인
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[v0] Non-JSON response:", text)
        throw new Error("서버에서 올바른 응답을 받지 못했습니다")
      }

      // 응답 본문이 비어있는지 확인
      const responseText = await response.text()
      console.log("[v0] Response text:", responseText)

      if (!responseText) {
        throw new Error("서버에서 빈 응답을 받았습니다")
      }

      const data = JSON.parse(responseText)
      console.log("[v0] Parsed data:", data)

      if (!response.ok) {
        throw new Error(data.message || "로그인 처리에 실패했습니다")
      }

      // 기존 회원인 경우 - 토큰 저장 후 메인으로 이동
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken)
        setStatus("success")
        toast({
          title: "로그인 성공",
          description: "환영합니다!",
        })
        setTimeout(() => {
          router.push("/")
        }, 1500)
      }
      // 신규 회원인 경우 - 추가 정보 입력 페이지로 이동
      else if (data.signupToken) {
        router.push(`/oauth2/signup?provider=google&token=${data.signupToken}`)
      } else {
        throw new Error("예상치 못한 응답입니다")
      }
    } catch (error: any) {
      console.error("[v0] Google login error:", error)
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
            <p className="text-muted-foreground">구글 로그인 처리 중...</p>
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
