"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api-extensions"
import { useRequireAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function AdminMembersPage() {
  useRequireAuth()

  const { toast } = useToast()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [keyword, setKeyword] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")

  useEffect(() => {
    loadMembers()
  }, [page, searchKeyword])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getMembers({
        keyword: searchKeyword,
        page,
        size: 20,
      })
      setMembers(response.data.content)
      setTotalPages(response.data.totalPages)
    } catch (error: any) {
      toast({
        title: "회원 목록 조회 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearchKeyword(keyword)
    setPage(0)
  }

  const handleStatusChange = async (memberId: number, newStatus: string) => {
    if (!confirm(`회원 상태를 ${newStatus}로 변경하시겠습니까?`)) return

    try {
      await adminAPI.updateMemberStatus(memberId, newStatus)
      toast({
        title: "상태 변경 완료",
        description: "회원 상태가 변경되었습니다.",
      })
      loadMembers()
    } catch (error: any) {
      toast({
        title: "상태 변경 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">활성</Badge>
      case "INACTIVE":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">비활성</Badge>
      case "BLACKLIST":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">블랙리스트</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">회원 관리</h1>
          <p className="text-muted-foreground">회원 목록을 조회하고 블랙리스트를 관리합니다.</p>
        </div>

        <div className="mb-6 flex gap-2">
          <Link href="/admin">
            <Button variant="outline" className="bg-transparent">관리자 대시보드</Button>
          </Link>
          <Link href="/admin/sellers">
            <Button variant="outline" className="bg-transparent">판매자 관리</Button>
          </Link>
          <Link href="/admin/settlements">
            <Button variant="outline" className="bg-transparent">정산 관리</Button>
          </Link>
          <Link href="/admin/notices">
            <Button variant="outline" className="bg-transparent">공지사항 관리</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>회원 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="이메일 또는 이름으로 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>검색</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">로딩 중...</div>
            ) : members.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">회원이 없습니다</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>전화번호</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.memberId}>
                      <TableCell>{member.memberId}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {member.status !== "BLACKLIST" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleStatusChange(member.memberId, "BLACKLIST")}
                            >
                              블랙리스트
                            </Button>
                          )}
                          {member.status === "BLACKLIST" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(member.memberId, "ACTIVE")}
                              className="bg-transparent"
                            >
                              해제
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="bg-transparent"
            >
              이전
            </Button>
            <span className="flex items-center px-4">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="bg-transparent"
            >
              다음
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
