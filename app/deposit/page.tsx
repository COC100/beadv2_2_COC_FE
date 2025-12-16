"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Wallet, RefreshCw } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { accountAPI } from "@/lib/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const router = useRouter()

  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelPaymentKey, setCancelPaymentKey] = useState("")
  const [cancelOrderId, setCancelOrderId] = useState("")
  const [cancelAmount, setCancelAmount] = useState(0)

  const presetAmounts = [50000, 100000, 200000, 500000]

  useEffect(() => {
    loadBalance()
    initializeTossPayments()
  }, [])

  const loadBalance = async () => {
    try {
      const response = await accountAPI.getBalance()
      const balanceData = response.data
      console.log("[v0] Balance data:", balanceData)
      setCurrentBalance(balanceData?.balance ?? 0)
    } catch (error: any) {
      console.error("[v0] Failed to load balance:", error)
      setCurrentBalance(0)
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

      const response = await accountAPI.getDepositConfig()
      const config = response.data
      console.log("[v0] Deposit config:", config)

      if (!config || !config.clientKey) {
        throw new Error("결제 설정을 불러올 수 없습니다.")
      }

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
      const response = await accountAPI.requestDeposit(Number.parseInt(amount))
      const order = response.data
      console.log("[v0] Deposit order:", order)

      if (!order || !order.orderId || !order.amount) {
        throw new Error("결제 정보가 올바르지 않습니다")
      }

      const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
      const successUrl = `${baseUrl}/deposit/success`
      const failUrl = `${baseUrl}/deposit/fail`

      await tossPayments.requestPayment("간편결제", {
        amount: order.amount,
        orderId: order.orderId,
        orderName: "예치금 충전",
        successUrl: successUrl,
        failUrl: failUrl,
      })

      router.push(`/deposit/success?orderId=${order.orderId}&amount=${order.amount}`)
    } catch (error: any) {
      console.error("[v0] Payment request failed:", error)

      const errorMessage = error.message || "결제 요청 중 오류가 발생했습니다."
      const errorCode = error.code || "UNKNOWN_ERROR"

      router.push(`/deposit/fail?message=${encodeURIComponent(errorMessage)}&code=${errorCode}`)
      setLoading(false)
    }
  }

  const handleCancelDeposit = async () => {
    if (!cancelPaymentKey || !cancelOrderId) {
      toast({
        title: "환불 정보 오류",
        description: "환불할 결제 정보가 없습니다.",
        variant: "destructive",
      })
      return
    }

    try {
      await accountAPI.cancelDeposit({
        paymentKey: cancelPaymentKey,
        orderId: cancelOrderId,
        amount: cancelAmount,
        reason: "사용자 요청",
      })

      toast({
        title: "환불 완료",
        description: "예치금 충전이 취소되었습니다.",
      })

      setShowCancelDialog(false)
      await loadBalance()
    } catch (error: any) {
      console.error("[v0] Cancel deposit failed:", error)
      toast({
        title: "환불 실패",
        description: error.message || "환불 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
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
                variant="outline"
                className="h-14 rounded-xl text-lg bg-transparent"
                disabled={loading}
                onClick={() => setShowCancelDialog(true)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                환불
              </Button>
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

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>충전 취소(환불)</AlertDialogTitle>
            <AlertDialogDescription>
              최근 충전한 예치금을 환불하시겠습니까? 환불 처리는 즉시 진행됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>결제 키</Label>
              <Input
                placeholder="paymentKey를 입력하세요"
                value={cancelPaymentKey}
                onChange={(e) => setCancelPaymentKey(e.target.value)}
              />
            </div>
            <div>
              <Label>주문 ID</Label>
              <Input
                placeholder="orderId를 입력하세요"
                value={cancelOrderId}
                onChange={(e) => setCancelOrderId(e.target.value)}
              />
            </div>
            <div>
              <Label>환불 금액</Label>
              <Input
                type="number"
                placeholder="환불할 금액을 입력하세요"
                value={cancelAmount}
                onChange={(e) => setCancelAmount(Number.parseInt(e.target.value))}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelDeposit}>환불 진행</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  )
}
