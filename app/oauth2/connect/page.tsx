"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function OAuth2ConnectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const provider = searchParams.get("provider") || ""
  const signupToken = searchParams.get("token") || ""

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const providerNames: Record<string, string> = {
    google: "구글",
    kakao: "카카오",
    naver: "네이버",
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // 1. 먼저 일반 로그인으로 access token 획득
      const loginResult = await authAPI.login({ email, password })
      localStorage.setItem("accessToken", loginResult)

      // 2. OAuth2 계정 연결
      await authAPI.oauth2Connect({ signupToken })

      toast({
        title: "계정 연결 성공",
        description: `기존 계정에 ${providerNames[provider]} 계정이 연결되었습니다.`,
      })

      setTimeout(() => {
        window.location.href = "/"
      }, 1500)
    } catch (err: any) {
      console.error("[v0] OAuth2 connect error:", err)
      setError(err.message || "계정 연결에 실패했습니다")
      setIsLoading(false)
    }
  }

  const handleSignup = () => {
    router.push(`/oauth2/signup?provider=${provider}&token=${signupToken}`)
  }

  if (!provider || !signupToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>잘못된 요청입니다</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>계정 연결</CardTitle>
          <CardDescription>
            {providerNames[provider]} 계정과 연결할 기존 계정으로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConnect} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  연결 중...
                </>
              ) : (
                "계정 연결"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSignup}
              disabled={isLoading}
            >
              신규 회원가입
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
