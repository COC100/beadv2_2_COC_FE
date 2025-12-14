"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, GripVertical } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { productAPI } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

interface ImageInfo {
  imageId?: number | null
  url: string
  ordering: number
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [images, setImages] = useState<ImageInfo[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    pricePerDay: "",
    description: "",
  })

  const categories = [
    { value: "LAPTOP", label: "노트북" },
    { value: "DESKTOP", label: "데스크톱" },
    { value: "CAMERA", label: "카메라" },
    { value: "TABLET", label: "태블릿" },
    { value: "MOBILE", label: "모바일" },
    { value: "MONITOR", label: "모니터" },
    { value: "ACCESSORY", label: "액세서리" },
    { value: "DRONE", label: "드론" },
    { value: "AUDIO", label: "오디오" },
    { value: "PROJECTOR", label: "프로젝터" },
  ]

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productData = await productAPI.getDetail(Number(params.id))
        setProduct(productData)
        setFormData({
          name: productData.name,
          category: productData.category,
          pricePerDay: productData.pricePerDay.toString(),
          description: productData.description,
        })

        if (productData.images && productData.images.length > 0) {
          setImages(
            productData.images.map((img: any) => ({
              imageId: img.imageId,
              url: img.url,
              ordering: img.ordering,
            })),
          )
        }
      } catch (error: any) {
        toast({
          title: "상품 로딩 실패",
          description: error.message,
          variant: "destructive",
        })
        router.push("/seller")
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params.id, router, toast])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const uploadingToast = toast({
      title: "이미지 업로드 중",
      description: `${files.length}개의 이미지를 업로드하고 있습니다...`,
    })

    try {
      const uploadPromises = Array.from(files).map((file) => productAPI.uploadImage(file, "products"))
      const uploadedUrls = await Promise.all(uploadPromises)

      const newImages: ImageInfo[] = uploadedUrls.map((url, index) => ({
        imageId: null,
        url,
        ordering: images.length + index,
      }))

      setImages([...images, ...newImages])
      toast({
        title: "이미지 업로드 완료",
        description: `${uploadedUrls.length}개의 이미지가 업로드되었습니다`,
      })
    } catch (error: any) {
      toast({
        title: "이미지 업로드 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)

    // Update ordering values
    const updatedImages = newImages.map((img, idx) => ({
      ...img,
      ordering: idx,
    }))

    setImages(updatedImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const updatedImages = newImages.map((img, idx) => ({
      ...img,
      ordering: idx,
    }))
    setImages(updatedImages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await productAPI.update(Number(params.id), {
        name: formData.name,
        description: formData.description,
        pricePerDay: Number(formData.pricePerDay),
        category: formData.category,
        images: images.map((img) => ({
          imageId: img.imageId,
          url: img.url,
          ordering: img.ordering,
        })),
      })

      toast({
        title: "상품 수정 완료",
        description: "상품이 성공적으로 수정되었습니다",
      })

      router.push("/seller")
    } catch (error: any) {
      toast({
        title: "상품 수정 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>로딩 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/seller"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          판매자 페이지로
        </Link>

        <h1 className="text-3xl font-bold mb-8">상품 수정</h1>

        <div className="max-w-3xl">
          <Card>
            <CardContent className="p-6 space-y-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="productName">
                      상품명 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="productName"
                      placeholder="예: MacBook Pro 16인치 M3"
                      className="rounded-lg"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">
                      카테고리 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricePerDay">
                      1일 대여 가격 <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="pricePerDay"
                        type="number"
                        placeholder="25000"
                        className="rounded-lg"
                        value={formData.pricePerDay}
                        onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                        required
                      />
                      <span className="text-sm text-muted-foreground">원</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      상세 설명 <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="상품의 상세 정보를 입력하세요"
                      rows={5}
                      className="rounded-lg"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>상품 이미지</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      이미지를 드래그하여 순서를 변경할 수 있습니다. 첫 번째 이미지가 대표 이미지로 설정됩니다.
                    </p>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-1">클릭하거나 이미지를 드래그하여 업로드</p>
                        <p className="text-xs text-muted-foreground">최대 5장, JPG, PNG 형식 (각 10MB 이하)</p>
                      </label>
                    </div>
                    {images.length > 0 && (
                      <div className="grid grid-cols-5 gap-3 mt-3">
                        {images.map((img, index) => (
                          <div
                            key={index}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden cursor-move group"
                          >
                            <img
                              src={img.url || "/placeholder.svg"}
                              alt={`상품 이미지 ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {index === 0 && (
                              <Badge className="absolute top-2 left-2 bg-primary text-white text-xs">대표 이미지</Badge>
                            )}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="h-6 w-6"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="h-5 w-5 text-white drop-shadow-md" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1 rounded-lg h-11" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? "수정 중..." : "수정 완료"}
                    </Button>
                    <Link href="/seller" className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-lg h-11 bg-transparent"
                        size="lg"
                      >
                        취소
                      </Button>
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
