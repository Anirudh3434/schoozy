"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, ExternalLink, Loader2, RefreshCw, User, Phone, MapPin, School, Calendar, CreditCard, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

// Type definitions based on your API response structure
interface UserData {
  user_id: number
  name: string
  email: string
  password?: string
  access_token?: string | null
  refresh_token?: string | null
  created_at: string
  updated_at: string
  updated_by?: string | null
}

interface OlympiadData {
  id: number
  first_name: string
  last_name: string
  phone: string
  date_of_birth: string
  email: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  zip_code: string
  country: string
  class: string
  school_name: string
  board: string
  school_address_line1: string
  school_city: string
  school_state: string
  school_zip_code: string
  school_country: string
  medium: string
  passport_photo_url: string | null
  uid_aadhaar_url: string | null
  school_id_url: string | null
  subjects: string
  created_at: string
  updated_at: string
  user_id: number
}

interface TransactionData {
  transection_id: number
  user_id: number
  payment_id: string
  amount: string
  payment_method: string
  status: string
  created_at: string
}

interface APIResponse {
  user: UserData
  olympiad: OlympiadData[]
  transection: TransactionData[]
}

interface PaymentStatusConfig {
  label: string
  className: string
}

type PaymentStatus = 'completed' | 'success' | 'paid' | 'pending' | 'processing' | 'failed' | 'cancelled' | 'error'

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  // API call function
  const fetchProfileData = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      // Make the actual API call to your endpoint
      const response = await axios.get("https://schoozy.in/api/auth/profile", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: APIResponse = await response.data
      console.log("API Response:", data)
      setProfileData(data)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Failed to fetch profile data: ${errorMessage}`)
      console.error("Profile fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [])

  // Helper functions for data mapping and formatting
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Not provided"
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return "Invalid date"
    }
  }

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return "Not provided"
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return "Invalid date"
    }
  }

  const formatSubjects = (subjectsString: string | null | undefined): string => {
    if (!subjectsString) return "Not specified"
    return subjectsString.split(',').map(s => s.trim()).join(', ')
  }

  const formatAmount = (amount: string | null | undefined): string => {
    if (!amount) return "₹0"
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`
  }

  const getPaymentStatusBadge = (status: string | null | undefined): PaymentStatusConfig => {
    const normalizedStatus = (status || 'pending').toLowerCase().trim() as PaymentStatus
    
    const statusConfig: Record<PaymentStatus, PaymentStatusConfig> = {
      'completed': { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' },
      'success': { label: 'Success', className: 'bg-green-100 text-green-800 border-green-200' },
      'paid': { label: 'Paid', className: 'bg-green-100 text-green-800 border-green-200' },
      'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'processing': { label: 'Processing', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'failed': { label: 'Failed', className: 'bg-red-100 text-red-800 border-red-200' },
      'cancelled': { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
      'error': { label: 'Error', className: 'bg-red-100 text-red-800 border-red-200' }
    }
    
    return statusConfig[normalizedStatus] || { 
      label: normalizedStatus || 'Unknown', 
      className: 'bg-gray-100 text-gray-800 border-gray-200' 
    }
  }

  const formatAddress = (addressData: OlympiadData | null): string => {
    if (!addressData) return "Not provided"
    
    const parts: string[] = [
      addressData.address_line1,
      addressData.address_line2,
      `${addressData.city || ''}, ${addressData.state || ''} ${addressData.zip_code || ''}`,
      addressData.country
    ].filter((part): part is string => Boolean(part && part.trim()))
    
    return parts.join(', ') || "Not provided"
  }

  const formatSchoolAddress = (olympiadData: OlympiadData | null): string => {
    if (!olympiadData) return "Not provided"
    
    const parts: string[] = [
      olympiadData.school_address_line1,
      `${olympiadData.school_city || ''}, ${olympiadData.school_state || ''} ${olympiadData.school_zip_code || ''}`,
      olympiadData.school_country
    ].filter((part): part is string => Boolean(part && part.trim()))
    
    return parts.join(', ') || "Not provided"
  }

  // Handle logout
  const handleLogout = async (): Promise<void> => {
    try {
    
      await axios.post("https://schoozy.in/api/auth/logout", {
       withCredentials: true,
      })
      
      router.push('/')
      // For now, just clear local state
      setProfileData(null)
      console.log("Logout functionality to be implemented")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  // Handle forgot password
  const handleForgotPassword = (): void => {
    // Add your forgot password logic here
    console.log("Forgot password functionality to be implemented")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchProfileData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <p>No profile data available</p>
      </div>
    )
  }

  // Extract data from API response with proper typing
  const user: UserData = profileData.user
  const olympiadData: OlympiadData | null = profileData.olympiad?.[0] || null
  const transactionData: TransactionData | null = profileData.transection?.[0] || null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* User Info Card - Maps from profileData.user */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-4xl font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl font-bold capitalize">
                {user.name || 'Unknown User'}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user.email || 'No email provided'}
              </CardDescription>
              {user.created_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Member since {formatDate(user.created_at)}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>User ID: {user.user_id || 'N/A'}</span>
                </div>
                {user.updated_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated: {formatDate(user.updated_at)}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent"
                  onClick={handleForgotPassword}
                >
                  Forgot Password
                </Button>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="lg:col-span-2 grid gap-8">
            
            {/* Personal & School Information - Maps from profileData.olympiad[0] */}
            {olympiadData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    <CardTitle>Personal & School Information</CardTitle>
                  </div>
                  <CardDescription>
                    Registration ID: {olympiadData.id} • Registered: {formatDate(olympiadData.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Personal Information */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="text-base font-semibold">
                      {olympiadData.first_name} {olympiadData.last_name}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-base">{olympiadData.phone || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p className="text-base">{formatDate(olympiadData.date_of_birth)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base">{olympiadData.email || 'Not provided'}</p>
                  </div>
                  
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="text-base">{formatAddress(olympiadData)}</p>
                  </div>
                  
                  {/* Education Information */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Class</p>
                    <p className="text-base">{olympiadData.class || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Medium</p>
                    <p className="text-base">{olympiadData.medium || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Board</p>
                    <p className="text-base">{olympiadData.board || 'Not specified'}</p>
                  </div>
                  
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-sm font-medium text-muted-foreground">School Name</p>
                    <p className="text-base">{olympiadData.school_name || 'Not provided'}</p>
                  </div>
                  
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-sm font-medium text-muted-foreground">School Address</p>
                    <p className="text-base">{formatSchoolAddress(olympiadData)}</p>
                  </div>
                  
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-sm font-medium text-muted-foreground">Subjects</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {olympiadData.subjects ? 
                        olympiadData.subjects.split(',').map((subject: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {subject.trim()}
                          </Badge>
                        )) : 
                        <span className="text-base">Not specified</span>
                      }
                    </div>
                  </div>
                  
                  {/* Document Links */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Passport Photo</p>
                    {olympiadData.passport_photo_url ? (
                      <Button 
                        asChild 
                        variant="link" 
                        className="p-0 h-auto text-blue-600 hover:underline"
                      >
                        <a href={olympiadData.passport_photo_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-1" />
                          View Document
                        </a>
                      </Button>
                    ) : (
                      <p className="text-base text-muted-foreground">Not Uploaded</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">UID/Aadhaar</p>
                    {olympiadData.uid_aadhaar_url ? (
                      <Button 
                        asChild 
                        variant="link" 
                        className="p-0 h-auto text-blue-600 hover:underline"
                      >
                        <a href={olympiadData.uid_aadhaar_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-1" />
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
                      <Button 
                        asChild 
                        variant="link" 
                        className="p-0 h-auto text-blue-600 hover:underline"
                      >
                        <a href={olympiadData.school_id_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-1" />
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

            {/* Payment Information - Maps from profileData.transection[0] */}
            {transactionData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <CardTitle>Payment Information</CardTitle>
                  </div>
                  <CardDescription>Latest transaction details</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                      <p className="text-base">{transactionData.transection_id || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                      <p className="text-base font-mono text-sm">{transactionData.payment_id || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Amount</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatAmount(transactionData.amount)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                      <p className="text-base">{transactionData.payment_method || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge 
                        className={`capitalize ${getPaymentStatusBadge(transactionData.status).className}`}
                      >
                        {getPaymentStatusBadge(transactionData.status).label}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                      <p className="text-base">{formatDateTime(transactionData.created_at)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">User ID</p>
                      <p className="text-base">{transactionData.user_id || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Registration Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Registration Status</CardTitle>
                <CardDescription>Overview of your olympiad registration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-md">
                  <div className="grid gap-1">
                    <p className="text-base font-semibold">
                      {olympiadData ? 
                        `Class ${olympiadData.class} Olympiad Registration` : 
                        'No Registration Found'
                      }
                    </p>
                    {olympiadData && (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Subjects: {formatSubjects(olympiadData.subjects)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Registered: {formatDate(olympiadData.created_at)}
                        </p>
                      </>
                    )}
                    {transactionData && (
                      <p className="text-sm text-muted-foreground">
                        Payment: {formatAmount(transactionData.amount)} via {transactionData.payment_method}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {transactionData && (
                      <Badge 
                        className={`capitalize ${getPaymentStatusBadge(transactionData.status).className}`}
                      >
                        {getPaymentStatusBadge(transactionData.status).label}
                      </Badge>
                    )}
                    {olympiadData && (
                      <Badge variant="outline">
                        Registered
                      </Badge>
                    )}
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
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-md">
                  <div className="grid gap-1">
                    <p className="text-base font-semibold">Admit Card</p>
                    <p className="text-sm text-muted-foreground">
                      Download your admit card when available
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    disabled
                    className="border-blue-500 text-blue-500 bg-transparent"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Coming Soon
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-md">
                  <div className="grid gap-1">
                    <p className="text-base font-semibold">Practice Tests</p>
                    <p className="text-sm text-muted-foreground">
                      Access practice materials and mock tests
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    disabled
                    className="border-blue-500 text-blue-500 bg-transparent"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Coming Soon
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-md">
                  <div className="grid gap-1">
                    <p className="text-base font-semibold">Refresh Data</p>
                    <p className="text-sm text-muted-foreground">
                      Update your profile information
                    </p>
                  </div>
                  <Button
                    onClick={fetchProfileData}
                    variant="outline"
                    disabled={loading}
                    className="border-green-500 text-green-500 hover:bg-green-50 bg-transparent"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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