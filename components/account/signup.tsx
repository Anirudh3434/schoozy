"use client"
import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import axios from "axios"
import { Label } from "@/components/ui/label"

export default function SignUpForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    // Client-side validation
    if (!name.trim()) return setError("Name is required")
    if (!email.trim()) return setError("Email is required")
    if (!phone.trim()) return setError("Phone number is required")
    if (!/^\d{10,15}$/.test(phone.trim())) return setError("Enter a valid phone number")
    if (password.length < 6) return setError("Password must be at least 6 characters long")

    try {
      // Send OTP to email
      await axios.post(`https://schoozy.in/api/auth/send-otp`, {
        email: email.trim().toLowerCase(),
      })

      setMessage("OTP sent! Redirecting...")
      router.push(
        `/otp-verify?email=${encodeURIComponent(email.trim())}&name=${encodeURIComponent(name.trim())}&phone=${encodeURIComponent(phone.trim())}&pass=${encodeURIComponent(password)}`
      )
    } catch (error: any) {
      console.error("OTP sending error:", error.response?.data || error.message)
      setMessage(error.response?.data?.message || "Failed to send OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const setError = (msg: string) => {
    setMessage(msg)
    setIsLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>

      <Card className="w-full max-w-md shadow-xl relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="https://registeration-docs.s3.us-east-1.amazonaws.com/WhatsApp+Image+2025-08-01+at+10.59.48.jpeg"
              alt="Company Logo"
              width={80}
              height={80}
              className="rounded-lg"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
          <CardDescription>Create your account to get started.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                maxLength={15}
              />
              <p className="text-xs text-gray-500">Enter a valid phone number (digits only)</p>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
            </div>

            {/* Submit */}
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Sign Up"}
            </Button>

            {/* Message */}
            {message && (
              <p
                className={`text-center text-sm ${
                  message.includes("OTP sent") || message.includes("Redirecting") 
                    ? "text-green-600" 
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </form>

          {/* Login Link */}
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login-account" className="underline text-blue-600 hover:text-purple-600">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

