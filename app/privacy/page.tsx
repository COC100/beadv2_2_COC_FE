import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">개인정보처리방침</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Modi는 회원님의 개인정보를 소중히 다룹니다
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>제1조 (개인정보의 수집 및 이용목적)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                회사는 다음과 같은 목적을 위해 개인정보를 수집 및 이용합니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>회원 가입 및 관리</li>
                <li>렌탈 서비스 제공 및 계약 이행</li>
                <li>예치금 충전 및 결제 처리</li>
                <li>고객 문의 및 불만 처리</li>
                <li>서비스 개선 및 신규 서비스 개발</li>
                <li>마케팅 및 광고 활용</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>제2조 (수집하는 개인정보 항목)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. 필수 수집 항목</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>이메일 주소</li>
                  <li>비밀번호 (암호화 저장)</li>
                  <li>이름</li>
                  <li>전화번호</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. 선택 수집 항목</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>주소 (배송 정보)</li>
                  <li>프로필 사진</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. 자동 수집 항목</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>IP 주소</li>
                  <li>쿠키</li>
                  <li>서비스 이용 기록</li>
                  <li>기기 정보</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>제3조 (개인정보의 보유 및 이용기간)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                회사는 회원 탈퇴 시까지 개인정보를 보유하며, 탈퇴 후 즉시 파기합니다. 단, 다음의 경우는 예외로 합니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>전자상거래법: 계약 또는 청약철회 등에 관한 기록 (5년)</li>
                <li>전자상거래법: 대금결제 및 재화 등의 공급에 관한 기록 (5년)</li>
                <li>전자상거래법: 소비자의 불만 또는 분쟁처리에 관한 기록 (3년)</li>
                <li>통신비밀보호법: 로그인 기록 (3개월)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>제4조 (개인정보의 제3자 제공)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                회사는 원칙적으로 회원의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우는 예외로 합니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>회원이 사전에 동의한 경우</li>
                <li>
                  법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>제5조 (개인정보의 파기절차 및 방법)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. 파기절차</h4>
                <p className="text-muted-foreground leading-relaxed">
                  회원이 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져 내부 방침 및 기타 관련
                  법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. 파기방법</h4>
                <p className="text-muted-foreground leading-relaxed">
                  전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>제6조 (회원의 권리와 의무)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">회원은 다음과 같은 권리를 행사할 수 있습니다:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>개인정보 열람 요구</li>
                <li>개인정보 정정 요구</li>
                <li>개인정보 삭제 요구</li>
                <li>개인정보 처리정지 요구</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>제7조 (개인정보 보호책임자)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">개인정보 보호책임자</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>이름: 홍길동</li>
                  <li>직책: 개인정보보호팀장</li>
                  <li>이메일: privacy@modi.com</li>
                  <li>전화: 1588-0000</li>
                </ul>
              </div>
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
