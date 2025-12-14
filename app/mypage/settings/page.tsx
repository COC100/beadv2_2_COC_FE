"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Lock } from "lucide-react"
import Link from "next/link"
import { memberAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(true)

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
  })

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      toast({
        title: "로그인이 필요합니다",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setFetchingProfile(true)
      const response = await memberAPI.getProfile()
      setProfile({
        name: response.data.name,
        phone: response.data.phone,
      })
    } catch (error: any) {
      console.error("[v0] Failed to fetch profile:", error)
      toast({
        variant: "destructive",
        title: "프로필 조회 실패",
        description: error.message,
      })
      router.push("/login")
    } finally {
      setFetchingProfile(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await memberAPI.updateProfile({
        name: profile.name,
        phone: profile.phone,
      })
      toast({
        title: "개인정보가 성공적으로 수정되었습니다",
      })
    } catch (error: any) {
      console.error("[v0] Failed to update profile:", error)
      toast({
        variant: "destructive",
        title: "개인정보 수정 실패",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        variant: "destructive",
        title: "새 비밀번호가 일치하지 않습니다",
      })
      setLoading(false)
      return
    }

    if (passwords.newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "비밀번호는 8자 이상이어야 합니다",
      })
      setLoading(false)
      return
    }

    try {
      // Note: API 명세에는 비밀번호 변경이 memberId와 name, email, verificationCode가 필요
      // 실제 구현 시 이메일 인증 플로우 추가 필요
      toast({
        title: "비밀번호 변경 기능은 준비 중입니다",
        description: "비밀번호 찾기를 이용해주세요",
      })
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      console.error("[v0] Failed to change password:", error)
      toast({
        variant: "destructive",
        title: "비밀번호 변경 실패",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("정말로 회원 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.")) {
      return
    }

    try {
      await memberAPI.deleteAccount()
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userInfo")
      toast({
        title: "회원 탈퇴가 완료되었습니다",
      })
      router.push("/")
    } catch (error: any) {
      console.error("[v0] Failed to delete account:", error)
      toast({
        variant: "destructive",
        title: "회원 탈퇴 실패",
        description: error.message,
      })
    }
  }

  if (fetchingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <p className="text-center">로딩 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8 text-center">
          <Link
            href="/mypage"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            마이페이지로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold mb-2">개인정보 수정</h1>
          <p className="text-muted-foreground text-lg">개인정보 및 비밀번호를 관리하세요</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 rounded-xl mx-auto">
            <TabsTrigger value="profile" className="rounded-xl">
              <User className="h-4 w-4 mr-2" />
              개인정보
            </TabsTrigger>
            <TabsTrigger value="password" className="rounded-xl">
              <Lock className="h-4 w-4 mr-2" />
              비밀번호
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>개인정보 수정</CardTitle>
                <CardDescription>회원님의 개인정보를 수정할 수 있습니다</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">전화번호</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={loading} className="flex-1 rounded-xl h-12">
                      {loading ? "저장 중..." : "변경사항 저장"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/mypage")}
                      className="flex-1 rounded-xl h-12 bg-transparent"
                    >
                      취소
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>비밀번호 변경</CardTitle>
                <CardDescription>안전한 비밀번호로 변경하세요 (8자 이상 권장)</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">현재 비밀번호</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">새 비밀번호</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={loading} className="flex-1 rounded-xl h-12">
                      {loading ? "변경 중..." : "비밀번호 변경"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
                      }}
                      className="flex-1 rounded-xl h-12 bg-transparent"
                    >
                      초기화
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 pt-8 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              서비스 이용이 불편하신가요? 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteAccount}
              className="text-muted-foreground hover:text-destructive text-xs"
            >
              회원 탈퇴
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
