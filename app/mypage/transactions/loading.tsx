import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Loading() {
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
