"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { XCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DepositFailPage() {
  const searchParams = useSearchParams()
  const [failureInfo, setFailureInfo] = useState<any>({})

  useEffect(() => {
    const code = searchParams.get("code")
    const message = searchParams.get("message")
    const orderId = searchParams.get("orderId")

    console.log("[v0] Fail page - URL params:", {
      code,
      message,
      orderId,
      fullURL: typeof window !== "undefined" ? window.location.href : "N/A",
      allParams: Object.fromEntries(searchParams.entries()),
    })

    const info = {
      code: code || "UNKNOWN_ERROR",
      message: message || "결제 중 오류가 발생했습니다.",
      orderId: orderId || null,
    }

    setFailureInfo(info)

    console.log("[v0] Payment failed with info:", info)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-2xl shadow-lg border-destructive">
            <CardHeader className="text-center">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <CardTitle className="text-3xl">결제가 실패했습니다</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-6 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">오류 코드</span>
                  <span className="font-medium">
                    {(() => {
                      const code = failureInfo.code || "알 수 없음"
                      console.log("[v0] Displaying error code:", code)
                      return code
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">오류 메시지</span>
                  <span className="text-sm text-right max-w-[60%]">
                    {(() => {
                      const message = failureInfo.message || "결제 중 오류가 발생했습니다."
                      console.log("[v0] Displaying error message:", message)
                      return message
                    })()}
                  </span>
                </div>
                {failureInfo.orderId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">주문번호</span>
                    <span className="text-sm font-mono">
                      {(() => {
                        console.log("[v0] Displaying order ID:", failureInfo.orderId)
                        return failureInfo.orderId
                      })()}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground text-center">문제가 지속되면 고객센터로 문의해주세요.</p>

              <div className="flex gap-3">
                <Link href="/deposit" className="flex-1">
                  <Button className="w-full h-12">다시 시도</Button>
                </Link>
                <Link href="/mypage" className="flex-1">
                  <Button variant="outline" className="w-full h-12 bg-transparent">
                    마이페이지로
                  </Button>
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
