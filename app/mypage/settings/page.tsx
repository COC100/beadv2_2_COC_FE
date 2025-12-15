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
import { useToast } from "@/hooks/use-toast"
import { memberAPI } from "@/lib/api"
import { handlePhoneInput } from "@/lib/utils"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  })

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push("/intro")
        return
      }

      try {
        const profileData = await memberAPI.getProfile()
        setProfile({
          name: profileData.name || "",
          email: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).email : "",
          phone: profileData.phone || "",
        })
      } catch (error: any) {
        console.error("[v0] Failed to load profile:", error)
        if (error.message.includes("401")) {
          router.push("/intro")
        }
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await memberAPI.updateProfile({
        name: profile.name,
        phone: profile.phone,
      })
      toast({
        title: "개인정보 수정 완료",
        description: "개인정보가 성공적으로 수정되었습니다.",
      })
    } catch (error: any) {
      console.error("[v0] Failed to update profile:", error)
      toast({
        title: "개인정보 수정 실패",
        description: error.message || "개인정보 수정에 실패했습니다.",
        variant: "destructive",
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
        title: "비밀번호 불일치",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (passwords.newPassword.length < 8) {
      toast({
        title: "비밀번호 규칙 위반",
        description: "비밀번호는 8자 이상이어야 합니다.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const user = localStorage.getItem("user")
      const memberId = user ? JSON.parse(user).id : null

      if (!memberId) {
        throw new Error("회원 정보를 찾을 수 없습니다")
      }

      await memberAPI.updatePassword(memberId, {
        name: profile.name,
        password: passwords.newPassword,
        email: profile.email,
        verificationCode: "000000", // TODO: Implement verification code
      })
      toast({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      })
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      console.error("[v0] Failed to update password:", error)
      toast({
        title: "비밀번호 변경 실패",
        description: error.message || "비밀번호 변경에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await memberAPI.deleteAccount()
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      toast({
        title: "회원 탈퇴 완료",
        description: "그동안 이용해주셔서 감사합니다.",
      })
      router.push("/intro")
    } catch (error: any) {
      console.error("[v0] Failed to delete account:", error)
      toast({
        title: "회원 탈퇴 실패",
        description: error.message || "회원 탈퇴에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">로딩 중...</p>
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
                    <Label htmlFor="name">이름 *</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      className="rounded-xl bg-muted cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">전화번호 *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: handlePhoneInput(e.target.value) })}
                      className="rounded-xl"
                      required
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
                      className="flex-1 rounded-xl h-12"
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
                    <Label htmlFor="currentPassword">현재 비밀번호 *</Label>
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
                    <Label htmlFor="newPassword">새 비밀번호 *</Label>
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
                    <Label htmlFor="confirmPassword">새 비밀번호 확인 *</Label>
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
                      className="flex-1 rounded-xl h-12"
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
              className="text-muted-foreground hover:text-destructive text-xs"
              onClick={handleDeleteAccount}
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
