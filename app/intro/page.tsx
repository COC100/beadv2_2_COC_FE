import Link from "next/link"
import { Sparkles, Shield, Clock, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <div className="text-3xl font-bold text-primary">Modi</div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              스마트한 전자기기 렌탈 플랫폼
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              필요한 순간만
              <br />
              <span className="text-primary">스마트하게 렌탈</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              최신 전자기기를 합리적인 가격에
              <br />
              원하는 기간만큼 이용하세요
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/login">
              <Button size="lg" className="rounded-lg w-full sm:w-auto px-8">
                로그인하기
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="rounded-lg w-full sm:w-auto px-8 bg-transparent">
                회원가입
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">다양한 제품</h3>
                <p className="text-sm text-muted-foreground">최신 전자기기부터 전문 장비까지</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">안전한 거래</h3>
                <p className="text-sm text-muted-foreground">예치금 시스템으로 안전하게</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">간편한 이용</h3>
                <p className="text-sm text-muted-foreground">원하는 기간만큼 빌려서 사용</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        © 2025 Modi. All rights reserved.
      </footer>
    </div>
  )
}
