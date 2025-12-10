import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, Phone, FileQuestion } from "lucide-react"

export default function HelpPage() {
  const contactMethods = [
    {
      icon: MessageCircle,
      title: "실시간 채팅",
      description: "평일 09:00 - 18:00",
      action: "채팅 시작하기",
      color: "bg-blue-500",
    },
    {
      icon: Mail,
      title: "이메일 문의",
      description: "support@modi.com",
      action: "이메일 보내기",
      color: "bg-emerald-500",
    },
    {
      icon: Phone,
      title: "전화 상담",
      description: "1588-0000",
      action: "전화하기",
      color: "bg-purple-500",
    },
    {
      icon: FileQuestion,
      title: "자주 묻는 질문",
      description: "빠른 답변을 확인하세요",
      action: "FAQ 보기",
      color: "bg-orange-500",
      link: "/faq",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">고객센터</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            무엇을 도와드릴까요? 다양한 방법으로 문의하실 수 있습니다
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {contactMethods.map((method, index) => (
            <Card key={index} className="rounded-2xl border-2 hover:border-primary/30 transition-all hover:shadow-xl">
              <CardHeader>
                <div className={`w-16 h-16 rounded-2xl ${method.color} flex items-center justify-center mb-4`}>
                  <method.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">{method.title}</CardTitle>
                <CardDescription className="text-base">{method.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {method.link ? (
                  <Link href={method.link}>
                    <Button variant="outline" className="w-full rounded-xl bg-transparent">
                      {method.action}
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full rounded-xl bg-transparent">
                    {method.action}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">자주 묻는 질문</h2>
          <div className="space-y-4">
            {[
              {
                question: "렌탈 예치금은 어떻게 충전하나요?",
                answer: "마이페이지에서 카드 결제, 계좌이체로 예치금을 충전할 수 있습니다.",
              },
              {
                question: "렌탈 기간을 연장할 수 있나요?",
                answer: "렌탈 중인 상품 페이지에서 연장 신청이 가능합니다. 판매자 승인 후 자동으로 기간이 연장됩니다.",
              },
              {
                question: "상품이 파손된 경우 어떻게 하나요?",
                answer: "즉시 고객센터에 연락주시고, 파손 정도에 따라 보상금이 예치금에서 차감될 수 있습니다.",
              },
              {
                question: "반납은 어떻게 하나요?",
                answer: "렌탈 종료일 전에 판매자가 지정한 장소로 반납하시면 됩니다. 택배 반납도 가능합니다.",
              },
            ].map((faq, index) => (
              <Card key={index} className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/faq">
              <Button size="lg" variant="outline" className="rounded-full bg-transparent">
                더 많은 FAQ 보기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
