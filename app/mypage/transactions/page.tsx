"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Receipt, TrendingUp, TrendingDown } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { accountAPI } from "@/lib/api"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
        const data = await accountAPI.getTransactions()
        setTransactions(data || [])
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

  const getTransactionIcon = (type: string) => {
    return type === "DEPOSIT" || type === "REFUND" ? (
      <TrendingUp className="h-5 w-5 text-green-600" />
    ) : (
      <TrendingDown className="h-5 w-5 text-red-600" />
    )
  }

  const getTransactionColor = (type: string) => {
    return type === "DEPOSIT" || type === "REFUND" ? "text-green-600" : "text-red-600"
  }

  const getTransactionSign = (type: string) => {
    return type === "DEPOSIT" || type === "REFUND" ? "+" : "-"
  }

  const getTransactionLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      DEPOSIT: "충전",
      WITHDRAW: "출금",
      PAYMENT: "결제",
      REFUND: "환불",
    }
    return labels[type] || type
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
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium">{getTransactionLabel(transaction.type)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground mt-1">{transaction.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getTransactionColor(transaction.type)}`}>
                        {getTransactionSign(transaction.type)}₩{transaction.amount?.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        잔액: ₩{transaction.balanceAfter?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
