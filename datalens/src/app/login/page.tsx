"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        setHasToken(true)
        router.replace("/home")
      }
    } catch {
      // ignore access errors
    }
    setChecked(true)
  }, [router])

  // Wait for client check; don't render login if authenticated
  if (!checked || hasToken) return null

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-xl">
              <img src="/jiologo.png" alt="Jio Logo" className="size-6" />
            </div>
            Jio DataLens
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/login-banner.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
