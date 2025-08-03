"use client"

import { useState, useEffect, useCallback } from "react"
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
  const [userName, setUserName] = useState<string>("") // will be populated if verified
  const [loading, setLoading] = useState(true)

  const fetchUserLogin = useCallback(async () => {
    try {
      const response = await axios.get("https://schoozy.in/api/auth/verify", {
        withCredentials: true,
      })

      if (response.data?.message === "User is verified") {
        setIsLoggedIn(true)
        // optionally fetch user profile/name if available
        if (response.data.user?.name) {
          setUserName(response.data.user.name)
        } else {
          setUserName("User")
        }
      } else {
        setIsLoggedIn(false)
        setUserName("")
      }
    } catch (err) {
      // silent fail: not logged in or network error
      setIsLoggedIn(false)
      setUserName("")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUserLogin()
  }, [fetchUserLogin])

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Olympia X", href: "/olympia-x" },
    { name: "IMS", href: "/ims" },
    { name: "Events", href: "/events" },
    { name: "Contact Us", href: "/contact" },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SE</span>
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">Schoozy Edutech</h1>
              <p className="text-xs text-gray-500">Private Limited</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
                  pathname === item.href
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent hover:border-blue-600"
                }`}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Profile / Login */}
          <div className="hidden md:flex items-center ml-4">
            {loading ? (
              <div className="text-sm text-gray-500">Checking...</div>
            ) : isLoggedIn ? (
              <Link href="/profile" className="flex items-center" aria-label="Profile">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium">
                    {userName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                asChild
              >
                <Link href="/login-account">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen((o) => !o)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}
              {loading ? (
                <div className="px-3 py-2 text-base font-medium text-gray-500">Checking...</div>
              ) : isLoggedIn ? (
                <Link
                  href="/profile"
                  className="flex items-center text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              ) : (
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white mt-2"
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/login-account">Login</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}