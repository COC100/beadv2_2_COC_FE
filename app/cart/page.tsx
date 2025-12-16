"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trash2, ShoppingBag, Settings, AlertCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { cartAPI } from "@/lib/api"

interface CartItem {
  id: number
  cartItemId: number
  productId: number
  productName: string
  productImage: string
  pricePerDay: number
  startDate: string
  endDate: string
  quantity: number
}

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<{ startDate: string; endDate: string }>({
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    const loadCart = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push("/intro")
        return
      }

      try {
        console.log("[v0] Loading cart...")
        const response = await cartAPI.list()
        console.log("[v0] Cart API raw response:", JSON.stringify(response, null, 2))

        const cartData = response.data
        console.log("[v0] Cart data extracted:", JSON.stringify(cartData, null, 2))

        if (!cartData) {
          console.log("[v0] No cart data received")
          setCartItems([])
          setError(null)
          return
        }

        const items = cartData.items || []
        console.log("[v0] Cart items array:", JSON.stringify(items, null, 2))

        setCartItems(
          items.map((item: any) => ({
            id: item.cartItemId,
            cartItemId: item.cartItemId,
            productId: item.productId,
            productName: item.productName || `상품 #${item.productId}`,
            productImage: item.productImage || "/placeholder.svg?height=200&width=200",
            pricePerDay: item.price || 0,
            startDate: item.startDate,
            endDate: item.endDate,
            quantity: 1,
          })),
        )

        setError(null)
      } catch (error: any) {
        console.error("[v0] Failed to load cart:", error)

        if (error.message.includes("500")) {
          setError("장바구니를 불러오는 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
        } else if (error.message.includes("401") || error.message.includes("인증")) {
          router.push("/intro")
          return
        } else {
          setError(error.message || "장바구니를 불러올 수 없습니다.")
        }

        toast({
          title: "장바구니 조회 실패",
          description: error.message || "장바구니를 불러올 수 없습니다",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [router, toast])

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  const calculateItemTotal = (item: CartItem) => {
    const days = calculateDays(item.startDate, item.endDate)
    return days * item.pricePerDay * item.quantity
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0)
  }

  const removeItem = async (cartItemId: number) => {
    try {
      await cartAPI.deleteItem(cartItemId)
      setCartItems(cartItems.filter((item) => item.cartItemId !== cartItemId))
      toast({
        title: "상품 삭제 완료",
        description: "장바구니에서 상품이 삭제되었습니다",
      })
    } catch (error: any) {
      console.error("[v0] Failed to remove item:", error)
      toast({
        title: "삭제 실패",
        description: error.message || "상품 삭제에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const updateRentalPeriod = async (cartItemId: number, startDate: string, endDate: string) => {
    try {
      await cartAPI.updateItem(cartItemId, { startDate, endDate })
      setCartItems(cartItems.map((item) => (item.cartItemId === cartItemId ? { ...item, startDate, endDate } : item)))
      setEditingItemId(null)
      toast({
        title: "옵션 변경 완료",
        description: "렌탈 기간이 변경되었습니다",
      })
    } catch (error: any) {
      console.error("[v0] Failed to update item:", error)
      toast({
        title: "변경 실패",
        description: error.message || "옵션 변경에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">로딩 중...</p>
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
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>오류 발생</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                <Card key={item.cartItemId} className="overflow-hidden border-gray-200">
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
                          <div className="flex-1">
                            <Link
                              href={`/products/${item.productId}`}
                              className="font-semibold hover:text-primary transition-colors"
                            >
                              {item.productName}
                            </Link>

                            {editingItemId === item.cartItemId ? (
                              <div className="mt-3 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs">시작일</Label>
                                    <Input
                                      type="date"
                                      defaultValue={item.startDate}
                                      onChange={(e) => setEditingData({ ...editingData, startDate: e.target.value })}
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">종료일</Label>
                                    <Input
                                      type="date"
                                      defaultValue={item.endDate}
                                      onChange={(e) => setEditingData({ ...editingData, endDate: e.target.value })}
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs bg-transparent"
                                    onClick={() => setEditingItemId(null)}
                                  >
                                    취소
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() =>
                                      updateRentalPeriod(
                                        item.cartItemId,
                                        editingData.startDate || item.startDate,
                                        editingData.endDate || item.endDate,
                                      )
                                    }
                                  >
                                    저장
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {item.startDate} ~ {item.endDate} ({calculateDays(item.startDate, item.endDate)}일)
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs hover:text-primary"
                                  onClick={() => {
                                    setEditingItemId(item.cartItemId)
                                    setEditingData({ startDate: item.startDate, endDate: item.endDate })
                                  }}
                                >
                                  <Settings className="h-3 w-3 mr-1" />
                                  옵션 변경
                                </Button>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.cartItemId)}
                            className="h-8 w-8"
                          >
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
                      <div key={item.cartItemId} className="flex justify-between text-sm">
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
