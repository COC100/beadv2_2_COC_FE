"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Wallet, Package, Settings, LogOut, MapPin } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { memberAPI, accountAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function MyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [member, setMember] = useState<any>(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken")

      if (!token) {
        toast({
          variant: "destructive",
          title: "로그인 필요",
          description: "로그인이 필요합니다.",
        })
        router.push("/login")
        return
      }

      try {
        const [memberResponse, accountResponse] = await Promise.all([memberAPI.getProfile(), accountAPI.getBalance()])

        if (memberResponse.success && memberResponse.data) {
          setMember(memberResponse.data)
        } else {
          throw new Error("Failed to fetch member data")
        }

        if (accountResponse.success && accountResponse.data) {
          setBalance(accountResponse.data.balance)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch user data:", error)
        toast({
          variant: "destructive",
          title: "오류 발생",
          description: "사용자 정보를 불러오는데 실패했습니다.",
        })
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("memberId")
    toast({
      title: "로그아웃 완료",
      description: "로그아웃되었습니다.",
    })
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">정보를 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!member) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">마이페이지</h1>
          <p className="text-muted-foreground text-lg">렌탈 내역과 예치금을 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="font-semibold text-xl">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{member.email}</p>
                </div>

                <div className="space-y-2">
                  <Link href="/mypage/rentals">
                    <Button variant="ghost" className="w-full justify-start rounded-xl">
                      <Package className="h-4 w-4 mr-2" />
                      렌탈 내역
                    </Button>
                  </Link>
                  <Link href="/mypage/addresses">
                    <Button variant="ghost" className="w-full justify-start rounded-xl">
                      <MapPin className="h-4 w-4 mr-2" />
                      주소지 관리
                    </Button>
                  </Link>
                  <Link href="/mypage/settings">
                    <Button variant="ghost" className="w-full justify-start rounded-xl">
                      <Settings className="h-4 w-4 mr-2" />
                      설정
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-destructive hover:text-destructive rounded-xl"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="mb-6 bg-gradient-to-br from-primary to-accent text-white rounded-2xl shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-2">예치금 잔액</p>
                    <p className="text-5xl font-bold">₩{balance.toLocaleString()}</p>
                  </div>
                  <Wallet className="h-16 w-16 opacity-30" />
                </div>
                <div className="mt-8">
                  <Link href="/deposit" className="block">
                    <Button variant="secondary" className="w-full h-12 rounded-xl">
                      충전하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
