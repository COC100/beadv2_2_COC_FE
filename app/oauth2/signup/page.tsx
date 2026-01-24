"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X } from "lucide-react"
import { authAPI } from "@/lib/api"
import { handlePhoneInput } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function OAuth2SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [provider, setProvider] = useState<string>("")
  const [signupToken, setSignupToken] = useState<string>("")
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
  })
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationToken, setVerificationToken] = useState("")
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [isVerificationSending, setIsVerificationSending] = useState(false)
  const [isVerificationConfirming, setIsVerificationConfirming] = useState(false)
  const [verificationError, setVerificationError] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const providerParam = searchParams.get("provider")
    const tokenParam = searchParams.get("token")

    if (!providerParam || !tokenParam) {
      toast({
        title: "잘못된 접근",
        description: "올바르지 않은 요청입니다.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setProvider(providerParam)
    setSignupToken(tokenParam)
  }, [searchParams, router, toast])

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

  const handleSendVerificationEmail = async () => {
    if (!formData.email) {
      toast({
        title: "이메일 입력 필요",
        description: "이메일을 먼저 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsVerificationSending(true)
    try {
      await authAPI.sendVerificationEmail(formData.email)
      setEmailSent(true)
      setResendCooldown(10)
      setTimeRemaining(300)
      toast({
        title: "인증 메일 발송",
        description: "이메일로 인증번호가 발송되었습니다.",
      })
    } catch (error: any) {
      toast({
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
      toast({
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

      if (response.data.verified && response.data.verificationToken) {
        setIsEmailVerified(true)
        setVerificationToken(response.data.verificationToken)
        setVerificationSuccess(true)
        toast({
          title: "이메일 인증 완료",
          description: "이메일 인증이 완료되었습니다.",
        })
      } else {
        setVerificationError(true)
        toast({
          title: "인증 실패",
          description: "인증번호가 일치하지 않습니다.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setVerificationError(true)
      toast({
        title: "인증 실패",
        description: error.message || "인증번호 확인에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsVerificationConfirming(false)
    }
  }

  const handleOAuth2Signup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isEmailVerified || !verificationToken) {
      toast({
        title: "이메일 인증 필요",
        description: "이메일 인증을 완료해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

      const response = await fetch(`${API_BASE_URL}/member-service/oauth2/${provider}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signupToken,
          email: formData.email,
          phone: formData.phone,
          verificationToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "회원가입에 실패했습니다")
      }

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken)

        toast({
          title: "회원가입 완료",
          description: "환영합니다! 메인 페이지로 이동합니다.",
        })

        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else {
        throw new Error("예상치 못한 응답입니다")
      }
    } catch (error: any) {
      console.error("[v0] OAuth2 Signup failed:", error)
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입에 실패했습니다.",
        variant: "destructive",
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

  const getProviderName = () => {
    if (provider === "kakao") return "카카오"
    if (provider === "google") return "구글"
    if (provider === "naver") return "네이버"
    return ""
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
            <CardTitle>{getProviderName()} 회원가입</CardTitle>
            <CardDescription>회원가입을 완료하기 위해 추가 정보를 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOAuth2Signup} className="space-y-4">
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
                    {isVerificationSending ? "전송 중..." : emailSent ? "재발송" : "인증 메일"}
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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!formData.email || !formData.phone || !isEmailVerified || isLoading}
              >
                {isLoading ? "가입 중..." : "회원가입 완료"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
