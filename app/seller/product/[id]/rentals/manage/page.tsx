"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Check, X, Play, Package, Search } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { sellerAPI, rentalAPI } from "@/lib/api"

export default async function ManageProductRentalsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const productId = resolvedParams.id

  return <ManageProductRentalsContent productId={productId} />
}

function getDefaultDates() {
  const today = new Date()
  const oneMonthLater = new Date(today)
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1)

  return {
    startDate: today.toISOString().split("T")[0],
    endDate: oneMonthLater.toISOString().split("T")[0],
  }
}

function ManageProductRentalsContent({ productId }: { productId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [requestedRentals, setRequestedRentals] = useState<any[]>([])
  const [acceptedRentals, setAcceptedRentals] = useState<any[]>([])
  const [rentingRentals, setRentingRentals] = useState<any[]>([])
  const [selectedRental, setSelectedRental] = useState<any>(null)
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showStartRentalDialog, setShowStartRentalDialog] = useState(false)
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [returnData, setReturnData] = useState({
    damageFee: 0,
    damageReason: "",
    lateFee: 0,
    lateReason: "",
    memo: "",
  })
  const defaultDates = getDefaultDates()
  const [startDate, setStartDate] = useState(defaultDates.startDate)
  const [endDate, setEndDate] = useState(defaultDates.endDate)

  const loadRentals = async () => {
    try {
      console.log("[v0] Loading rentals for productId:", productId, "dates:", startDate, "to", endDate)

      // Load REQUESTED rentals
      const requestedResponse = await sellerAPI.getRentals({
        productId: Number(productId),
        status: "REQUESTED",
        startDate,
        endDate,
        size: 100,
      })
      console.log("[v0] Requested rentals response:", requestedResponse)
      const requestedData = requestedResponse.data || []
      setRequestedRentals(Array.isArray(requestedData) ? requestedData : [])

      // Load ACCEPTED rentals
      const acceptedResponse = await sellerAPI.getRentals({
        productId: Number(productId),
        status: "ACCEPTED",
        startDate,
        endDate,
        size: 100,
      })
      console.log("[v0] Accepted rentals response:", acceptedResponse)
      const acceptedData = acceptedResponse.data || []
      setAcceptedRentals(Array.isArray(acceptedData) ? acceptedData : [])

      // Load RENTING rentals
      const rentingResponse = await sellerAPI.getRentals({
        productId: Number(productId),
        status: "RENTING",
        startDate,
        endDate,
        size: 100,
      })
      console.log("[v0] Renting rentals response:", rentingResponse)
      const rentingData = rentingResponse.data || []
      setRentingRentals(Array.isArray(rentingData) ? rentingData : [])
    } catch (error: any) {
      console.error("[v0] Failed to load rentals:", error)
      toast({
        title: "오류",
        description: error.message || "데이터를 불러오는데 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      router.push("/intro")
      return
    }

    loadRentals()
  }, [productId, router, toast])

  const handleSearch = () => {
    setIsLoading(true)
    loadRentals()
  }

  const handleAccept = async () => {
    if (!selectedRental) return

    try {
      await rentalAPI.accept(selectedRental.rentalItemId)
      toast({
        title: "예약 수락 완료",
        description: "예약이 수락되었습니다",
      })
      setShowAcceptDialog(false)
      setSelectedRental(null)
      loadRentals()
    } catch (error: any) {
      toast({
        title: "예약 수락 실패",
        description: error.message || "예약 수락에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const handleReject = async () => {
    if (!selectedRental) return

    try {
      await rentalAPI.reject(selectedRental.rentalItemId)
      toast({
        title: "예약 거절 완료",
        description: "예약이 거절되었습니다",
      })
      setShowRejectDialog(false)
      setSelectedRental(null)
      loadRentals()
    } catch (error: any) {
      toast({
        title: "예약 거절 실패",
        description: error.message || "예약 거절에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const handleStartRental = async () => {
    if (!selectedRental) return

    try {
      await rentalAPI.startRental(selectedRental.rentalItemId)
      toast({
        title: "렌탈 시작 완료",
        description: "렌탈이 시작되었습니다",
      })
      setShowStartRentalDialog(false)
      setSelectedRental(null)
      loadRentals()
    } catch (error: any) {
      toast({
        title: "렌탈 시작 실패",
        description: error.message || "렌탈 시작에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const handleReturn = async () => {
    if (!selectedRental) return

    try {
      await rentalAPI.returnItem(selectedRental.rentalItemId, returnData)
      toast({
        title: "반납 처리 완료",
        description: "반납이 처리되었습니다",
      })
      setShowReturnDialog(false)
      setSelectedRental(null)
      setReturnData({
        damageFee: 0,
        damageReason: "",
        lateFee: 0,
        lateReason: "",
        memo: "",
      })
      loadRentals()
    } catch (error: any) {
      toast({
        title: "반납 처리 실패",
        description: error.message || "반납 처리에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const RentalCard = ({ rental, actions }: { rental: any; actions: React.ReactNode }) => (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">#{rental.rentalItemId}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {rental.startDate} ~ {rental.endDate}
                </span>
              </div>
              {rental.paidAt && (
                <div className="text-sm text-muted-foreground">
                  결제일: {new Date(rental.paidAt).toLocaleString("ko-KR")}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">₩{rental.totalAmount?.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-3 border-t">{actions}</div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
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

      <section className="bg-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/seller">
              <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-1" />
                뒤로가기
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">상품 상태 관리</h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="startDate">시작일</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="endDate">종료일</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <Button onClick={handleSearch} className="rounded-lg">
                <Search className="h-4 w-4 mr-2" />
                조회
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="requested" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="requested">
              요청됨 <Badge className="ml-2 bg-yellow-500">{requestedRentals.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="accepted">
              수락됨 <Badge className="ml-2 bg-blue-500">{acceptedRentals.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="renting">
              렌탈 중 <Badge className="ml-2 bg-purple-500">{rentingRentals.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requested" className="space-y-4">
            {requestedRentals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">요청된 예약이 없습니다</p>
                </CardContent>
              </Card>
            ) : (
              requestedRentals.map((rental) => (
                <RentalCard
                  key={rental.rentalItemId}
                  rental={rental}
                  actions={
                    <>
                      <Button
                        size="sm"
                        className="flex-1 rounded-lg"
                        onClick={() => {
                          setSelectedRental(rental)
                          setShowAcceptDialog(true)
                        }}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        수락
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-lg bg-transparent"
                        onClick={() => {
                          setSelectedRental(rental)
                          setShowRejectDialog(true)
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        거절
                      </Button>
                    </>
                  }
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {acceptedRentals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">수락된 예약이 없습니다</p>
                </CardContent>
              </Card>
            ) : (
              acceptedRentals.map((rental) => (
                <RentalCard
                  key={rental.rentalItemId}
                  rental={rental}
                  actions={
                    <Button
                      size="sm"
                      className="flex-1 rounded-lg"
                      onClick={() => {
                        setSelectedRental(rental)
                        setShowStartRentalDialog(true)
                      }}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      렌탈 시작
                    </Button>
                  }
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="renting" className="space-y-4">
            {rentingRentals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">렌탈 중인 예약이 없습니다</p>
                </CardContent>
              </Card>
            ) : (
              rentingRentals.map((rental) => (
                <RentalCard
                  key={rental.rentalItemId}
                  rental={rental}
                  actions={
                    <Button
                      size="sm"
                      className="flex-1 rounded-lg"
                      onClick={() => {
                        setSelectedRental(rental)
                        setShowReturnDialog(true)
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      반납 처리
                    </Button>
                  }
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Accept Dialog */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약을 수락하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>예약을 수락하면 고객이 결제를 진행할 수 있습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleAccept}>수락하기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약을 거절하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              예약을 거절하면 고객에게 알림이 전송되며 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-red-600">
              거절하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Start Rental Dialog */}
      <AlertDialog open={showStartRentalDialog} onOpenChange={setShowStartRentalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>렌탈을 시작하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>렌탈을 시작하면 상품이 고객에게 전달된 것으로 처리됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartRental}>렌탈 시작</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Return Dialog */}
      <AlertDialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>반납 처리</AlertDialogTitle>
            <AlertDialogDescription>
              상품의 반납을 처리합니다. 추가 비용이 있는 경우 입력해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="damageFee">손상 비용</Label>
              <Input
                id="damageFee"
                type="number"
                placeholder="0"
                value={returnData.damageFee}
                onChange={(e) => setReturnData({ ...returnData, damageFee: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="damageReason">손상 사유</Label>
              <Input
                id="damageReason"
                placeholder="손상 사유를 입력하세요"
                value={returnData.damageReason}
                onChange={(e) => setReturnData({ ...returnData, damageReason: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lateFee">연체료</Label>
              <Input
                id="lateFee"
                type="number"
                placeholder="0"
                value={returnData.lateFee}
                onChange={(e) => setReturnData({ ...returnData, lateFee: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lateReason">연체 사유</Label>
              <Input
                id="lateReason"
                placeholder="연체 사유를 입력하세요"
                value={returnData.lateReason}
                onChange={(e) => setReturnData({ ...returnData, lateReason: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memo">메모</Label>
              <Input
                id="memo"
                placeholder="추가 메모"
                value={returnData.memo}
                onChange={(e) => setReturnData({ ...returnData, memo: e.target.value })}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleReturn}>반납 처리</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  )
}
