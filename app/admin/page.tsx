"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Store, DollarSign, FileText, Package } from "lucide-react"
import Link from "next/link"

export default function AdminHomePage() {
  const adminMenus = [
    {
      title: "회원 관리",
      description: "회원 조회 및 블랙리스트 관리",
      icon: Users,
      href: "/admin/members",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "판매자 관리",
      description: "판매자 신청 승인 및 거절",
      icon: Store,
      href: "/admin/sellers",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "상품 관리",
      description: "상품 검수 요청 관리",
      icon: Package,
      href: "/admin/products",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "정산 관리",
      description: "판매자 정산 처리",
      icon: DollarSign,
      href: "/admin/settlements",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "공지사항 관리",
      description: "공지사항 등록/수정/삭제",
      icon: FileText,
      href: "/admin/notices",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
            <p className="text-muted-foreground">Modi 플랫폼 관리 시스템</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminMenus.map((menu) => {
              const Icon = menu.icon
              return (
                <Link key={menu.href} href={menu.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${menu.bgColor} flex items-center justify-center mb-4`}>
                        <Icon className={`h-6 w-6 ${menu.color}`} />
                      </div>
                      <CardTitle>{menu.title}</CardTitle>
                      <CardDescription>{menu.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full bg-transparent">
                        관리하기
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
