"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import axios from "axios"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const prevPath = useRef<string | null>(null)

  const fetchUserLogin = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get("https://schoozy.in/api/auth/verify", {
        withCredentials: true,
      })

      if (response.data?.message === "User is verified") {
        setIsLoggedIn(true)
        setUserName(response.data.user?.name || "User")
      } else {
        setIsLoggedIn(false)
        setUserName("")
      }
    } catch {
      setIsLoggedIn(false)
      setUserName("")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const shouldReload = prevPath.current && prevPath.current !== "/" && pathname === "/"
    if (shouldReload) {
      fetchUserLogin()
    }
    prevPath.current = pathname
  }, [pathname, fetchUserLogin])

  useEffect(() => {
    fetchUserLogin()
  }, [fetchUserLogin])

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Olympia X", href: "/olympia-x" },
    { name: "IMS", href: "/ims" },
    { name: "Contact Us", href: "/contact" },
    { name: "Press Release", href: "/press-release" },
  ]

  return (
    <header
      className={[
        // positioning
        "fixed top-0 inset-x-0 z-50",
        // glassmorphism container (frosted)
        "supports-[backdrop-filter]:backdrop-blur-xl",
        "bg-white/35 dark:bg-slate-900/35",
        // subtle gradient sheen
        "bg-gradient-to-b from-white/50 to-white/25 dark:from-slate-900/40 dark:to-slate-900/20",
        // border + shadow to float above content
        "border-b border-white/30 dark:border-white/10",
        "shadow-[0_8px_30px_rgb(0_0_0/0.08)]",
      ].join(" ")}
      role="banner"
    >
      {/* hairline highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/40 dark:bg-white/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* inner row uses translucent card to enhance glass feel */}
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                src="https://registeration-docs.s3.us-east-1.amazonaws.com/WhatsApp+Image+2025-08-01+at+10.59.48.jpeg"
                alt="Schoozy Edutech"
                className="w-12 h-12 rounded-xl ring-1 ring-white/40 dark:ring-white/10 object-cover bg-white/40"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none"
                }}
              />
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Schoozy Edutech</h2>
              <p className="text-xs text-gray-600 dark:text-gray-300/80">Private Limited</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 rounded-full px-2 py-1
                          bg-white/25 dark:bg-white/10 supports-[backdrop-filter]:backdrop-blur-lg
                          ring-1 ring-white/40 dark:ring-white/10">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={[
                    "px-3 py-2 text-sm font-medium rounded-full transition-colors",
                    active
                      ? "text-blue-700 dark:text-blue-300 bg-white/60 dark:bg-white/10 ring-1 ring-white/60"
                      : "text-gray-800/90 dark:text-gray-200/90 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-white/50 dark:hover:bg-white/10",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Profile / Login */}
          <div className="hidden md:flex items-center ml-4">
            {loading ? (
              <div className="text-sm text-gray-700/80 dark:text-gray-300/80">Checking…</div>
            ) : isLoggedIn ? (
              <Link
                href="/profile"
                className="flex items-center rounded-full bg-white/40 dark:bg-white/10 px-2 py-1 ring-1 ring-white/40 dark:ring-white/10"
                aria-label="Profile"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Button
                className="bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white
                           hover:bg-white/70 dark:hover:bg-white/20
                           ring-1 ring-white/50 dark:ring-white/10"
                asChild
              >
                <Link href="/login-account">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen((o) => !o)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="text-gray-900 dark:text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation (Glass Sheet) */}
        {isMenuOpen && (
          <div
            className={[
              "md:hidden",
              "rounded-2xl mt-2 mb-3 overflow-hidden",
              "bg-white/55 dark:bg-slate-900/40 supports-[backdrop-filter]:backdrop-blur-2xl",
              "ring-1 ring-white/50 dark:ring-white/10 shadow-xl",
            ].join(" ")}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium rounded-xl
                             text-gray-900 dark:text-gray-100
                             hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-2 border-t border-white/40 dark:border-white/10">
                {loading ? (
                  <div className="px-3 py-2 text-base font-medium text-gray-700/80 dark:text-gray-300/80">
                    Checking…
                  </div>
                ) : isLoggedIn ? (
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-base font-medium rounded-xl
                               text-gray-900 dark:text-gray-100
                               hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                ) : (
                  <Button
                    className="w-full mt-2 text-gray-900 dark:text-white
                               bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20
                               ring-1 ring-white/60 dark:ring-white/10"
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link href="/login-account">Login</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
