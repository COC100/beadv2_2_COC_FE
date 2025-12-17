import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"

export default function FaqPage() {
  const faqs = [
    {
      category: "렌탈 이용",
      items: [
        {
          question: "렌탈 예치금은 어떻게 충전하나요?",
          answer:
            "마이페이지에서 카드 결제, 계좌이체로 예치금을 충전할 수 있습니다. 충전된 예치금은 렌탈 결제 시 자동으로 사용됩니다.",
        },
        {
          question: "렌탈 기간을 연장할 수 있나요?",
          answer:
            "렌탈 중인 상품 페이지에서 연장 신청이 가능합니다. 판매자 승인 후 자동으로 기간이 연장되며, 추가 금액이 예치금에서 차감됩니다.",
        },
        {
          question: "렌탈 취소는 어떻게 하나요?",
          answer:
            "렌탈 시작 24시간 전까지 무료로 취소 가능합니다. 24시간 이내 취소 시에는 취소 수수료가 발생할 수 있습니다.",
        },
        {
          question: "여러 상품을 동시에 렌탈할 수 있나요?",
          answer: "네, 예치금 잔액이 충분하다면 여러 상품을 동시에 렌탈할 수 있습니다.",
        },
      ],
    },
    {
      category: "반납 및 배송",
      items: [
        {
          question: "반납은 어떻게 하나요?",
          answer:
            "렌탈 종료일 전에 판매자가 지정한 장소로 반납하시면 됩니다. 택배 반납도 가능하며, 택배비는 렌탈 계약에 따라 다릅니다.",
        },
        {
          question: "배송은 얼마나 걸리나요?",
          answer: "대부분의 상품은 결제 후 1-2일 내에 배송됩니다. 판매자와 거리에 따라 배송 기간이 달라질 수 있습니다.",
        },
      ],
    },
    {
      category: "결제 및 환불",
      items: [
        {
          question: "예치금 환불은 어떻게 받나요?",
          answer:
            "마이페이지의 예치금 관리에서 출금 신청을 하시면 됩니다. 영업일 기준 3-5일 내에 등록하신 계좌로 입금됩니다.",
        },
        {
          question: "렌탈 요금은 어떻게 계산되나요?",
          answer: "일일 렌탈 요금 × 렌탈 일수로 계산됩니다. 장기 렌탈 시 할인이 적용될 수 있습니다.",
        },
        {
          question: "결제 수단은 무엇이 있나요?",
          answer: "신용카드, 체크카드, 계좌이체로 예치금을 충전하실 수 있습니다.",
        },
      ],
    },
    {
      category: "상품 관리",
      items: [
        {
          question: "상품이 파손된 경우 어떻게 하나요?",
          answer:
            "즉시 고객센터에 연락주시고, 파손 정도에 따라 보상금이 예치금에서 차감될 수 있습니다. 고의적 파손이 아닌 경우 일부 보험 처리가 가능합니다.",
        },
        {
          question: "상품 상태가 설명과 다른 경우?",
          answer: "상품 수령 후 24시간 이내에 사진과 함께 고객센터로 문의주시면 교환 또는 환불 처리해드립니다.",
        },
        {
          question: "상품 사용 중 고장이 난 경우?",
          answer:
            "정상적인 사용 중 발생한 고장은 판매자가 책임집니다. 즉시 고객센터에 연락주시면 수리 또는 교환을 도와드립니다.",
        },
      ],
    },
    {
      category: "판매자 관련",
      items: [
        {
          question: "판매자로 등록하려면 어떻게 하나요?",
          answer:
            "'판매자 되기' 페이지에서 사업자 정보를 입력하고 신청하시면 됩니다. 심사 후 승인되면 상품을 등록할 수 있습니다.",
        },
        {
          question: "판매자 수수료는 얼마인가요?",
          answer: "렌탈 금액의 10%가 플랫폼 수수료로 부과됩니다. 업계 최저 수준의 수수료입니다.",
        },
        {
          question: "상품 등록은 어떻게 하나요?",
          answer: "판매자 대시보드에서 상품 사진, 설명, 가격, 대여 가능 기간 등을 입력하여 등록할 수 있습니다.",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">자주 묻는 질문</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Modi 이용 중 궁금하신 점을 빠르게 찾아보세요
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-12">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
              <Card className="rounded-2xl">
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem
                      key={itemIndex}
                      value={`item-${categoryIndex}-${itemIndex}`}
                      className="border-b last:border-0"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline text-left">
                        <span className="font-semibold">{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
