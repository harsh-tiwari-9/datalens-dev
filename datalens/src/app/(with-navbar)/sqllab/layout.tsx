"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProtectedSqlLabLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return <>{children}</>
}


