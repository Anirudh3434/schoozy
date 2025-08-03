"use client"
import React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import axios from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      // Configure axios to include cookies
      const response = await axios.post(
        "https://schoozy.in/api/auth/login", 
        { email, password },
        {
          withCredentials: true, // This ensures cookies are sent and received
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data) {
        setMessage("Login successful! Redirecting...")
        console.log(response.data)
        
        // Redirect to dashboard or home page after successful login
        setTimeout(() => {
          router.push("/") // Change to your desired redirect path
        }, 1500)
      }
    } catch (error: any) {
      console.error("Login error:", error)
      
      if (error.response?.data?.message) {
        setMessage(error.response.data.message)
      } else if (error.response?.status === 401) {
        setMessage("Invalid email or password")
      } else if (error.response?.status >= 500) {
        setMessage("Server error. Please try again later.")
      } else {
        setMessage("Login failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      <Card className="w-full max-w-md relative z-10 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          {/* Company Logo */}
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
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            
            {message && (
              <p
                className={`text-center text-sm ${
                  message.includes("successful") ? "text-green-600" : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </form>
          
          <div className="mt-4 text-center text-sm">
            {"Don't have an account? "}
            <Link 
              href="/create-account" 
              className="underline text-blue-600 hover:text-purple-600 cursor-pointer transition-colors"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
