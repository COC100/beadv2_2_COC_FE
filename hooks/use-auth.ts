"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

const PUBLIC_PATHS = [
  "/", 
  "/login", 
  "/signup", 
  "/forgot-password", 
  "/forgot-password/reset",
  "/oauth2", // Allow all OAuth callback routes
  "/products", // Allow product browsing
  "/notices", // Allow notice browsing
  "/about",
  "/contact",
  "/faq",
  "/help",
  "/how-it-works",
  "/intro",
  "/privacy",
  "/terms",
]

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
        console.log("[v0] No access token found, redirecting to /login")
        router.push("/login")
      }
    }
  }, [router, pathname])
}
