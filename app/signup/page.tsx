"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Check, X, ArrowLeft } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertPopup } from "@/components/alert-popup"
import { authAPI, memberAPI } from "@/lib/api"
import { handlePhoneInput } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showEmailSignup, setShowEmailSignup] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  })
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState<{ open: boolean; title: string; description: string; variant?: "default" | "destructive" }>({
    open: false,
    title: "",
    description: "",
  })
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  })

  const [verificationCode, setVerificationCode] = useState("")
  const [verificationToken, setVerificationToken] = useState("")
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isVerificationSending, setIsVerificationSending] = useState(false)
  const [isVerificationConfirming, setIsVerificationConfirming] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [verificationError, setVerificationError] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)

  const [resendCooldown, setResendCooldown] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeRemaining])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [resendCooldown])

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
    agreed &&
    isEmailVerified

  const handleSendVerificationEmail = async () => {
    if (!formData.email) {
      setAlert({
        open: true,
        title: "이메일 입력 필요",
        description: "이메일을 먼저 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsVerificationSending(true)
    try {
      const response = await authAPI.sendVerificationEmail(formData.email)
      console.log("[v0] Verification email sent:", response)
      setEmailSent(true)
      setResendCooldown(10)
      setTimeRemaining(300) // 5 minutes = 300 seconds
      setAlert({
        open: true,
        title: "인증 메일 발송",
        description: "이메일로 인증번호가 발송되었습니다.",
      })
    } catch (error: any) {
      console.error("[v0] Send verification email failed:", error)
      setAlert({
        open: true,
        title: "인증 메일 발송 실패",
        description: error.message || "인증 메일 발송에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsVerificationSending(false)
    }
  }

  const handleConfirmVerificationCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setAlert({
        open: true,
        title: "인증번호 입력 필요",
        description: "6자리 인증번호를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsVerificationConfirming(true)
    setVerificationError(false)
    setVerificationSuccess(false)

    try {
      const response = await authAPI.confirmVerificationCode(formData.email, verificationCode)
      console.log("[v0] Verification confirm response:", response)

      if (response.data.verified && response.data.verificationToken) {
        setIsEmailVerified(true)
        setVerificationToken(response.data.verificationToken)
        setVerificationSuccess(true)
        setVerificationError(false)
        setAlert({
          open: true,
          title: "이메일 인증 완료",
          description: "이메일 인증이 완료되었습니다.",
        })
      } else {
        setVerificationError(true)
        setVerificationSuccess(false)
        setAlert({
          open: true,
          title: "인증 실패",
          description: "인증번호가 일치하지 않습니다.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("[v0] Confirm verification code failed:", error)
      setVerificationError(true)
      setVerificationSuccess(false)
      setAlert({
        open: true,
        title: "인증 실패",
        description: error.message || "인증번호 확인에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsVerificationConfirming(false)
    }
  }

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

    if (!isEmailVerified || !verificationToken) {
      setErrorDialog({
        open: true,
        title: "이메일 인증 필요",
        message: "이메일 인증을 완료해주세요.",
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
        verificationToken: verificationToken,
      })

      setAlert({
        open: true,
        title: "회원가입 완료",
        description: "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.",
      })

      setTimeout(() => {
        router.push("/login")
      }, 2000)
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

  const handleSocialSignup = (provider: string) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""
    window.location.href = `${API_BASE_URL}/member-service/oauth2/authorization/${provider}`
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
            <CardTitle className="flex items-center gap-2">
              {showEmailSignup && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowEmailSignup(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              회원가입
            </CardTitle>
            <CardDescription>
              {showEmailSignup ? "새로운 계정을 만드세요" : "간편하게 시작하세요"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showEmailSignup ? (
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialSignup("google")}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google로 계속하기
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 border-[#FEE500]"
                  onClick={() => handleSocialSignup("kakao")}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"
                    />
                  </svg>
                  Kakao로 계속하기
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-[#03C75A] hover:bg-[#03C75A]/90 border-[#03C75A] text-white"
                  onClick={() => handleSocialSignup("naver")}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="white" d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                  </svg>
                  Naver로 계속하기
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">또는</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowEmailSignup(true)}
                >
                  이메일로 회원가입
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    이메일 <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isEmailVerified}
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleSendVerificationEmail}
                      disabled={!formData.email || isVerificationSending || resendCooldown > 0 || isEmailVerified}
                      variant="outline"
                    >
                      {isVerificationSending ? "전송 중..." : emailSent ? "재발송" : "인증 메일 전송"}
                    </Button>
                  </div>
                </div>

                {emailSent && !isEmailVerified && (
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">
                      인증번호 <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="verificationCode"
                          type="text"
                          placeholder="6자리 인증번호"
                          value={verificationCode}
                          onChange={(e) => {
                            setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                            setVerificationError(false)
                            setVerificationSuccess(false)
                          }}
                          maxLength={6}
                          required
                          className="pr-16"
                        />
                        {timeRemaining > 0 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600">
                            {formatTime(timeRemaining)}
                          </div>
                        )}
                        {timeRemaining === 0 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-destructive">
                            만료됨
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={handleConfirmVerificationCode}
                        disabled={verificationCode.length !== 6 || isVerificationConfirming || timeRemaining === 0}
                        variant="outline"
                      >
                        {isVerificationConfirming ? "확인 중..." : "인증 확인"}
                      </Button>
                    </div>
                    {verificationError && verificationCode.length === 6 && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <X className="h-4 w-4" />
                        인증번호가 일치하지 않습니다
                      </p>
                    )}
                    {verificationSuccess && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        인증번호 확인 완료
                      </p>
                    )}
                  </div>
                )}

                {isEmailVerified && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    이메일 인증 완료
                  </p>
                )}

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
                  <Checkbox
                    id="terms"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked as boolean)}
                    className="border-2"
                  />
                  <label htmlFor="terms" className="text-sm leading-none cursor-pointer">
                    <span className="text-destructive">(필수)</span>{" "}
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
            )}
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

      <AlertPopup
        open={alert.open}
        onOpenChange={(open) => setAlert({ ...alert, open })}
        title={alert.title}
        description={alert.description}
        variant={alert.variant}
      />
    </div>
  )
}
