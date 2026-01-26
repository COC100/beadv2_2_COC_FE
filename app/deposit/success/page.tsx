"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { accountAPI } from "@/lib/api"
import Link from "next/link"

export default function DepositSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [depositInfo, setDepositInfo] = useState<any>(null)

  useEffect(() => {
    confirmPayment()
  }, [])

  const confirmPayment = async () => {
    try {
      const paymentKey = searchParams.get("paymentKey")
      const orderId = searchParams.get("orderId")
      const amount = searchParams.get("amount")

      console.log("[v0] Success page - URL params:", {
        paymentKey,
        orderId,
        amount,
        fullURL: typeof window !== "undefined" ? window.location.href : "N/A",
        allParams: Object.fromEntries(searchParams.entries()),
      })

      if (!paymentKey || !orderId || !amount) {
        console.error("[v0] Missing required payment params:", {
          hasPaymentKey: !!paymentKey,
          hasOrderId: !!orderId,
          hasAmount: !!amount,
        })
        throw new Error("결제 정보가 올바르지 않습니다.")
      }

      console.log("[v0] Confirming payment with backend API...")
      console.log("[v0] API call params:", {
        paymentKey,
        orderId,
        amount: Number(amount),
      })

      const result = await accountAPI.approveDeposit({
        paymentKey,
        orderId,
        amount: Number(amount),
      })

      console.log("[v0] Payment approved successfully:", result)
      console.log("[v0] Result data structure:", {
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : [],
        fullResult: result,
      })

      setDepositInfo(result)
      setStatus("success")
    } catch (error: any) {
      console.error("[v0] Payment confirmation failed:", error)
      console.error("[v0] Error details:", {
        message: error.message,
        code: error.code,
        response: error.response,
        stack: error.stack,
      })
      setErrorMessage(error.message || "결제 승인에 실패했습니다.")
      setStatus("error")
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">결제를 승인하는 중입니다...</p>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="rounded-2xl shadow-lg border-destructive">
              <CardHeader>
                <CardTitle className="text-2xl text-destructive">결제 승인 실패</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{errorMessage}</p>
                <div className="flex gap-3">
                  <Link href="/deposit" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      다시 시도
                    </Button>
                  </Link>
                  <Link href="/mypage" className="flex-1">
                    <Button className="w-full">마이페이지로</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-2xl shadow-lg">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-3xl">충전이 완료되었습니다!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {depositInfo && (
                <div className="bg-muted p-6 rounded-xl space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">충전 금액</span>
                    <span className="font-bold text-lg">
                      ₩
                      {(() => {
                        const amount = depositInfo.data?.amount || depositInfo.amount || 0
                        console.log("[v0] Displaying amount:", amount)
                        return amount.toLocaleString()
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">승인일시</span>
                    <span className="text-sm">
                      {(() => {
                        const approvedAt = depositInfo.data?.approvedAt || depositInfo.approvedAt
                        console.log("[v0] Displaying approvedAt:", approvedAt)
                        if (!approvedAt) return "승인 완료"
                        try {
                          const date = new Date(approvedAt)
                          return date.toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })
                        } catch (e) {
                          console.error("[v0] Date parsing error:", e)
                          return "승인 완료"
                        }
                      })()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Link href="/deposit" className="flex-1">
                  <Button variant="outline" className="w-full h-12 bg-transparent">
                    추가 충전
                  </Button>
                </Link>
                <Link href="/mypage" className="flex-1">
                  <Button className="w-full h-12">마이페이지로</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
