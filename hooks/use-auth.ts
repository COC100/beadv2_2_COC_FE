"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

const PUBLIC_PATHS = ["/intro", "/login", "/signup", "/forgot-password", "/forgot-password/reset"]

export function useRequireAuth() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check for public pages
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
      return
    }

    // Check if token exists
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        console.log("[v0] No access token found, redirecting to /intro")
        router.push("/intro")
      }
    }
  }, [router, pathname])
}
