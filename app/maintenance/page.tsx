"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MaintenancePage() {
  const router = useRouter()

  const handleRetry = () => {
    router.push("/")
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">서버 점검 중입니다</h1>
            <p className="text-muted-foreground">
              현재 서비스 점검 또는 일시적인 오류로
              <br />
              서비스 이용이 불가능합니다.
            </p>
            <p className="text-sm text-muted-foreground">잠시 후 다시 시도해 주세요.</p>
          </div>

          <div className="flex flex-col gap-2 w-full pt-4">
            <Button onClick={handleRetry} className="w-full">
              다시 시도
            </Button>
            <Button variant="outline" onClick={() => router.push("/intro")} className="w-full">
              홈으로 이동
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
