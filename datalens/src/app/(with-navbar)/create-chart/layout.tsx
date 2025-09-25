"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateChartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [hasCheckedToken, setHasCheckedToken] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }
    setHasCheckedToken(true)
  }, [router])

  if (!hasCheckedToken) {
    return null
  }

  return <>{children}</>
}
