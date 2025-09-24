"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasCheckedToken, setHasCheckedToken] = useState(false)

  useEffect(() => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.replace("/login")
      } else {
        setIsAuthenticated(true)
      }
    } catch {
      router.replace("/login")
    } finally {
      setHasCheckedToken(true)
    }
  }, [router])

  if (!hasCheckedToken) {
    return null // Don't render anything until token check is complete
  }

  if (!isAuthenticated) {
    return null // Don't render children if not authenticated
  }

  return <>{children}</>
}
