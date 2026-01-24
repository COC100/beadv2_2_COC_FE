import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function RecommendationsLoading() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p>로딩 중...</p>
      </div>
      <Footer />
    </div>
  )
}
