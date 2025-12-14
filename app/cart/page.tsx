"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cartAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    const token = localStorage.getItem("accessToken")

    if (!token) {
      if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        toast({
          variant: "destructive",
          title: "로그인 필요",
          description: "로그인이 필요합니다.",
        })
        router.push("/login")
      } else {
        console.log("[v0] API not configured, showing empty cart")
        setCartItems([])
        setLoading(false)
      }
      return
    }

    try {
      if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
        setCartItems([])
        setLoading(false)
        return
      }

      const response = await cartAPI.list()
      if (response.success && response.data) {
        setCartItems(response.data.items || [])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch cart:", error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const calculateItemTotal = (item: any) => {
    const days = calculateDays(item.startDate, item.endDate)
    return days * item.pricePerDay * item.quantity
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0)
  }

  const removeItem = async (itemId: number) => {
    try {
      const response = await cartAPI.deleteItem(itemId)
      if (response.success) {
        setCartItems(cartItems.filter((item) => item.id !== itemId))
        toast({
          title: "삭제 완료",
          description: "장바구니에서 삭제되었습니다.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "삭제 실패",
          description: "삭제에 실패했습니다.",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to remove item:", error)
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "삭제 중 오류가 발생했습니다.",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">장바구니를 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    )
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
            {/* ... existing cart item display code ... */}

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
                  <Link href="/reservation">
                    <Button className="w-full h-11 rounded-lg" size="lg">
                      렌탈 신청하기
                    </Button>
                  </Link>
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
