"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, Check, X } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState<"email" | "code" | "password">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetToken, setResetToken] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [codeTimer, setCodeTimer] = useState(0)

  const [passwordValidation, setPasswordValidation] = useState({
    hasSpecialChar: false,
    hasNumber: false,
    hasLetter: false,
    hasMinLength: false,
  })

  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null)
  const [codeError, setCodeError] = useState<string | null>(null)

  const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  })
  const [successDialog, setSuccessDialog] = useState(false)

  // Resend timer (10 seconds)
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  // Code expiry timer (5 minutes = 300 seconds)
  useEffect(() => {
    if (codeTimer > 0) {
      const timer = setTimeout(() => setCodeTimer(codeTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [codeTimer])

  // Password validation
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

  // Password match
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

  const handleSendCode = async () => {
    if (!email) {
      setErrorDialog({
        open: true,
        title: "입력 오류",
        message: "이메일 주소를 입력해주세요.",
      })
      return
    }

    setIsLoading(true)

    try {
      await memberAPI.sendPasswordResetCode(email)
      toast({
        title: "인증 코드 발송",
        description: "이메일로 인증 코드를 발송했습니다.",
      })
      setStep("code")
      setCanResend(false)
      setResendTimer(10)
      setCodeTimer(300) // 5 minutes
      setCode("")
      setCodeError(null)
    } catch (error: any) {
      console.error("[v0] Password reset code send failed:", error)
      setErrorDialog({
        open: true,
        title: "발송 실패",
        message: error.message || "인증 코드 발송에 실패했습니다. 이메일 주소를 확인해주세요.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setCodeError("6자리 인증 코드를 입력해주세요")
      return
    }

    setIsLoading(true)
    setCodeError(null)

    try {
      const response = await memberAPI.confirmPasswordResetCode(email, code)
      setResetToken(response.data.resetToken)
      toast({
        title: "인증 완료",
        description: "인증이 완료되었습니다. 새 비밀번호를 설정해주세요.",
      })
      setStep("password")
    } catch (error: any) {
      console.error("[v0] Code verification failed:", error)
      setCodeError("인증 코드가 일치하지 않습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPasswordValid || passwordsMatch !== true) {
      return
    }

    setIsLoading(true)

    try {
      await memberAPI.resetPassword({
        email,
        newPassword,
        resetToken,
      })
      setSuccessDialog(true)
    } catch (error: any) {
      console.error("[v0] Password reset failed:", error)
      setErrorDialog({
        open: true,
        title: "재설정 실패",
        message: error.message || "비밀번호 재설정에 실패했습니다.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
            <CardTitle className="text-2xl">비밀번호 찾기</CardTitle>
            <CardDescription>
              {step === "email" && "가입한 이메일 주소를 입력해주세요"}
              {step === "code" && "이메일로 받은 인증 코드를 입력해주세요"}
              {step === "password" && "새 비밀번호를 설정해주세요"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "email" && (
              <div className="space-y-6">
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
                <Button onClick={handleSendCode} className="w-full h-12 rounded-xl" disabled={isLoading}>
                  {isLoading ? "발송 중..." : "인증 메일 전송"}
                </Button>
              </div>
            )}

            {step === "code" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input id="email" type="email" value={email} disabled className="rounded-xl bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">인증 코드</Label>
                  <div className="relative">
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        if (value.length <= 6) {
                          setCode(value)
                          setCodeError(null)
                        }
                      }}
                      maxLength={6}
                      className="rounded-xl text-center text-2xl tracking-widest pr-16"
                    />
                    {codeTimer > 0 && (
                      <div
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium ${codeTimer < 60 ? "text-red-600" : "text-blue-600"}`}
                      >
                        {codeTimer > 0 ? formatTime(codeTimer) : "만료됨"}
                      </div>
                    )}
                  </div>
                  {codeError && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <X className="h-4 w-4" />
                      {codeError}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendCode}
                    disabled={!canResend || isLoading}
                    className="bg-transparent"
                  >
                    재발송
                  </Button>
                  <Button onClick={handleVerifyCode} className="flex-1" disabled={code.length !== 6 || isLoading}>
                    {isLoading ? "확인 중..." : "인증 확인"}
                  </Button>
                </div>
              </div>
            )}

            {step === "password" && (
              <form onSubmit={handleResetPassword} className="space-y-6">
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
                  {passwordsMatch === false && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <X className="h-4 w-4" />
                      동일하지 않은 비밀번호
                    </div>
                  )}
                  {passwordsMatch === true && (
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <Check className="h-4 w-4" />
                      동일한 비밀번호
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl"
                  disabled={!isPasswordValid || passwordsMatch !== true || isLoading}
                >
                  {isLoading ? "처리 중..." : "비밀번호 변경"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            로그인으로 돌아가기
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
            <AlertDialogAction onClick={() => router.push("/login")}>로그인하기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
