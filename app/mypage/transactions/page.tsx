"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Receipt, TrendingUp, TrendingDown, CheckCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { accountAPI } from "@/lib/api"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [refundReason, setRefundReason] = useState("")
  const [isRefunding, setIsRefunding] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadTransactions = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push("/intro")
        return
      }

      try {
        const response = await accountAPI.getTransactions()
        const data = response.data
        console.log("[v0] Transactions data:", data)

        setTransactions(Array.isArray(data) ? data : [])
      } catch (error: any) {
        console.error("[v0] Failed to load transactions:", error)
        toast({
          title: "거래 내역 조회 실패",
          description: error.message || "거래 내역을 불러오는데 실패했습니다",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [router, toast])

  const canceledOrderIds = new Set(
    transactions
      .filter((tx) => tx.txType === "DEPOSIT_CANCEL")
      .map((tx) => tx.relatedPgDepositId || tx.orderId)
      .filter(Boolean),
  )

  const handleRefundClick = (transaction: any) => {
    setSelectedTransaction(transaction)
    setRefundReason("")
    setRefundDialogOpen(true)
  }

  const handleRefundConfirm = async () => {
    if (!selectedTransaction || !refundReason.trim()) {
      toast({
        title: "환불 사유 필수",
        description: "환불 사유를 입력해주세요",
        variant: "destructive",
      })
      return
    }

    setIsRefunding(true)
    try {
      await accountAPI.cancelDeposit({
        paymentKey: selectedTransaction.paymentKey || "",
        orderId: selectedTransaction.orderId || selectedTransaction.relatedPgDepositId?.toString() || "",
        amount: selectedTransaction.amount,
        reason: refundReason.trim(),
      })

      toast({
        title: "환불 요청 완료",
        description: "환불이 성공적으로 처리되었습니다",
      })

      // Reload transactions
      const response = await accountAPI.getTransactions()
      const data = response.data
      setTransactions(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast({
        title: "환불 요청 실패",
        description: error.message || "환불 처리에 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setIsRefunding(false)
      setRefundDialogOpen(false)
      setSelectedTransaction(null)
      setRefundReason("")
    }
  }

  const getTransactionIcon = (txType: string) => {
    return txType === "DEPOSIT_CHARGE" || txType === "RENTAL_REFUND" ? (
      <TrendingUp className="h-5 w-5 text-green-600" />
    ) : (
      <TrendingDown className="h-5 w-5 text-red-600" />
    )
  }

  const getTransactionColor = (txType: string) => {
    return txType === "DEPOSIT_CHARGE" || txType === "RENTAL_REFUND" ? "text-green-600" : "text-red-600"
  }

  const getTransactionSign = (txType: string) => {
    return txType === "DEPOSIT_CHARGE" || txType === "RENTAL_REFUND" ? "+" : "-"
  }

  const getTransactionLabel = (txType: string) => {
    const labels: { [key: string]: string } = {
      DEPOSIT_CHARGE: "충전",
      RENTAL_PAYMENT: "대여 결제",
      RENTAL_REFUND: "대여 환불",
      DEPOSIT_CANCEL: "충전 취소",
      ADJUST: "조정",
    }
    return labels[txType] || txType
  }

  const isRefundable = (transaction: any) => {
    if (transaction.txType !== "DEPOSIT_CHARGE") return false
    const orderId = transaction.relatedPgDepositId || transaction.orderId
    return !canceledOrderIds.has(orderId)
  }

  const isRefunded = (transaction: any) => {
    if (transaction.txType !== "DEPOSIT_CHARGE") return false
    const orderId = transaction.relatedPgDepositId || transaction.orderId
    return canceledOrderIds.has(orderId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
        <Footer />
      </div>
    )
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">거래 내역</h1>
          <p className="text-muted-foreground text-lg">예치금 충전, 출금, 결제 내역을 확인하세요</p>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              전체 거래 내역
            </CardTitle>
            <CardDescription>총 {transactions.length}건의 거래</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">거래 내역이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-xl border hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        {getTransactionIcon(transaction.txType)}
                      </div>
                      <div>
                        <p className="font-medium">{getTransactionLabel(transaction.txType)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Asia/Seoul",
                          })}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground mt-1">{transaction.description}</p>
                        )}
                        {transaction.relatedPgDepositId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            주문번호: {transaction.orderId || transaction.relatedPgDepositId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-xl font-bold ${getTransactionColor(transaction.txType)}`}>
                          {getTransactionSign(transaction.txType)}₩{transaction.amount?.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          잔액: ₩{transaction.balanceAfter?.toLocaleString()}
                        </p>
                      </div>
                      {isRefundable(transaction) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRefundClick(transaction)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          환불
                        </Button>
                      )}
                      {isRefunded(transaction) && (
                        <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                          <CheckCircle className="h-4 w-4" />
                          환불 완료
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>충전 환불 요청</DialogTitle>
            <DialogDescription>환불 정보를 확인하고 사유를 입력해주세요</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedTransaction && (
              <>
                <div className="space-y-2">
                  <Label>주문번호</Label>
                  <Input
                    value={selectedTransaction.orderId || selectedTransaction.relatedPgDepositId || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>환불 금액</Label>
                  <Input value={`₩${selectedTransaction.amount?.toLocaleString()}`} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refund-reason">
                    환불 사유 <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="refund-reason"
                    placeholder="환불 사유를 입력해주세요"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)} disabled={isRefunding}>
              취소
            </Button>
            <Button
              onClick={handleRefundConfirm}
              disabled={isRefunding || !refundReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRefunding ? "처리 중..." : "환불 요청"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
