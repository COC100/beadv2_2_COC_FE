"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { memberAPI } from "@/lib/api"

export default function PasswordResetPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get("email") || ""

  const [email, setEmail] = useState(emailFromUrl)
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  })
  const [successDialog, setSuccessDialog] = useState(false)

  const [passwordValidation, setPasswordValidation] = useState({
    hasSpecialChar: false,
    hasNumber: false,
    hasLetter: false,
    hasMinLength: false,
  })

  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null)

  useEffect(() => {
    if (newPassword) {
      setPasswordValidation({
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
        hasNumber: /\d/.test(newPassword),
        hasLetter: /[a-zA-Z]/.test(newPassword),
        hasMinLength: newPassword.length >= 8,
      })
    }
  }, [newPassword])

  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(newPassword === confirmPassword)
    } else {
      setPasswordsMatch(null)
    }
  }, [newPassword, confirmPassword])

  const isPasswordValid =
    passwordValidation.hasSpecialChar &&
    passwordValidation.hasNumber &&
    passwordValidation.hasLetter &&
    passwordValidation.hasMinLength

  const canSubmit = email && code.length === 6 && isPasswordValid && passwordsMatch === true

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSubmit) {
      return
    }

    setIsLoading(true)

    try {
      console.log("[v0] Confirming password reset")
      await memberAPI.confirmPasswordReset({
        email,
        code,
        newPassword,
      })
      console.log("[v0] Password reset successful")
      setSuccessDialog(true)
    } catch (error: any) {
      console.error("[v0] Password reset failed:", error)
      let errorMessage = "비밀번호 재설정에 실패했습니다."

      if (error.message.includes("인증 코드")) {
        errorMessage = "인증 코드가 올바르지 않거나 만료되었습니다."
      } else if (error.message.includes("이메일")) {
        errorMessage = "이메일 주소를 확인해주세요."
      }

      setErrorDialog({
        open: true,
        title: "재설정 실패",
        message: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessClose = () => {
    setSuccessDialog(false)
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            Modi
          </Link>
          <p className="text-muted-foreground mt-2">전자기기 렌탈 플랫폼</p>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">새 비밀번호 설정</CardTitle>
            <CardDescription>이메일로 받은 인증 코드와 새 비밀번호를 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">인증 코드 (6자리)</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "")
                    if (value.length <= 6) {
                      setCode(value)
                    }
                  }}
                  required
                  maxLength={6}
                  className="rounded-xl text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground">이메일로 받은 6자리 인증 코드를 입력해주세요</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="새 비밀번호"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="rounded-xl"
                />
                {newPassword && (
                  <div className="space-y-1 text-sm">
                    <div className={passwordValidation.hasMinLength ? "text-blue-600" : "text-red-600"}>
                      {passwordValidation.hasMinLength ? (
                        <Check className="inline h-4 w-4" />
                      ) : (
                        <X className="inline h-4 w-4" />
                      )}
                      {" 길이 8자 이상"}
                    </div>
                    <div className={passwordValidation.hasLetter ? "text-blue-600" : "text-red-600"}>
                      {passwordValidation.hasLetter ? (
                        <Check className="inline h-4 w-4" />
                      ) : (
                        <X className="inline h-4 w-4" />
                      )}
                      {" 영문 포함"}
                    </div>
                    <div className={passwordValidation.hasNumber ? "text-blue-600" : "text-red-600"}>
                      {passwordValidation.hasNumber ? (
                        <Check className="inline h-4 w-4" />
                      ) : (
                        <X className="inline h-4 w-4" />
                      )}
                      {" 숫자 포함"}
                    </div>
                    <div className={passwordValidation.hasSpecialChar ? "text-blue-600" : "text-red-600"}>
                      {passwordValidation.hasSpecialChar ? (
                        <Check className="inline h-4 w-4" />
                      ) : (
                        <X className="inline h-4 w-4" />
                      )}
                      {" 특수문자 포함"}
                    </div>
                    {isPasswordValid && <div className="text-blue-600 font-medium">✓ 비밀번호 등록 가능</div>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-xl"
                />
                {passwordsMatch === false && <p className="text-sm text-red-600">동일하지 않은 비밀번호</p>}
                {passwordsMatch === true && <p className="text-sm text-blue-600">동일한 비밀번호</p>}
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl" disabled={!canSubmit || isLoading}>
                {isLoading ? "처리 중..." : "비밀번호 변경"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            다시 인증 코드 받기
          </Link>
        </div>
      </div>

      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{errorDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={successDialog} onOpenChange={setSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>비밀번호 변경 완료</AlertDialogTitle>
            <AlertDialogDescription>
              비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessClose}>로그인하기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
