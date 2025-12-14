"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { memberAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await memberAPI.login(email, password)

      if (response.success && response.data) {
        // Store token in localStorage or cookie
        localStorage.setItem("accessToken", response.data.accessToken)
        localStorage.setItem("refreshToken", response.data.refreshToken)
        localStorage.setItem("memberId", response.data.memberId.toString())

        toast({
          title: "로그인 성공!",
          description: "Modi에 오신 것을 환영합니다.",
        })
        router.push("/")
      } else {
        toast({
          variant: "destructive",
          title: "로그인 실패",
          description: "로그인에 실패했습니다.",
        })
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "로그인 중 오류가 발생했습니다.",
      })
    } finally {
      setLoading(false)
    }
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
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "로그인 중..." : "로그인"}
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
    </div>
  )
}
