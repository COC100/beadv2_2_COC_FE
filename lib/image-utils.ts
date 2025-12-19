const TARGET_SIZE = 409600 // 400KB
const MAX_SERVER_SIZE = 512000 // 500KB
const MAX_RESOLUTION = 1600 // 긴 변 기준
const QUALITY_START = 0.82
const QUALITY_STEPS = [0.82, 0.78, 0.74, 0.7, 0.66]
const RESOLUTION_STEPS = [1600, 1400, 1200]

interface OptimizeResult {
  file: File
  originalSize: number
  optimizedSize: number
  compressionRatio: number
}

/**
 * 이미지를 리사이징, 압축하고 WebP로 변환합니다
 * 목표: 400KB 이하 (서버 제한: 500KB)
 */
export async function optimizeImageToWebP(file: File): Promise<OptimizeResult> {
  // 1. 사전 검증
  if (!file || file.size === 0) {
    throw new Error("유효하지 않은 파일입니다")
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다")
  }

  // 원본이 너무 큰 경우 (20MB+)
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("이미지 파일이 너무 큽니다. 20MB 이하의 파일을 선택해주세요")
  }

  const originalSize = file.size

  try {
    // 2. 이미지 디코딩
    const imageBitmap = await loadImage(file)

    // 3-6. 최적화 시도 (품질 및 해상도 조정)
    const optimizedBlob = await optimizeImage(imageBitmap, file.name)

    // 7. 최종 파일 생성
    const fileName = file.name.replace(/\.[^.]+$/, ".webp")
    const optimizedFile = new File([optimizedBlob], fileName, { type: "image/webp" })

    const compressionRatio = ((originalSize - optimizedFile.size) / originalSize) * 100

    console.log("[v0] Image optimization complete:", {
      originalSize: `${(originalSize / 1024).toFixed(2)}KB`,
      optimizedSize: `${(optimizedFile.size / 1024).toFixed(2)}KB`,
      compressionRatio: `${compressionRatio.toFixed(1)}%`,
    })

    return {
      file: optimizedFile,
      originalSize,
      optimizedSize: optimizedFile.size,
      compressionRatio,
    }
  } catch (error: any) {
    console.error("[v0] Image optimization failed:", error)
    throw new Error(error.message || "이미지 최적화에 실패했습니다")
  }
}

/**
 * 이미지를 로드합니다 (createImageBitmap 우선, 실패 시 Image 객체 사용)
 */
async function loadImage(file: File): Promise<ImageBitmap> {
  try {
    // createImageBitmap 시도
    return await createImageBitmap(file)
  } catch (error) {
    // 실패 시 Image 객체 사용
    console.log("[v0] Falling back to Image object for loading")
    return await loadImageFromImageElement(file)
  }
}

/**
 * Image 객체를 사용하여 이미지를 로드합니다
 */
function loadImageFromImageElement(file: File): Promise<ImageBitmap> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = async () => {
      URL.revokeObjectURL(url)
      try {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Canvas context not available")
        ctx.drawImage(img, 0, 0)
        const bitmap = await createImageBitmap(canvas)
        resolve(bitmap)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("이미지를 로드할 수 없습니다"))
    }

    img.src = url
  })
}

/**
 * 이미지를 최적화합니다 (품질 및 해상도 조정)
 */
async function optimizeImage(imageBitmap: ImageBitmap, originalName: string): Promise<Blob> {
  // 해상도 단계별 시도
  for (const maxResolution of RESOLUTION_STEPS) {
    console.log(`[v0] Trying resolution: ${maxResolution}px`)

    // 리사이징
    const { width, height } = calculateDimensions(imageBitmap.width, imageBitmap.height, maxResolution)

    // 품질 단계별 시도
    for (const quality of QUALITY_STEPS) {
      console.log(`[v0] Trying quality: ${quality}`)

      const blob = await resizeAndCompress(imageBitmap, width, height, quality)

      if (blob.size <= TARGET_SIZE) {
        console.log(`[v0] Success! Size: ${(blob.size / 1024).toFixed(2)}KB`)
        return blob
      }

      console.log(`[v0] Size too large: ${(blob.size / 1024).toFixed(2)}KB, continuing...`)
    }
  }

  // 모든 시도가 실패한 경우
  throw new Error("이미지를 400KB 이하로 최적화할 수 없습니다. 더 작은 이미지를 업로드해 주세요")
}

/**
 * 리사이징할 크기를 계산합니다
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxResolution: number,
): { width: number; height: number } {
  const maxDimension = Math.max(originalWidth, originalHeight)

  if (maxDimension <= maxResolution) {
    return { width: originalWidth, height: originalHeight }
  }

  const scale = maxResolution / maxDimension
  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
  }
}

/**
 * 이미지를 리사이징하고 WebP로 압축합니다
 */
function resizeAndCompress(imageBitmap: ImageBitmap, width: number, height: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      reject(new Error("Canvas context를 가져올 수 없습니다"))
      return
    }

    // 이미지 그리기
    ctx.drawImage(imageBitmap, 0, 0, width, height)

    // WebP로 변환
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error("Blob 생성에 실패했습니다"))
        }
      },
      "image/webp",
      quality,
    )
  })
}

/**
 * 여러 이미지를 한 번에 최적화합니다
 */
export async function optimizeImages(files: File[]): Promise<OptimizeResult[]> {
  const results: OptimizeResult[] = []

  for (const file of files) {
    try {
      const result = await optimizeImageToWebP(file)
      results.push(result)
    } catch (error: any) {
      console.error(`[v0] Failed to optimize ${file.name}:`, error)
      throw error
    }
  }

  return results
}
