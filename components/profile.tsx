"use client"

import type React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  ExternalLink,
  Loader2,
  RefreshCw,
  User,
  School,
  Calendar,
  CreditCard,
  FileText,
  PersonStanding,
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"

// Extend Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any
  }
}

interface UserData {
  user_id?: number
  name?: string
  email?: string
  access_token?: string | null
  refresh_token?: string | null
  created_at?: string
  updated_at?: string
  updated_by?: string | null
}

interface OlympiadData {
  id?: number
  first_name?: string
  last_name?: string
  phone?: string
  date_of_birth?: string
  email?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  class?: string
  school_name?: string
  board?: string
  school_address_line1?: string
  school_city?: string
  school_state?: string
  school_zip_code?: string
  school_country?: string
  medium?: string
  passport_photo_url?: string | null
  uid_aadhaar_url?: string | null
  school_id_url?: string | null
  subjects?: string
  created_at?: string
  updated_at?: string
  user_id?: number
  payment_status?: string
  aadhaar_number?: string
}

interface TransactionData {
  id?: number
  transection_id?: string
  payment_id?: string
  amount?: string
  payment_method?: string
  created_at?: string
  user_id?: number
}

interface APIResponse {
  user?: UserData
  olympiad?: OlympiadData[]
  transection?: TransactionData[]
}

