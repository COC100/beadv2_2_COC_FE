"use client"

import Link from "next/link"
import { Sparkles, Shield, Clock, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function IntroPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl animate-float-slow"
          style={{
            top: "10%",
            left: "20%",
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: "transform 0.5s ease-out",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] bg-cyan-300/20 rounded-full blur-3xl animate-float-medium"
          style={{
            top: "50%",
            right: "10%",
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
            transition: "transform 0.5s ease-out",
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] bg-blue-500/15 rounded-full blur-3xl animate-float-fast"
          style={{
            bottom: "20%",
            left: "50%",
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            transition: "transform 0.5s ease-out",
          }}
        />

        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 border-2 border-blue-300/30 rounded-lg rotate-45 animate-spin-slow" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-cyan-400/10 rounded-full animate-bounce-slow" />
        <div className="absolute bottom-32 right-40 w-24 h-24 border-2 border-blue-400/30 rounded-full animate-pulse-slow" />
        <div className="absolute bottom-20 left-32 w-12 h-12 bg-blue-300/20 rotate-12 animate-float-medium" />
      </div>

      <header className="container mx-auto px-4 py-6 relative z-10">
        <div className="text-3xl font-bold text-primary animate-fade-in">Modi</div>
      </header>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-primary/20 hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4 animate-pulse" />
              스마트한 전자기기 렌탈 플랫폼
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              필요한 순간만
              <br />
              <span className="text-primary bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                스마트하게 렌탈
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              최신 전자기기를 합리적인 가격에
              <br />
              원하는 기간만큼 이용하세요
            </p>
          </div>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Link href="/login">
              <Button
                size="lg"
                className="rounded-lg w-full sm:w-auto px-8 hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
              >
                로그인하기
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg w-full sm:w-auto px-8 bg-white/50 backdrop-blur-sm hover:scale-105 transition-transform border-2 hover:border-primary/50"
              >
                회원가입
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card
              className="border-none shadow-lg hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-2 bg-white/70 backdrop-blur-sm animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Package className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold mb-2">다양한 제품</h3>
                <p className="text-sm text-muted-foreground">최신 전자기기부터 전문 장비까지</p>
              </CardContent>
            </Card>

            <Card
              className="border-none shadow-lg hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-2 bg-white/70 backdrop-blur-sm animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold mb-2">안전한 거래</h3>
                <p className="text-sm text-muted-foreground">예치금 시스템으로 안전하게</p>
              </CardContent>
            </Card>

            <Card
              className="border-none shadow-lg hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-2 bg-white/70 backdrop-blur-sm animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold mb-2">간편한 이용</h3>
                <p className="text-sm text-muted-foreground">원하는 기간만큼 빌려서 사용</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground relative z-10">
        © 2025 Modi. All rights reserved.
      </footer>
    </div>
  )
}
