"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/api"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    handleCallback()
  }, [searchParams])

  const handleCallback = async () => {
    try {
      const callbackStatus = searchParams.get("status")
      const token = searchParams.get("token")
      const error = searchParams.get("error")

      console.log("[v0] Google OAuth callback:", { callbackStatus, token, error })

      // 에러가 있는 경우
      if (error) {
        setStatus("error")
        setErrorMessage(error === "access_denied" ? "구글 로그인이 취소되었습니다" : "로그인 중 오류가 발생했습니다")
        return
      }

      // 신규 사용자 또는 소셜 미연결 사용자인 경우
      if (callbackStatus === "signup_required" && token) {
        console.log("[v0] Signup required, redirecting to signup page")
        router.push(`/oauth2/signup?provider=google&token=${token}`)
        return
      }

      // 기존 소셜 연결 사용자인 경우 - refresh token은 이미 쿠키로 설정됨
      // access token을 발급받아야 함
      console.log("[v0] Existing user, issuing access token")
      const accessToken = await authAPI.reissueToken()
      
      localStorage.setItem("accessToken", accessToken)
      setStatus("success")
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      })
      
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)
    } catch (error: any) {
      console.error("[v0] Google OAuth callback error:", error)
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