const ALL_OLYMPIAD_SUBJECTS = ["Physics", "Maths", "Chemistry", "Biology"]

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch profile data
  const fetchProfileData = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get("https://schoozy.in/api/auth/profile", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      })

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setProfileData(response.data)
    } catch (err: any) {
      setError(`Failed to fetch profile data: ${err?.message || "Unknown error occurred"}`)
    } finally {
      setLoading(false)
    }
  }

  // Razorpay script loader (only once)
  useEffect(() => {
    if (typeof window !== "undefined" && window.Razorpay) {
      setRazorpayLoaded(true)
      return
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => setRazorpayLoaded(true)
    script.onerror = () => {
      toast({
        title: "Payment Error",
        description: "Failed to load payment gateway. Please try again.",
        variant: "destructive",
      })
    }
    document.body.appendChild(script)
    // eslint-disable-next-line
  }, [toast])

  useEffect(() => {
    fetchProfileData()
    // eslint-disable-next-line
  }, [])

  // Helpers for formatting
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Not provided"
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "Invalid date"
    }
  }

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return "Not provided"
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid date"
    }
  }

  const formatSubjects = (subjectsString: string | null | undefined): string => {
    if (!subjectsString) return "Not specified"
    try {
      return subjectsString
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .join(", ") || "Not specified"
    } catch {
      return "Not specified"
    }
  }

  const formatAmount = (amount: string | null | undefined): string => {
    if (!amount) return "₹0"
    let finalAmount = Number.parseFloat(amount)
    if (isNaN(finalAmount)) return "₹0"
    finalAmount = finalAmount / 100
    return `₹${finalAmount.toLocaleString("en-IN")}`
  }

  const formatAddress = (addressData: OlympiadData | null | undefined): string => {
    if (!addressData) return "Not provided"
    const parts: string[] = [
      addressData.address_line1,
      addressData.address_line2,
      `${addressData.city || ""}, ${addressData.state || ""} ${addressData.zip_code || ""}`,
      addressData.country,
    ].filter((part): part is string => Boolean(part && part.trim()))
    return parts.join(", ") || "Not provided"
  }

  const formatSchoolAddress = (olympiadData: OlympiadData | null | undefined): string => {
    if (!olympiadData) return "Not provided"
    const parts: string[] = [
      olympiadData.school_address_line1,
      `${olympiadData.school_city || ""}, ${olympiadData.school_state || ""} ${olympiadData.school_zip_code || ""}`,
      olympiadData.school_country,
    ].filter((part): part is string => Boolean(part && part.trim()))
    return parts.join(", ") || "Not provided"
  }

  // Calculate total cost with discount for N subjects
  const calculateTotalCostForNSubjects = useCallback((numSubjects: number, subjectClass: string | undefined) => {
    if (!subjectClass || numSubjects === 0) return 0
    const classNum = Number.parseInt(subjectClass)
    let pricePerSubject = 0
    if (classNum >= 8 && classNum <= 10) pricePerSubject = 350
    else if (classNum >= 11 && classNum <= 12) pricePerSubject = 500
    else return 0 // Invalid class
    const subtotal = numSubjects * pricePerSubject
    let discountAmount = 0
    if (numSubjects > 1) discountAmount = subtotal * 0.2 // 20% discount
    return subtotal - discountAmount
  }, [])

  // Calculate amount for a single new subject added
  const calculateSingleSubjectAmount = useCallback(
    (subjectClass: string | undefined, currentRegisteredSubjectsString: string | undefined, newSubject: string) => {
      if (!subjectClass || !newSubject) return 0
      const currentRegisteredSubjects = currentRegisteredSubjectsString
        ? currentRegisteredSubjectsString.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
        : []
      const uniqueSubjects = new Set(currentRegisteredSubjects)
      uniqueSubjects.add(newSubject)
      const nReg = currentRegisteredSubjects.length
      const nNew = uniqueSubjects.size
      if (nNew <= nReg) return 0 // Already registered
      const costIfNewSubjectAdded = calculateTotalCostForNSubjects(nNew, subjectClass)
      const costOfAlreadyRegistered = calculateTotalCostForNSubjects(nReg, subjectClass)
      return costIfNewSubjectAdded - costOfAlreadyRegistered
    },
    [calculateTotalCostForNSubjects]
  )

  // Payment for all registered subjects (when payment_status = Pending)
  const handlePayPendingSubjects = async () => {
    const user = profileData?.user
    const olympiadData = profileData?.olympiad?.[0]
    if (!user || !olympiadData) {
      toast({
        title: "Error",
        description: "User or Olympiad data not available for payment.",
        variant: "destructive",
      })
      return
    }
    if (isPaymentProcessing) {
      toast({
        title: "Please wait",
        description: "Payment is already in process.",
        variant: "default",
      })
      return
    }
    const registeredSubjectsArr = olympiadData.subjects
      ? olympiadData.subjects.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      : []
    const amountToPay = calculateTotalCostForNSubjects(registeredSubjectsArr.length, olympiadData.class)
    if (amountToPay <= 0) {
      toast({
        title: "Payment Error",
        description: "Invalid calculation of payment amount for your registration.",
        variant: "destructive",
      })
      return
    }
    if (!razorpayLoaded) {
      toast({
        title: "Payment Error",
        description: "Payment gateway not loaded. Please try again.",
        variant: "destructive",
      })
      return
    }
    setIsPaymentProcessing(true)
    try {
      const orderResponse = await axios.post(
        "https://schoozy.in/api/payment/razorpay",
        {
          amount: amountToPay,
          currency: "INR",
        }
      )
      const order = orderResponse.data

      const options = {
        key: "rzp_live_ngi2rcX5iuJttX",
        amount: order.amount,
        currency: order.currency,
        name: `Olympia-X Full Registration Payment`,
        description: `Payment for registered subjects: ${formatSubjects(olympiadData.subjects)}`,
        order_id: order.id,
        notes: {
          email: user.email,
        },
        handler: async (response: any) => {
          try {
            const verifyResponse = await axios.post(
              "https://schoozy.in/api/payment/verify",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
              { withCredentials: true }
            )
            if (verifyResponse.data.success) {
              await fetchProfileData()
              toast({
                title: "Payment Successful!",
                description: "Your registration payment is complete.",
                variant: "default",
              })
            } else {
              toast({
                title: "Verification Failed",
                description: "Payment was successful but verification failed. Contact support.",
                variant: "destructive",
              })
            }
          } catch (error) {
            toast({
              title: "Verification Error",
              description: "An error occurred during payment verification. Contact support.",
              variant: "destructive",
            })
          } finally {
            setIsPaymentProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsPaymentProcessing(false)
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment. Please try again.",
              variant: "default",
            })
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", (response: any) => {
        toast({
          title: "Payment Failed",
          description: `Payment failed: ${response.error?.description ?? "Unknown error"}`,
          variant: "destructive",
        })
        setIsPaymentProcessing(false)
      })
      rzp.open()
    } catch (e: any) {
      toast({
        title: "Payment Initiation Failed",
        description: e?.response?.data?.error || "Failed to initiate payment. Try again.",
        variant: "destructive",
      })
      setIsPaymentProcessing(false)
    }
  }

  // Register individual subject payment
  const handleRegisterSingleSubjectPayment = async (subject: string) => {
    const user = profileData?.user
    const olympiadData = profileData?.olympiad?.[0]
    if (!user || !olympiadData) {
      toast({
        title: "Error",
        description: "User or Olympiad data not available for registration.",
        variant: "destructive",
      })
      return
    }
    if (isPaymentProcessing) {
      toast({
        title: "Please wait",
        description: "Payment is already in process.",
        variant: "default",
      })
      return
    }

    const amount = calculateSingleSubjectAmount(olympiadData.class, olympiadData.subjects, subject)
    if (amount <= 0) {
      toast({
        title: "Registration Error",
        description: `Cannot register for ${subject}. It may already be registered or invalid pricing.`,
        variant: "destructive",
      })
      return
    }
    if (!razorpayLoaded) {
      toast({
        title: "Payment Error",
        description: "Payment gateway not loaded. Please try again.",
        variant: "destructive",
      })
      return
    }
    setIsPaymentProcessing(true)
    try {
      const orderResponse = await axios.post(
        "https://schoozy.in/api/payment/razorpay",
        {
          amount: amount,
          currency: "INR",
        }
      )
      const order = orderResponse.data

      const options = {
        key: "rzp_live_ngi2rcX5iuJttX",
        amount: order.amount,
        currency: order.currency,
        name: `Olympia-X Registration - ${subject}`,
        description: `Registration for Olympia-X Exam - ${subject}`,
        order_id: order.id,
        notes: {
          email: user.email,
        },
        handler: async (response: any) => {
          try {
            const verifyResponse = await axios.post(
              "https://schoozy.in/api/payment/verify",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
              { withCredentials: true }
            )
            if (verifyResponse.data.success) {
              const existingSubjects = olympiadData.subjects
                ? olympiadData.subjects.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
                : []
              const newSubjectsSet = new Set(existingSubjects)
              newSubjectsSet.add(subject)
              const totalSubjectsString = Array.from(newSubjectsSet).join(",")

              await axios.put(
                "https://schoozy.in/api/register",
                {
                  subjects: totalSubjectsString,
                },
                { withCredentials: true }
              )

              toast({
                title: "Payment Successful!",
                description:
                  "Your registration for Olympia-X is complete. Refreshing profile data...",
                variant: "default",
              })

              await fetchProfileData()
            } else {
              toast({
                title: "Verification Failed",
                description: "Payment was successful but verification failed. Contact support.",
                variant: "destructive",
              })
            }
          } catch (error) {
            toast({
              title: "Verification Error",
              description: "An error occurred during payment verification. Contact support.",
              variant: "destructive",
            })
          } finally {
            setIsPaymentProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsPaymentProcessing(false)
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment. Please try again.",
              variant: "default",
            })
          },
        },
      }
      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", (response: any) => {
        toast({
          title: "Payment Failed",
          description: `Payment failed: ${response.error?.description || "Unknown error"}`,
          variant: "destructive",
        })
        setIsPaymentProcessing(false)
      })
      rzp.open()
    } catch (e: any) {
      toast({
        title: "Payment Initiation Failed",
        description: e?.response?.data?.error || "Failed to initiate payment. Try again.",
        variant: "destructive",
      })
      setIsPaymentProcessing(false)
    }
  }

  // Logout handler
  const handleLogout = async (): Promise<void> => {
    try {
      await axios.post("https://schoozy.in/api/auth/logout", {}, { withCredentials: true })
      setProfileData(null)
      router.push("/")
    } catch {
      // Optional error handling
    }
  }

  // Render loading/error/no-data states
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <Button onClick={fetchProfileData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Defensive: all field access is safe below this point
  const user: UserData | undefined = profileData?.user
  const olympiadData: OlympiadData | null | undefined = profileData?.olympiad?.[0] ?? null
  const transactionDataList: TransactionData[] = profileData?.transection ?? []
  // Use fallback for possible missing fields
  const registeredSubjects: string[] = olympiadData?.subjects
    ? olympiadData.subjects.split(",").map((s) => s.trim()).filter(Boolean)
    : []
  const remainingSubjects: string[] = ALL_OLYMPIAD_SUBJECTS.filter(
    (subject) => !registeredSubjects.includes(subject)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* User Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="mb-4 h-24 w-24">
                {olympiadData?.passport_photo_url ? (
                  <img
                    src={olympiadData.passport_photo_url || "/placeholder.svg"}
                    alt="User Avatar"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-4xl font-semibold">
                    {user?.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "UN"}
                  </AvatarFallback>
                )}
              </Avatar>
              <CardTitle className="capitalize text-2xl font-bold">{user?.name || "Unknown User"}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user?.email || "No email provided"}
              </CardDescription>
              {user?.created_at && (
                <p className="mt-2 text-xs text-muted-foreground">Member since {formatDate(user.created_at)}</p>
              )}
            </CardHeader>
            <CardContent>
              <Separator className="my-4" />
              <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>User ID: {user?.user_id ?? "N/A"}</span>
                </div>
                {user?.updated_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated: {formatDate(user.updated_at)}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                  onClick={handleLogout}
                >
                  Log Out
                </Button>

                {/* Show Pay Now if payment_status pending */}
                {olympiadData?.payment_status === "Pending" && (
                  <div className="mt-4 rounded-md border border-red-400 bg-red-50 p-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-red-800">Payment Status: Pending</p>
                    <Button
                      onClick={handlePayPendingSubjects}
                      disabled={isPaymentProcessing || !razorpayLoaded}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                    >
                      Pay Now
                    </Button>
                  </div>
                )}

                {/* Show remaining subjects to register (add new) */}
		{/*
                {olympiadData && remainingSubjects.length > 0 && olympiadData.payment_status !== "Pending" && (
                  <div className="mt-4 space-y-3 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                    <p className="text-sm font-semibold text-yellow-800">Register for more subjects:</p>
                    {remainingSubjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between gap-2">
                        <span className="text-base font-medium text-gray-800">{subject}-X</span>
                        <Button
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                          onClick={() => handleRegisterSingleSubjectPayment(subject)}
                          disabled={isPaymentProcessing || !razorpayLoaded}
                        >
                          <PersonStanding className="mr-1 h-4 w-4" /> Register Now
                        </Button>
                      </div>
                    ))}
                  </div>
                )} */}
              </div>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="grid gap-8 lg:col-span-2">
            {/* Personal & School Info Card */}
            {olympiadData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    <CardTitle>Personal & School Information</CardTitle>
                  </div>
                  <CardDescription>
                    Registration ID: {olympiadData.id ?? "N/A"} • Registered: {formatDate(olympiadData.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="text-base font-semibold">
                      {olympiadData.first_name || ""} {olympiadData.last_name || ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-base">{olympiadData.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p className="text-base">{formatDate(olympiadData.date_of_birth)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base">{olympiadData.email || "Not provided"}</p>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="text-base">{formatAddress(olympiadData)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Class</p>
                    <p className="text-base">{olympiadData.class || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Medium</p>
                    <p className="text-base">{olympiadData.medium || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Board</p>
                    <p className="text-base">{olympiadData.board || "Not specified"}</p>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-sm font-medium text-muted-foreground">School Name</p>
                    <p className="text-base">{olympiadData.school_name || "Not provided"}</p>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-sm font-medium text-muted-foreground">School Address</p>
                    <p className="text-base">{formatSchoolAddress(olympiadData)}</p>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-sm font-medium text-muted-foreground">Subjects</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {olympiadData.subjects
                        ? olympiadData.subjects.split(",").map((subject: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {subject?.trim() || "Unknown"}
                            </Badge>
                          ))
                        : <span className="text-base">Not specified</span>
                      }
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Passport Photo</p>
                    {olympiadData.passport_photo_url ? (
                      <Button asChild variant="link" className="h-auto p-0 text-blue-600 hover:underline">
                        <a href={olympiadData.passport_photo_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-1 h-4 w-4" />
                          View Document
                        </a>
                      </Button>
                    ) : (
                      <p className="text-base text-muted-foreground">Not Uploaded</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">School ID</p>
                    {olympiadData.school_id_url ? (
                      <Button asChild variant="link" className="h-auto p-0 text-blue-600 hover:underline">
                        <a href={olympiadData.school_id_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-1 h-4 w-4" />
                          View Document
                        </a>
                      </Button>
                    ) : (
                      <p className="text-base text-muted-foreground">Not Uploaded</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Information List */}
            {transactionDataList.length > 0 ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <CardTitle>Payment Transactions</CardTitle>
                  </div>
                  <CardDescription>All past transactions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {transactionDataList.map((txn, i) => (
                    <div
                      key={txn.id ?? i}
                      className="grid grid-cols-1 gap-4 md:grid-cols-2 border-b border-gray-200 pb-4 last:border-none"
                    >
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                        <p className="text-base">{txn.transection_id ?? "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                        <p className="font-mono text-sm text-base">{txn.payment_id ?? "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Amount</p>
                        <p className="text-lg font-bold text-green-600">{formatAmount(txn.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                        <p className="text-base">{txn.payment_method || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                        <p className="text-base">{formatDateTime(txn.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">User ID</p>
                        <p className="text-base">{txn.user_id ?? "N/A"}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Transactions</CardTitle>
                  <CardDescription>No transactions found.</CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Registration Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Registration Status</CardTitle>
                <CardDescription>Overview of your olympiad registration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-start justify-between gap-4 rounded-md border p-4 sm:flex-row sm:items-center">
                  <div className="grid gap-1">
                    <p className="text-base font-semibold">
                      {olympiadData
                        ? `Class ${olympiadData.class || "--"} Olympia-X 2025 Registration`
                        : "No Registration Found"}
                    </p>
                    {olympiadData && (
                      <>
                        <p className="text-sm text-muted-foreground">Registered Subjects: {formatSubjects(olympiadData.subjects)}</p>
                        {remainingSubjects.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Remaining Subjects:{" "}
                            <div className="mt-1 flex flex-wrap gap-1">
                              {remainingSubjects.map((subject, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="border-orange-200 bg-orange-100 text-xs text-orange-800"
                                >
                                  {subject}-X
                                </Badge>
                              ))}
                            </div>
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">Registered: {formatDate(olympiadData.created_at)}</p>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {transactionDataList.some(tx => tx?.payment_id) && (
                      <Badge className="border-green-200 bg-green-100 text-green-800">Paid</Badge>
                    )}
                    {olympiadData && <Badge variant="outline">Registered</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access important links and actions</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex flex-col items-start justify-between gap-4 rounded-md border p-4 sm:flex-row sm:items-center">
                  <div className="grid gap-1">
                    <p className="text-base font-semibold">Admit Card</p>
                    <p className="text-sm text-muted-foreground">Download your admit card when available</p>
                  </div>
                  <Button disabled className="border-blue-500 bg-transparent text-blue-500" variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Coming Soon
                  </Button>
                </div>
                <div className="flex flex-col items-start justify-between gap-4 rounded-md border p-4 sm:flex-row sm:items-center">
                  <div className="grid gap-1">
                    <p className="text-base font-semibold">Practice Tests</p>
                    <p className="text-sm text-muted-foreground">Access practice materials and mock tests</p>
                  </div>
                  <Button disabled className="border-blue-500 bg-transparent text-blue-500" variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Coming Soon
                  </Button>
                </div>
                <div className="flex flex-col items-start justify-between gap-4 rounded-md border p-4 sm:flex-row sm:items-center">
                  <div className="grid gap-1">
                    <p className="text-base font-semibold">Refresh Data</p>
                    <p className="text-sm text-muted-foreground">Update your profile information</p>
                  </div>
                  <Button
                    onClick={fetchProfileData}
                    variant="outline"
                    disabled={loading}
                    className="border-green-500 bg-transparent text-green-500 hover:bg-green-50"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

