import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Package, Shield, Zap, Users } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* 회사 소개 */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Modi 소개
            </h1>
            <p className="text-lg text-muted-foreground">전자기기 렌탈의 새로운 기준을 만들어갑니다</p>
          </div>

          {/* 회사 비전 */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">우리의 비전</h2>
              <p className="text-muted-foreground leading-relaxed">
                Modi는 누구나 필요한 전자기기를 합리적인 가격으로 이용할 수 있도록 돕는 렌탈 플랫폼입니다. 최신 노트북,
                카메라, 태블릿 등 다양한 전자기기를 단기 또는 장기로 대여하여, 불필요한 구매 부담 없이 필요한 시점에
                필요한 제품을 사용할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          {/* 핵심 가치 */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">핵심 가치</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">다양한 상품</h3>
                  <p className="text-sm text-muted-foreground">
                    최신 전자기기부터 전문 장비까지 다양한 제품을 제공합니다
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">안전한 거래</h3>
                  <p className="text-sm text-muted-foreground">예치금 시스템으로 판매자와 구매자 모두를 보호합니다</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">간편한 이용</h3>
                  <p className="text-sm text-muted-foreground">원하는 제품을 쉽고 빠르게 대여하고 반납할 수 있습니다</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">상생의 플랫폼</h3>
                  <p className="text-sm text-muted-foreground">
                    개인과 기업 모두가 판매자로 참여하여 수익을 창출할 수 있습니다
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 회사 정보 */}
          <Card>
            <CardContent className="p-8 space-y-4">
              <h2 className="text-2xl font-bold mb-4">회사 정보</h2>
              <div className="grid gap-3 text-sm">
                <div className="flex">
                  <span className="w-32 text-muted-foreground">회사명</span>
                  <span className="font-medium">주식회사 Modi</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-muted-foreground">대표이사</span>
                  <span className="font-medium">홍길동</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-muted-foreground">사업자등록번호</span>
                  <span className="font-medium">123-45-67890</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-muted-foreground">주소</span>
                  <span className="font-medium">서울특별시 강남구 테헤란로 123</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-muted-foreground">이메일</span>
                  <span className="font-medium">contact@modi.com</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
