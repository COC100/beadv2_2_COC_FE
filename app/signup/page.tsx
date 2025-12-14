"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { memberAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  })
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await memberAPI.signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
      })

      toast({
        title: "회원가입 성공",
        description: "로그인 페이지로 이동합니다.",
      })

      router.push("/login")
    } catch (error) {
      console.error("[v0] Signup failed:", error)
      toast({
        title: "회원가입 실패",
        description: error instanceof Error ? error.message : "회원가입에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
            <CardTitle>회원가입</CardTitle>
            <CardDescription>새로운 계정을 만드세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  이메일 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">
                  이름 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  전화번호 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  비밀번호 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  비밀번호 확인 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
                <label
                  htmlFor="terms"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <Link href="/terms" className="text-primary hover:underline">
                    이용약관
                  </Link>{" "}
                  및{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    개인정보처리방침
                  </Link>
                  에 동의합니다
                </label>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={!agreed || isLoading}>
                {isLoading ? "회원가입 중..." : "회원가입"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                로그인
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
