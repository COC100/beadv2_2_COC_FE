import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">이용약관</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">Modi 서비스 이용약관입니다</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>제1조 (목적)</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                본 약관은 Modi(이하 "회사")가 제공하는 전자기기 렌탈 플랫폼 서비스(이하 "서비스")의 이용과 관련하여
                회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>제2조 (정의)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. "서비스"</h4>
                <p className="text-muted-foreground leading-relaxed">
                  회사가 제공하는 전자기기 렌탈 중개 플랫폼 및 관련 부가 서비스를 의미합니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. "이용자"</h4>
                <p className="text-muted-foreground leading-relaxed">
                  본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. "회원"</h4>
                <p className="text-muted-foreground leading-relaxed">
                  회사와 서비스 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 자를 말합니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4. "판매자"</h4>
                <p className="text-muted-foreground leading-relaxed">
                  서비스를 통해 전자기기를 대여하는 회원을 말합니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">5. "렌탈자"</h4>
                <p className="text-muted-foreground leading-relaxed">
                  서비스를 통해 전자기기를 대여받는 회원을 말합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>제3조 (약관의 명시, 효력 및 개정)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                1. 회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                3. 회사가 약관을 개정할 경우 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기화면에 그
                적용일자 7일 전부터 적용일자 전일까지 공지합니다.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>제4조 (예치금)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                1. 회원은 서비스 이용을 위해 예치금을 충전할 수 있습니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                2. 예치금은 카드 결제, 계좌이체 등의 방법으로 충전할 수 있습니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                3. 렌탈 금액은 예치금에서 자동으로 차감되며, 렌탈 종료 후 잔액은 회원이 언제든지 출금할 수 있습니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">4. 회사는 예치금에 대한 이자를 지급하지 않습니다.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>제5조 (손해배상)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                1. 렌탈자는 렌탈 기간 중 상품의 파손, 분실에 대한 책임을 집니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                2. 파손 또는 분실 시 판매자와 협의하여 보상금을 결정하며, 합의가 이루어지지 않을 경우 회사의 중재를
                따릅니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">3. 보상금은 렌탈자의 예치금에서 차감됩니다.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>제6조 (면책조항)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                1. 회사는 천재지변, 전쟁, 기타 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스
                제공에 대한 책임이 면제됩니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                2. 회사는 판매자와 렌탈자 간의 거래에서 발생한 분쟁에 대해 책임을 지지 않습니다.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                3. 회사는 회원이 서비스를 이용하여 기대하는 수익을 얻지 못하거나 상실한 것에 대하여 책임을 지지
                않습니다.
              </p>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground pt-8">
            <p>최종 수정일: 2025년 1월 1일</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
