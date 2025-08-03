"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

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
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="https://registeration-docs.s3.us-east-1.amazonaws.com/WhatsApp+Image+2025-08-01+at+10.59.48.jpeg" alt="Girl in a jacket"/>
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
              <a
                key={item.name}
                href={item.href}
                className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
                  pathname === item.href ? "border-blue-600 text-blue-600" : "border-transparent hover:border-blue-600"
                }`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
