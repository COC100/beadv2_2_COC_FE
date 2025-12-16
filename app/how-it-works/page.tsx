import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Search, ShoppingCart, Package, RotateCcw } from "lucide-react"

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Search,
      title: "상품 검색",
      description: "원하는 전자기기를 검색하고 다양한 옵션을 비교해보세요.",
      details: ["카테고리별 상품 검색", "가격대별 필터링", "렌탈 기간 설정"],
    },
    {
      icon: ShoppingCart,
      title: "예약 및 결제",
      description: "대여 기간을 선택하고 간편하게 결제하세요.",
      details: ["원하는 대여 기간 선택", "예치금 충전 및 결제", "판매자 승인 후 예약 확정"],
    },
    {
      icon: Package,
      title: "상품 수령",
      description: "배송으로 상품을 받으세요.",
      details: ["빠른 배송 서비스", "상품 상태 확인", "안전한 포장"],
    },
    {
      icon: RotateCcw,
      title: "반납",
      description: "사용 후 간편하게 반납하세요.",
      details: ["택배 반납 지원", "반납 장소 선택 가능", "반납 완료 확인"],
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              이용 방법
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Modi에서 전자기기를 렌탈하는 방법은 간단합니다. 아래 단계를 따라 쉽고 빠르게 이용하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {steps.map((step, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-sm font-semibold text-primary mb-2">STEP {index + 1}</div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-center">추가 안내</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">예치금이란?</h3>
                  <p className="text-sm">
                    렌탈 서비스 이용을 위해 미리 충전하는 금액입니다. 상품 대여 시 자동으로 차감되며, 남은 금액은 계속
                    사용 가능합니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">대여 기간은 어떻게 계산되나요?</h3>
                  <p className="text-sm">
                    대여 시작일부터 반납 예정일까지의 기간으로 계산됩니다. 연장이 필요한 경우 마이페이지에서 신청
                    가능합니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">배송은 얼마나 걸리나요?</h3>
                  <p className="text-sm">지역에 따라 다르지만, 일반적으로 1-2일 이내에 배송됩니다.</p>
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
