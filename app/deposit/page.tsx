"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Wallet } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { accountAPI } from "@/lib/api"

declare global {
  interface Window {
    TossPayments: any
  }
}

export default function DepositPage() {
  const [amount, setAmount] = useState("")
  const [currentBalance, setCurrentBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [tossPayments, setTossPayments] = useState<any>(null)
  const { toast } = useToast()

  const presetAmounts = [50000, 100000, 200000, 500000]

  useEffect(() => {
    loadBalance()
    initializeTossPayments()
  }, [])

  const loadBalance = async () => {
    try {
      const balance = await accountAPI.getBalance()
      setCurrentBalance(balance.balance)
    } catch (error: any) {
      console.error("[v0] Failed to load balance:", error)
      toast({
        title: "예치금 조회 실패",
        description: error.message || "예치금 정보를 불러올 수 없습니다.",
        variant: "destructive",
      })
    }
  }

  const initializeTossPayments = async () => {
    try {
      if (typeof window.TossPayments !== "function") {
        throw new Error("Toss Payments SDK를 불러올 수 없습니다.")
      }

      const token = localStorage.getItem("accessToken")
      if (!token) {
        toast({
          title: "로그인 필요",
          description: "로그인 후 이용해주세요.",
          variant: "destructive",
        })
        return
      }

      // Get Toss config from backend
      const config = await accountAPI.getDepositConfig()
      const tossPaymentsInstance = window.TossPayments(config.clientKey)
      setTossPayments(tossPaymentsInstance)
    } catch (error: any) {
      console.error("[v0] Toss Payments initialization failed:", error)
      toast({
        title: "결제 모듈 초기화 실패",
        description: error.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  const handleCharge = async () => {
    if (!amount || Number.parseInt(amount) <= 0) {
      toast({
        title: "충전 금액 오류",
        description: "충전할 금액을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!tossPayments) {
      toast({
        title: "결제 모듈 오류",
        description: "결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Request payment to backend
      const order = await accountAPI.requestDeposit(Number.parseInt(amount))

      const config = await accountAPI.getDepositConfig()

      // Request Toss payment
      await tossPayments.requestPayment("간편결제", {
        amount: order.amount,
        orderId: order.orderId,
        orderName: "예치금 충전",
        successUrl: config.successUrl,
        failUrl: config.failUrl,
      })
    } catch (error: any) {
      console.error("[v0] Payment request failed:", error)
      toast({
        title: "결제 요청 실패",
        description: error.message || "결제 요청 중 오류가 발생했습니다.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <Link
          href="/mypage"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          마이페이지로 돌아가기
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">예치금 충전</h1>
            <p className="text-muted-foreground text-lg">렌탈 서비스 이용을 위한 예치금을 충전하세요</p>
          </div>

          <div className="grid gap-6">
            <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-primary/10 to-accent/10 border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">현재 예치금</p>
                    <p className="text-3xl font-bold">₩{currentBalance.toLocaleString()}</p>
                  </div>
                  <Wallet className="h-12 w-12 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">충전 금액</CardTitle>
                <CardDescription>충전할 금액을 선택하거나 직접 입력하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset.toString() ? "default" : "outline"}
                      onClick={() => setAmount(preset.toString())}
                      className="h-16 text-lg rounded-xl"
                      disabled={loading}
                    >
                      ₩{(preset / 10000).toFixed(0)}만
                    </Button>
                  ))}
                </div>

                <div>
                  <Label htmlFor="customAmount" className="text-sm font-medium mb-2">
                    직접 입력
                  </Label>
                  <Input
                    id="customAmount"
                    type="number"
                    placeholder="충전할 금액을 입력하세요"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-14 text-lg rounded-xl"
                    disabled={loading}
                  />
                </div>

                {amount && (
                  <div className="bg-muted p-4 rounded-xl">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">충전 금액</span>
                      <span className="font-medium">₩{Number.parseInt(amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>충전 후 잔액</span>
                      <span className="text-primary">
                        ₩{(currentBalance + Number.parseInt(amount)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Link href="/mypage" className="flex-1">
                <Button variant="outline" className="w-full h-14 rounded-xl text-lg bg-transparent" disabled={loading}>
                  취소
                </Button>
              </Link>
              <Button
                className="flex-1 h-14 rounded-xl text-lg"
                disabled={!amount || Number.parseInt(amount) <= 0 || loading}
                onClick={handleCharge}
              >
                {loading ? "결제 진행 중..." : `₩${amount ? Number.parseInt(amount).toLocaleString() : "0"} 충전하기`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
