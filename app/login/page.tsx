"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/api"
import { getKakaoAuthUrl, getGoogleAuthUrl, getNaverAuthUrl } from "@/lib/oauth-config"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const memberAPI = authAPI; // Declare memberAPI variable

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authAPI.login({ email, password })

      console.log("[v0] Login response:", {
        hasAccessToken: !!response.accessToken,
      })

      localStorage.setItem("accessToken", response.accessToken)

      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      })

      router.push("/")
    } catch (error: any) {
      console.error("[v0] Login failed:", error)
      const errorTitle = "로그인 실패"
      let errorMessage = "이메일 또는 비밀번호를 확인해주세요"

      if (error.message) {
        if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          errorMessage = "이메일 또는 비밀번호가 일치하지 않습니다"
        } else if (error.message.includes("404") || error.message.includes("Not Found")) {
          errorMessage = "존재하지 않는 계정입니다"
        } else if (error.message.includes("500") || error.message.includes("서버")) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
        } else if (error.message.includes("Network") || error.message.includes("Failed to fetch")) {
          errorMessage = "네트워크 연결을 확인해주세요"
        } else {
          errorMessage = error.message
        }
      }

      setErrorDialog({
        open: true,
        title: errorTitle,
        message: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = (provider: "google" | "kakao" | "naver") => {
    // OAuth URL 가져오기
    let authUrl: string
    if (provider === "google") {
      authUrl = getGoogleAuthUrl()
    } else if (provider === "kakao") {
      authUrl = getKakaoAuthUrl()
    } else {
      authUrl = getNaverAuthUrl()
    }

    // 팝업 창 열기
    const width = 500
    const height = 600
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const popup = window.open(
      authUrl,
      `${provider}_oauth`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    )

    // 메시지 리스너 등록
    const handleMessage = (event: MessageEvent) => {
      // 보안: origin 검증
      if (event.origin !== window.location.origin) return

      // OAuth 콜백 메시지인지 확인
      if (event.data?.type === "oauth_callback" && event.data?.provider === provider) {
        // 리스너 제거
        window.removeEventListener("message", handleMessage)

        const { status, accessToken, signupToken, error, errorDescription } = event.data

        // 에러 처리
        if (error) {
          setErrorDialog({
            open: true,
            title: "로그인 실패",
            message: errorDescription || `${provider} 로그인이 취소되었습니다`,
          })
          return
        }

        // 신규 사용자 - 회원가입 페이지로 이동
        if (status === "signup_required" && signupToken) {
          router.push(`/oauth2/signup?provider=${provider}&token=${signupToken}`)
          return
        }

        // 기존 사용자 - 토큰 저장 후 메인으로 이동
        if (status === "success" && accessToken) {
          localStorage.setItem("accessToken", accessToken)
          toast({
            title: "로그인 성공",
            description: "환영합니다!",
          })
          router.push("/")
          return
        }

        // 예상하지 못한 응답
        setErrorDialog({
          open: true,
          title: "로그인 실패",
          message: "로그인 처리 중 오류가 발생했습니다",
        })
      }
    }

    window.addEventListener("message", handleMessage)

    // 팝업이 닫혔는지 체크 (사용자가 수동으로 닫은 경우)
    const checkPopupClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopupClosed)
        window.removeEventListener("message", handleMessage)
      }
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold text-primary">
            Modi
          </Link>
          <p className="text-muted-foreground mt-2">전자기기 렌탈 플랫폼</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>로그인</CardTitle>
            <CardDescription>Modi 계정으로 로그인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">비밀번호</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    비밀번호 찾기
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                회원가입
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{errorDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog({ ...errorDialog, open: false })}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
