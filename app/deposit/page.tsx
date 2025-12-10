"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Wallet } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DepositPage() {
  const [amount, setAmount] = useState("")
  const [currentBalance] = useState(150000)

  const presetAmounts = [50000, 100000, 200000, 500000]

  const handleCharge = () => {
    // TODO: Toss 간편결제 위젯 연동
    console.log("Charging:", amount)
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
                <Button variant="outline" className="w-full h-14 rounded-xl text-lg bg-transparent">
                  취소
                </Button>
              </Link>
              <Button
                className="flex-1 h-14 rounded-xl text-lg"
                disabled={!amount || Number.parseInt(amount) <= 0}
                onClick={handleCharge}
              >
                ₩{amount ? Number.parseInt(amount).toLocaleString() : "0"} 충전하기
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
