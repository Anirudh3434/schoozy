"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const hideLayout = pathname.startsWith("/exam")

  return (
    <>
      {!hideLayout && <Header />}
      <div className="mt-10">{children}</div>
      {!hideLayout && <Footer />}
    </>
  )
}
