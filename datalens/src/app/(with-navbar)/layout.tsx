// import '@/globals.css';
"use client"
import Navbar04Page from "@/components/navbar-04/navbar-04"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function WithNavbarLayout({ children }: { children: React.ReactNode }) {

  const [hasCheckedToken, setHasCheckedToken] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  
  const dashboardPage = pathname.startsWith('/dashboard')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    setHasCheckedToken(true)
  }, [router])

  if (!hasCheckedToken) {
    return null
  }
  return (
    <>
      <div className="min-h-svh">
        <Navbar04Page />
          <main className={`mx-auto ${dashboardPage ? "max-w-8xl px-15" : "max-w-7xl px-4"} py-28`}>
            {children}
        </main>
      </div>
      {/* <main>{children}</main> */}
    </>
  );
}