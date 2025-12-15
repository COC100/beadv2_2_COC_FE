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
import { handlePhoneInput } from "@/lib/utils"
import { Check, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  })

  const passwordValidation = {
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasLetter: /[a-zA-Z]/.test(formData.password),
    hasLength: formData.password.length >= 8,
  }

  const allPasswordValid =
    passwordValidation.hasSpecial &&
    passwordValidation.hasNumber &&
    passwordValidation.hasLetter &&
    passwordValidation.hasLength

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword

  const isFormValid =
    formData.email &&
    formData.name &&
    formData.phone &&
    formData.password &&
    formData.confirmPassword &&
    allPasswordValid &&
    passwordsMatch &&
    agreed

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!allPasswordValid) {
      setErrorDialog({
        open: true,
        title: "비밀번호 오류",
        message: "비밀번호는 특수문자, 숫자, 영문을 포함하고 8자 이상이어야 합니다.",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorDialog({
        open: true,
        title: "비밀번호 불일치",
        message: "비밀번호가 일치하지 않습니다.",
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
    } catch (error: any) {
      console.error("[v0] Signup failed:", error)
      const errorTitle = "회원가입 실패"
      let errorMessage = "회원가입에 실패했습니다"

      if (error.message) {
        if (error.message.includes("이미") || error.message.includes("중복") || error.message.includes("duplicate")) {
          errorMessage = "이미 사용 중인 이메일입니다"
        } else if (
          error.message.includes("형식") ||
          error.message.includes("format") ||
          error.message.includes("invalid")
        ) {
          errorMessage = "입력 형식이 올바르지 않습니다"
        } else if (error.message.includes("비밀번호") || error.message.includes("password")) {
          errorMessage = "비밀번호는 8자 이상이어야 합니다"
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
                  onChange={(e) => {
                    const formatted = handlePhoneInput(e.target.value)
                    setFormData({ ...formData, phone: formatted })
                  }}
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
                {formData.password && !allPasswordValid && (
                  <div className="text-sm space-y-1 text-destructive">
                    {!passwordValidation.hasSpecial && <p>• 특수문자 필요</p>}
                    {!passwordValidation.hasNumber && <p>• 숫자 필요</p>}
                    {!passwordValidation.hasLetter && <p>• 영문 필요</p>}
                    {!passwordValidation.hasLength && <p>• 8자 이상 필요</p>}
                  </div>
                )}
                {formData.password && allPasswordValid && (
                  <p className="text-sm text-blue-600 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    비밀번호 등록 가능
                  </p>
                )}
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
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <X className="h-4 w-4" />
                    동일하지 않은 비밀번호
                  </p>
                )}
                {formData.confirmPassword && passwordsMatch && (
                  <p className="text-sm text-blue-600 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    동일한 비밀번호
                  </p>
                )}
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
              <Button type="submit" className="w-full" size="lg" disabled={!isFormValid || isLoading}>
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
