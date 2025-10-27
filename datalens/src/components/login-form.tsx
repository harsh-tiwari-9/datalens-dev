"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthApi } from "@/hooks/useApi"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const auth = useAuthApi()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpRequested, setOtpRequested] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-trigger OTP when phone number reaches 10 digits
  useEffect(() => {
    console.log("otp requested:::", otpRequested)
    const digitsOnly = phoneNumber.replace(/\D/g, "")
    if (digitsOnly.length !== 10 || submitting || otpRequested) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setError(null)
      setSubmitting(true)
      try {
        const res = await auth.request(
          "/jviz/authentication/loginWithOTP",
          {
            method: "POST",
            body: { mobileNumber: digitsOnly },
            service: "auth",
          }
        )

        // Attempt token capture if backend returns it immediately
        let token: string | null = null
        if (res && typeof res === "object") {
          const candidates = [
            (res as any).token,
            (res as any).accessToken,
            (res as any).jwt,
            (res as any).authToken,
          ]
          token = (candidates.find(Boolean) as string) || null
        }

        if (token) {
          localStorage.setItem("token", token)
          toast.success("Logged in successfully")
          router.replace("/home")
          return
        }

        setOtpRequested(true)
        toast.info("OTP sent. Please enter the OTP to continue.")
        setError("OTP sent. Please enter the OTP to continue.")
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Login failed"
        setError(msg)
        toast.error(msg)
      } finally {
        setSubmitting(false)
      }
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [phoneNumber, auth, router, submitting, otpRequested])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const digitsOnly = phoneNumber.replace(/\D/g, "")

      if (otpRequested && otp.trim().length > 0) {
        // Step 2: validate OTP
        const res = await auth.request("/jviz/authentication/validateOTP", {
          method: "POST",
          body: { mobileNumber: digitsOnly, otp: otp.trim() },
          service: "auth",
        })

        // Persist tokens from response shape provided
        const data: any = (res as any)?.data
        const accessToken: string | null = data?.accessToken || null
        const tokenType: string | null = data?.tokenType || null
        const tkf: string | null = data?.tkf || null
        const xpr: number | null = data?.xpr ?? null

        if (accessToken) {
          localStorage.setItem("token", accessToken)
          if (tokenType) localStorage.setItem("tokenType", tokenType)
          if (tkf) localStorage.setItem("tkf", tkf)
          if (xpr !== null) {
            const expiresAt = Date.now() + Number(xpr) * 1000
            localStorage.setItem("xpr", String(xpr))
            localStorage.setItem("tokenExpiresAt", String(expiresAt))
          }
          toast.success("Logged in successfully")
          router.replace("/home")
          toast.success("OTP verified")
          return
        } else {
          toast.error("Login failed")
          router.replace("/login")
          return
        }
        return
      }

      // Step 1: request OTP
      const res = await auth.request("/jviz/authentication/loginWithOTP", {
        method: "POST",
        body: { mobileNumber: digitsOnly },
        service: "auth",
      })

      // Attempt token capture if backend returns it immediately
      let token: string | null = null
      if (res && typeof res === "object") {
        const candidates = [
          (res as any).token,
          (res as any).accessToken,
          (res as any).jwt,
          (res as any).authToken,
        ]
        token = (candidates.find(Boolean) as string) || null
      }

      if (token) {
        localStorage.setItem("token", token)
        toast.success("Logged in successfully")
        router.replace("/home")
        return
      }

      setOtpRequested(true)
      toast.info("OTP sent. Please enter the OTP to continue.")
      setError("OTP sent. Please enter the OTP to continue.")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed"
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  function changePhoneNumber(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("changePhoneNumber", e.target.value)
    setPhoneNumber(e.target.value)
    setOtpRequested(false) // Reset OTP state when phone number changes
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={onSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your phone number below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" type="tel" placeholder="Enter your phone number" value={phoneNumber} onChange={changePhoneNumber} required />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center"> 
            <Label htmlFor="password">OTP</Label>
          </div>
          <Input id="password" type="password" placeholder="Enter your OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={
            submitting || !(
              phoneNumber.replace(/\D/g, "").length === 10 && otp.trim().length === 6
            )
          }
        >
          {"Login"}
        </Button>
      </div>
    </form>
  )
}
