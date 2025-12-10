"use client"

import { useState } from "react"
import Link from "next/link"
import { Trash2, ShoppingBag } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface CartItem {
  id: number
  productId: number
  productName: string
  productImage: string
  pricePerDay: number
  startDate: string
  endDate: string
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      productId: 1,
      productName: 'MacBook Pro 16" M3',
      productImage: "/macbook-pro-laptop.png",
      pricePerDay: 25000,
      startDate: "2025-01-15",
      endDate: "2025-01-20",
      quantity: 1,
    },
    {
      id: 2,
      productId: 2,
      productName: "Sony A7 IV 미러리스",
      productImage: "/sony-mirrorless-camera.png",
      pricePerDay: 35000,
      startDate: "2025-01-18",
      endDate: "2025-01-22",
      quantity: 1,
    },
  ])

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const calculateItemTotal = (item: CartItem) => {
    const days = calculateDays(item.startDate, item.endDate)
    return days * item.pricePerDay * item.quantity
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0)
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-purple-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">장바구니</h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {cartItems.length === 0 ? (
          <Card className="p-12 text-center border-gray-200">
            <ShoppingBag className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">장바구니가 비어있습니다</h2>
            <p className="text-muted-foreground mb-6">렌탈하고 싶은 상품을 추가해보세요</p>
            <Link href="/products">
              <Button size="lg" className="rounded-lg">
                상품 둘러보기
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden border-gray-200">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.productImage || "/placeholder.svg"}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Link
                              href={`/products/${item.productId}`}
                              className="font-semibold hover:text-primary transition-colors"
                            >
                              {item.productName}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.startDate} ~ {item.endDate} ({calculateDays(item.startDate, item.endDate)}일)
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-sm text-muted-foreground">
                            {item.pricePerDay.toLocaleString()}원 x {calculateDays(item.startDate, item.endDate)}일
                          </p>
                          <p className="text-lg font-bold text-primary">₩{calculateItemTotal(item).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="sticky top-24 border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4">주문 요약</h2>
                  <div className="space-y-2 mb-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate mr-2">{item.productName}</span>
                        <span className="font-medium">₩{calculateItemTotal(item).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-bold text-lg mb-6">
                    <span>총 금액</span>
                    <span className="text-primary text-xl">₩{calculateTotal().toLocaleString()}</span>
                  </div>
                  <Button className="w-full h-11 rounded-lg" size="lg">
                    렌탈 신청하기
                  </Button>
                  <Link href="/products">
                    <Button variant="outline" className="w-full mt-2 rounded-lg bg-transparent">
                      쇼핑 계속하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
