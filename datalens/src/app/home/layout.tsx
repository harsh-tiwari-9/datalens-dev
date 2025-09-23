"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProtectedHomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.replace("/login")
      } else {
        setHasToken(true)
      }
    } catch {
      router.replace("/login")
    }
    setChecked(true)
  }, [router])

  if (!checked || !hasToken) return null

  return <>{children}</>
}


