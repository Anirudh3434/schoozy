"use client"
import { useState, type ChangeEvent, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, User, School, FileText, CreditCard, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"

// Extend Window interface to include Razorpay
declare global {
interface Window {
  Razorpay: any
}
}

// Define a type for form errors
type FormErrors = {
firstName?: string
lastName?: string
phone?: string
dateOfBirth?: string
email?: string
aadhaarNumber?: string // Added Aadhaar number error type
addressLine1?: string
addressLine2?: string
city?: string
state?: string
zipCode?: string
country?: string
class?: string
schoolName?: string
board?: string
schoolAddressLine1?: string
schoolCity?: string
schoolState?: string
schoolZipCode?: string
schoolCountry?: string
medium?: string
subjects?: string // For subject selection validation
passportPhoto?: string
schoolId?: string
idChoice?: string // For the choice between UID/Aadhaar or School ID
submit?: string
}

const OlympiaXRegistrationForm = () => {
const router = useRouter()
const { toast } = useToast()

const [currentStep, setCurrentStep] = useState(1)
const totalSteps = 4
const progressPercentage = (currentStep / totalSteps) * 100

const [isVerified, setIsVerified] = useState(false)
const [isRegisteredForOlympiad, setIsRegisteredForOlympiad] = useState(false)
const [isLoadingVerification, setIsLoadingVerification] = useState(true)
const [discountApplied, setDiscountApplied] = useState(false) // Renamed to camelCase

const [formData, setFormData] = useState({
  // Step 1
  firstName: "",
  lastName: "",
  phone: "",
  dateOfBirth: "",
  email: "",
  aadhaarNumber: "", // Added Aadhaar number to form data
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  // Step 2
  class: "",
  schoolName: "",
  board: "",
  schoolAddressLine1: "",
  schoolCity: "",
  schoolState: "",
  schoolZipCode: "",
  schoolCountry: "",
  medium: "",
  // Step 4
  subjects: [] as string[],
})

const [uploadedFiles, setUploadedFiles] = useState<{
  passportPhoto: File | null
  schoolId: File | null
}>({
  passportPhoto: null,
  schoolId: null,
})

const [errors, setErrors] = useState<FormErrors>({})
const [razorpayLoaded, setRazorpayLoaded] = useState(false)
const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)

// Function to check user email verification status
const checkUserVerification = useCallback(async () => {
  setIsLoadingVerification(true)
  try {
    const response = await axios.get("https://schoozy.in/api/auth/verify", {
      withCredentials: true,
      timeout: 5000,
    })
    console.log("verify response:", response.data)
    if (response.data.message === "User is verified") {
      setIsVerified(true)
      setFormData((prev) => ({ ...prev, email: response.data.email || prev.email }))
      // If user is verified, check if they are already registered for the olympiad
      await checkOlympiadRegistrationStatus()
    } else {
      setIsVerified(false)
      toast({
        title: "Verification Required",
        description: "Please verify your email to proceed with registration.",
        variant: "destructive",
      })
      router.push("/login-account") // Redirect to login/account page
    }
  } catch (error) {
    console.error("Verification error:", error)
    setIsVerified(false)
    toast({
      title: "Verification Failed",
      description: "Could not verify your account. Please log in again.",
      variant: "destructive",
    })
    router.push("/login-account") // Redirect to login/account page
  } finally {
    setIsLoadingVerification(false)
  }
}, [router, toast]) // Added checkOlympiadRegistrationStatus to dependencies

// Function to check if user is already registered for the olympiad
const checkOlympiadRegistrationStatus = useCallback(async () => {
  try {
    const response = await axios.get("https://schoozy.in/api/auth/profile", {
      withCredentials: true,
      timeout: 5000,
    })
    console.log("Olympiad registration check response:", response.data)
    if (response.data.olympiad && response.data.olympiad.length > 0) {
      setIsRegisteredForOlympiad(true)
      toast({
        title: "Already Registered",
        description: "You have already registered for the Olympia-X exam.",
        variant: "default",
      })
    } else {
      setIsRegisteredForOlympiad(false)
    }
  } catch (error) {
    console.error("Olympiad registration status error:", error)
    // If profile fetch fails, assume not registered for olympiad for now
    setIsRegisteredForOlympiad(false)
  }
}, [toast])

useEffect(() => {
  checkUserVerification()
}, [checkUserVerification])

useEffect(() => {
  const script = document.createElement("script")
  script.src = "https://checkout.razorpay.com/v1/checkout.js"
  script.onload = () => {
    setRazorpayLoaded(true)
  }
  script.onerror = () => {
    console.error("Failed to load Razorpay SDK.")
    setErrors((prev) => ({ ...prev, submit: "Failed to load payment gateway. Please try again." }))
    toast({
      title: "Payment Error",
      description: "Failed to load payment gateway. Please try again.",
      variant: "destructive",
    })
  }
  document.body.appendChild(script)
  return () => {
    document.body.removeChild(script)
  }
}, [toast])

const stepTitles = [
  { title: "General Details", icon: User },
  { title: "Academic Details", icon: School },
  { title: "ID Verification", icon: FileText },
  { title: "Registration/Payment", icon: CreditCard },
]

const handleInputChange = (field: keyof typeof formData, value: any) => {
  setFormData((prev) => ({
    ...prev,
    [field]: value,
  }))
  // Clear the specific error for the field being changed
  setErrors((prev) => {
    const newErrors = { ...prev }
    if (newErrors[field as keyof FormErrors]) {
      delete newErrors[field as keyof FormErrors]
    }
    return newErrors
  })
}

const handleFileUpload = (field: "passportPhoto" | "schoolId", e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] || null
  const MAX_FILE_SIZE_BYTES = 200 * 1024 // 200 KB
  setUploadedFiles((prev) => ({ ...prev, [field]: null })) // Clear previous file
  setErrors((prev) => {
    const copy = { ...prev }
    if (field === "passportPhoto") delete copy.passportPhoto
    if (field === "schoolId") delete copy.schoolId
    return copy
  })

  if (file) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        [field]: `File size exceeds 200KB. Current size: ${(file.size / 1024).toFixed(2)} KB`,
      }))
      toast({
        title: "File Too Large",
        description: `The file "${file.name}" is too large. Maximum size is 200KB.`,
        variant: "destructive",
      })
      return
    }

    // Check for duplicate file names
    let duplicateFileNameError = ""
    if (field === "passportPhoto" && uploadedFiles.schoolId && uploadedFiles.schoolId.name === file.name) {
      duplicateFileNameError = "File name is already used by School ID Card."
    } else if (
      field === "schoolId" &&
      uploadedFiles.passportPhoto &&
      uploadedFiles.passportPhoto.name === file.name
    ) {
      duplicateFileNameError = "File name is already used by Passport Photo."
    }

    if (duplicateFileNameError) {
      setErrors((prev) => ({
        ...prev,
        [field]: duplicateFileNameError,
      }))
      toast({
        title: "Duplicate File Name",
        description: duplicateFileNameError,
        variant: "destructive",
      })
      return
    }
    setUploadedFiles((prev) => ({ ...prev, [field]: file }))
  }
}

const handleSubjectToggle = (subject: string) => {
  setFormData((prev) => ({
    ...prev,
    subjects: prev.subjects.includes(subject)
      ? prev.subjects.filter((s: string) => s !== subject)
      : [...prev.subjects, subject],
  }))
  setErrors((prev) => {
    const newErrors = { ...prev }
    delete newErrors.subjects
    return newErrors
  })
}

useEffect(() => {
  setDiscountApplied(formData.subjects.length >= 2) // Discount applies for 2 or more subjects
}, [formData.subjects])

const validateStep1 = useCallback(() => {
  const newErrors: FormErrors = {}
  if (!formData.firstName.trim()) newErrors.firstName = "First Name is required."
  if (!formData.phone.trim()) {
    newErrors.phone = "Phone/Mobile is required."
  } else if (!/^\d{10}$/.test(formData.phone)) {
    // Basic 10-digit check for Indian numbers
    newErrors.phone = "Please enter a valid 10-digit phone number."
  }
  if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required."
  if (!formData.email.trim()) {
    newErrors.email = "Email is required."
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = "Please enter a valid email address."
  }
  if (!formData.aadhaarNumber.trim()) {
    newErrors.aadhaarNumber = "Aadhaar Number is required."
  } else if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
    newErrors.aadhaarNumber = "Please enter a valid 12-digit Aadhaar number."
  }
  if (!formData.addressLine1.trim()) newErrors.addressLine1 = "Address Line 1 is required."
  if (!formData.city.trim()) newErrors.city = "City is required."
  if (!formData.state.trim()) newErrors.state = "State is required."
  if (!formData.zipCode.trim()) {
    newErrors.zipCode = "Zip Code is required."
  } else if (!/^\d{6}$/.test(formData.zipCode)) {
    // Basic 6-digit check for Indian zip codes
    newErrors.zipCode = "Please enter a valid 6-digit zip code."
  }
  if (!formData.country) newErrors.country = "Country is required."
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}, [formData])

const validateStep2 = useCallback(() => {
  const newErrors: FormErrors = {}
  if (!formData.class) newErrors.class = "Class is required."
  if (!formData.schoolName.trim()) newErrors.schoolName = "School Name is required."
  if (!formData.board) newErrors.board = "Board is required."
  if (!formData.schoolAddressLine1.trim()) newErrors.schoolAddressLine1 = "School Address Line 1 is required."
  if (!formData.schoolCity.trim()) newErrors.schoolCity = "School City is required."
  if (!formData.schoolState.trim()) newErrors.schoolState = "School State is required."
  if (!formData.schoolZipCode.trim()) {
    newErrors.schoolZipCode = "School Zip Code is required."
  } else if (!/^\d{6}$/.test(formData.schoolZipCode)) {
    newErrors.schoolZipCode = "Please enter a valid 6-digit zip code."
  }
  if (!formData.schoolCountry) newErrors.schoolCountry = "School Country is required."
  if (!formData.medium) newErrors.medium = "Medium is required."
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}, [formData])

const validateStep3 = useCallback(() => {
  const newErrors: FormErrors = {}
  // Check for passport photo presence and size error
  if (!uploadedFiles.passportPhoto) {
    newErrors.passportPhoto = "Passport photo is required."
  } else if (errors.passportPhoto) {
    newErrors.passportPhoto = errors.passportPhoto
  }
  // School ID is now required
  if (!uploadedFiles.schoolId) {
    newErrors.schoolId = "School ID Card is required."
  } else if (errors.schoolId) {
    newErrors.schoolId = errors.schoolId
  }
  setErrors(newErrors)
  // Return true only if there are no new errors AND no existing file size/duplicate errors
  return Object.keys(newErrors).length === 0 && !errors.passportPhoto && !errors.schoolId
}, [uploadedFiles, errors.passportPhoto, errors.schoolId])

const validateStep4 = useCallback(() => {
  const newErrors: FormErrors = {}
  if (formData.subjects.length === 0) {
    newErrors.subjects = "Please select at least one subject."
  }
  if (!formData.class) {
    // Ensure class is selected for amount calculation
    newErrors.class = "Please select your class to proceed."
  }
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}, [formData.subjects, formData.class])

const handleNextStep = () => {
  let isValid = false
  if (currentStep === 1) {
    isValid = validateStep1()
  } else if (currentStep === 2) {
    isValid = validateStep2()
  } else if (currentStep === 3) {
    isValid = validateStep3()
  }
  if (isValid) {
    setCurrentStep((s) => Math.min(totalSteps, s + 1))
  } else {
    toast({
      title: "Validation Error",
      description: "Please fill in all required fields and correct any errors.",
      variant: "destructive",
    })
  }
}

const prevStep = () => {
  setCurrentStep((s) => Math.max(1, s - 1))
}

const calculateTotalAmount = useCallback(() => {
  const subjectCount = formData.subjects.length
  if (subjectCount === 0) return 0

  const classNum = Number.parseInt(formData.class)
  let pricePerSubject = 0

  if (classNum >= 8 && classNum <= 10) {
    pricePerSubject = 350
  } else if (classNum >= 11 && classNum <= 12) {
    pricePerSubject = 500
  } else {
    return 0 // Class not in specified range or not selected
  }

  let total = subjectCount * pricePerSubject
  if (subjectCount >= 2) {
    total = total * 0.8 // Apply 20% discount for 2 or more subjects
  }
  return total
}, [formData.class, formData.subjects])

const handleSubmit = async () => {
  const fd = new FormData()
  fd.append("first_name", formData.firstName)
  fd.append("last_name", formData.lastName)
  fd.append("phone", formData.phone)
  fd.append("date_of_birth", formData.dateOfBirth)
  fd.append("email", formData.email)
  fd.append("address_line1", formData.addressLine1)
  fd.append("address_line2", formData.addressLine2)
  fd.append("city", formData.city)
  fd.append("state", formData.state)
  fd.append("zip_code", formData.zipCode)
  fd.append("country", formData.country)
  fd.append("aadhaar_number", formData.aadhaarNumber)
  fd.append("class", formData.class)
  fd.append("school_name", formData.schoolName)
  fd.append("board", formData.board)
  fd.append("school_address_line1", formData.schoolAddressLine1)
  fd.append("school_city", formData.schoolCity)
  fd.append("school_state", formData.schoolState)
  fd.append("school_zip_code", formData.schoolZipCode)
  fd.append("school_country", formData.schoolCountry)
  fd.append("medium", formData.medium)
  fd.append("subjects", (formData.subjects || []).join(","))

  if (uploadedFiles.passportPhoto) fd.append("passport_photo", uploadedFiles.passportPhoto)
  if (uploadedFiles.schoolId) fd.append("school_id", uploadedFiles.schoolId)

  // No razorpay_payment_id here
  fd.append("payment_status", "pending") // ✅ NEW: status flag

  try {
    const registerResp = await axios.post("https://schoozy.in/api/register", fd, {
      withCredentials: true,
    })
    return { success: true, data: registerResp.data }
  } catch (e: any) {
    console.error("Registration failed:", e)
    return { success: false, error: e }
  }
}

const handlePayment = async () => {
  const isValid = validateStep4()
  if (!isValid) {
    toast({
      title: "Validation Error",
      description: "Please select at least one subject and your class to proceed.",
      variant: "destructive",
    })
    return
  }



  setIsPaymentProcessing(true)
  // First, submit the form data to register the user (payment status pending)
  const registrationResponse = await handleSubmit()

  if (!registrationResponse?.success) {
    setIsPaymentProcessing(false)
    toast({ title: "Registration failed", description: "Could not register your details. Please try again.", variant: "destructive" })
    return
  }

  const totalAmount = calculateTotalAmount()
  if (totalAmount === 0) {
    setIsPaymentProcessing(false)
    toast({ title: "Payment Error", description: "Total amount is 0. Please select subjects and class.", variant: "destructive" })
    return
  }

  const user = registrationResponse.data // Assuming registrationResponse.data contains user info like email, name, phone, and _id (registration ID)

  try {
    // Create Razorpay order
    const orderResponse = await axios.post("https://schoozy.in/api/payment/razorpay", {
      amount: totalAmount, // Amount in paise
    }, { withCredentials: true })
    if (!orderResponse.data || !orderResponse.data.id) {
      throw new Error("Failed to create Razorpay order.")
    }

    const options = {
      key: "rzp_live_ngi2rcX5iuJttX", // Use environment variable here
      amount: orderResponse.data.amount, // Use amount from order response
      currency: "INR",
      name: "Olympia X 2025",
      description: "Registration Fee",
      order_id: orderResponse.data.id,
      prefill: {
        name: `${user.first_name || formData.firstName} ${user.last_name || formData.lastName}`,
        email: user.email || formData.email,
        contact: user.phone || formData.phone,
      },
      
  notes: {
    email: formData.email, // ✅ Webhook depends on this value
  },

      theme: { color: "#121e2c" },
      handler: async function (response: any) {
        // This function is called when payment is successful
        try {
          // Verify payment on your backend
          const verifyResponse = await axios.post("https://schoozy.in/api/payment/verify", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          }, { withCredentials: true })

          if (verifyResponse.data.success) {
            toast({
              title: "Payment Successful!",
              description: "Your registration for Olympia-X is complete. Redirecting to your profile...",
              variant: "default",
            })
            // Redirect after a short delay to allow toast to be seen
            setTimeout(() => {
              router.push("/profile") // Redirect to the user's profile page
            }, 2000)
          } else {
            toast({
              title: "Payment Verification Failed",
              description: "Payment was successful but could not be verified. Please contact support.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error verifying payment:", error)
          toast({
            title: "Payment Verification Error",
            description: "An error occurred during payment verification. Please contact support.",
            variant: "destructive",
          })
        } finally {
          setIsPaymentProcessing(false)
        }
      },
      modal: {
        ondismiss: function() {
          // This function is called when the Razorpay modal is closed without completing payment
          setIsPaymentProcessing(false)
          toast({
            title: "Payment Cancelled",
            description: "You closed the payment window. Please try again to complete registration.",
            variant: "default",
          })
        }
      }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  } catch (error) {
    console.error("Error creating Razorpay order or during payment:", error)
    toast({
      title: "Payment Error",
      description: "Failed to initiate payment. Please try again.",
      variant: "destructive",
    })
    setIsPaymentProcessing(false)
  }
}


const renderStep1 = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">General Details</h2>
      <p className="text-gray-600">Please provide your personal and contact information.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">
          {" "}
          First Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="firstName"
          placeholder="Enter Your First Name"
          value={formData.firstName}
          onChange={(e) => handleInputChange("firstName", e.target.value)}
        />
        {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          placeholder="Enter Your Last Name"
          value={formData.lastName}
          onChange={(e) => handleInputChange("lastName", e.target.value)}
        />
        {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="phone">
        {" "}
        Phone/Mobile <span className="text-red-500">*</span>
      </Label>
      <div className="flex">
        <div className="flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
          <span className="text-orange-500">🇮🇳</span>
        </div>
        <Input
          id="phone"
          type="tel"
          placeholder="Mobile Number (e.g., 9876543210)"
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          className="rounded-l-none"
        />
      </div>
      {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
    </div>
    <div className="space-y-2">
      <Label htmlFor="dateOfBirth">
        {" "}
        Date Of Birth <span className="text-red-500">*</span>
      </Label>
      <Input
        id="dateOfBirth"
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
      />
      {errors.dateOfBirth && <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth}</p>}
    </div>
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
      />
      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
    </div>
    <div className="space-y-2">
      <Label htmlFor="aadhaarNumber">
        {" "}
        Aadhaar Number <span className="text-red-500">*</span>
      </Label>
      <Input
        id="aadhaarNumber"
        type="text"
        placeholder="Enter your 12-digit Aadhaar number"
        value={formData.aadhaarNumber}
        onChange={(e) => handleInputChange("aadhaarNumber", e.target.value)}
        maxLength={12}
      />
      {errors.aadhaarNumber && <p className="text-sm text-red-500 mt-1">{errors.aadhaarNumber}</p>}
    </div>
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Permanent Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="addressLine1">
            {" "}
            Address Line 1 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="addressLine1"
            placeholder="Address Line 1"
            value={formData.addressLine1}
            onChange={(e) => handleInputChange("addressLine1", e.target.value)}
          />
          {errors.addressLine1 && <p className="text-sm text-red-500 mt-1">{errors.addressLine1}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="addressLine2">Address Line 2</Label>
          <Input
            id="addressLine2"
            placeholder="Address Line 2"
            value={formData.addressLine2}
            onChange={(e) => handleInputChange("addressLine2", e.target.value)}
          />
          {errors.addressLine2 && <p className="text-sm text-red-500 mt-1">{errors.addressLine2}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">
            {" "}
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            placeholder="City"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
          />
          {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">
            {" "}
            State <span className="text-red-500">*</span>
          </Label>
          <Input
            id="state"
            placeholder="State"
            value={formData.state}
            onChange={(e) => handleInputChange("state", e.target.value)}
          />
          {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zipCode">
            {" "}
            Zip Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="zipCode"
            placeholder="Zip (e.g., 123456)"
            value={formData.zipCode}
            onChange={(e) => handleInputChange("zipCode", e.target.value)}
          />
          {errors.zipCode && <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">
            {" "}
            Country <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.country} onValueChange={(v) => handleInputChange("country", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN">India</SelectItem>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
          {errors.country && <p className="text-sm text-red-500 mt-1">{errors.country}</p>}
        </div>
      </div>
    </div>
  </div>
)

const renderStep2 = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Academic Details</h2>
      <p className="text-gray-600">Please provide your current academic information.</p>
    </div>
    <div className="space-y-2">
      <Label htmlFor="class">
        {" "}
        Select Class <span className="text-red-500">*</span>
      </Label>
      <Select value={formData.class} onValueChange={(v) => handleInputChange("class", v)}>
        <SelectTrigger>
          <SelectValue placeholder="-- Select Class--" />
        </SelectTrigger>
        <SelectContent>
          {["8", "9", "10", "11", "12"].map((c) => (
            <SelectItem key={c} value={c}>
              {" "}
              Class {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.class && <p className="text-sm text-red-500 mt-1">{errors.class}</p>}
    </div>
    <div className="space-y-2">
      <Label htmlFor="schoolName">
        {" "}
        School Name <span className="text-red-500">*</span>
      </Label>
      <Input
        id="schoolName"
        placeholder="Enter School Name"
        value={formData.schoolName}
        onChange={(e) => handleInputChange("schoolName", e.target.value)}
      />
      {errors.schoolName && <p className="text-sm text-red-500 mt-1">{errors.schoolName}</p>}
    </div>
    <div className="space-y-2">
      <Label htmlFor="board">
        {" "}
        Select Board <span className="text-red-500">*</span>
      </Label>
      <Select value={formData.board} onValueChange={(v) => handleInputChange("board", v)}>
        <SelectTrigger>
          <SelectValue placeholder="-- Select Board--" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CBSE">CBSE</SelectItem>
          <SelectItem value="ICSE">ICSE</SelectItem>
          <SelectItem value="State Board">State Board</SelectItem>
          <SelectItem value="IB">International Baccalaureate</SelectItem>
        </SelectContent>
      </Select>
      {errors.board && <p className="text-sm text-red-500 mt-1">{errors.board}</p>}
    </div>
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">School Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="schoolAddressLine1">
            {" "}
            Address Line 1 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="schoolAddressLine1"
            placeholder="Address Line 1"
            value={formData.schoolAddressLine1}
            onChange={(e) => handleInputChange("schoolAddressLine1", e.target.value)}
          />
          {errors.schoolAddressLine1 && <p className="text-sm text-red-500 mt-1">{errors.schoolAddressLine1}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="schoolCity">
            {" "}
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="schoolCity"
            placeholder="City"
            value={formData.schoolCity}
            onChange={(e) => handleInputChange("schoolCity", e.target.value)}
          />
          {errors.schoolCity && <p className="text-sm text-red-500 mt-1">{errors.schoolCity}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="schoolState">
            {" "}
            State <span className="text-red-500">*</span>
          </Label>
          <Input
            id="schoolState"
            placeholder="State"
            value={formData.schoolState}
            onChange={(e) => handleInputChange("schoolState", e.target.value)}
          />
          {errors.schoolState && <p className="text-sm text-red-500 mt-1">{errors.schoolState}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="schoolZipCode">
            {" "}
            Zip Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="schoolZipCode"
            placeholder="Zip (e.g., 123456)"
            value={formData.schoolZipCode}
            onChange={(e) => handleInputChange("schoolZipCode", e.target.value)}
          />
          {errors.schoolZipCode && <p className="text-sm text-red-500 mt-1">{errors.schoolZipCode}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="schoolCountry">
          {" "}
          Country <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.schoolCountry} onValueChange={(v) => handleInputChange("schoolCountry", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IN">India</SelectItem>
            <SelectItem value="US">United States</SelectItem>
            <SelectItem value="UK">United Kingdom</SelectItem>
          </SelectContent>
        </Select>
        {errors.schoolCountry && <p className="text-sm text-red-500 mt-1">{errors.schoolCountry}</p>}
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="medium">
        {" "}
        Medium <span className="text-red-500">*</span>
      </Label>
      <Select value={formData.medium} onValueChange={(v) => handleInputChange("medium", v)}>
        <SelectTrigger>
          <SelectValue placeholder="-- Select Medium --" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="English">English</SelectItem>
          <SelectItem value="Hindi">Hindi</SelectItem>
          <SelectItem value="Regional Language">Regional Language</SelectItem>
        </SelectContent>
      </Select>
      {errors.medium && <p className="text-sm text-red-500 mt-1">{errors.medium}</p>}
    </div>
  </div>
)

const renderStep3 = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">ID Verification</h2>
      <p className="text-gray-600">Please upload required identification documents (max 200KB per file).</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {" "}
      {/* Changed from md:grid-cols-3 */}
      {/* Passport Photo */}
      <Card className="p-4 border-dashed border-2 border-gray-300 hover:border-blue-500 transition-colors">
        <Label htmlFor="passportPhoto" className="cursor-pointer block h-full w-full">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">
              {" "}
              Passport Photo <span className="text-red-500">*</span>
            </span>
            <Input
              id="passportPhoto"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload("passportPhoto", e)}
            />
            {uploadedFiles.passportPhoto && (
              <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
                <Check className="w-4 h-4 mr-1" /> {uploadedFiles.passportPhoto.name}
              </p>
            )}
          </div>
        </Label>
        {errors.passportPhoto && <p className="text-sm text-red-500 mt-1">{errors.passportPhoto}</p>}
      </Card>
      {/* School ID */}
      <Card className="p-4 border-dashed border-2 border-gray-300 hover:border-blue-500 transition-colors">
        <Label htmlFor="schoolId" className="cursor-pointer block h-full w-full">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">
              School ID Card <span className="text-red-500">*</span> {/* Now required */}
            </span>
            <Input
              id="schoolId"
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => handleFileUpload("schoolId", e)}
            />
            {uploadedFiles.schoolId && (
              <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
                <Check className="w-4 h-4 mr-1" /> {uploadedFiles.schoolId.name}
              </p>
            )}
          </div>
        </Label>
        {errors.schoolId && <p className="text-sm text-red-500 mt-1">{errors.schoolId}</p>}
      </Card>
    </div>
  </div>
)

const renderStep4 = () => {
  const totalAmount = calculateTotalAmount()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Olympia-X Registration/Payment</h2>
        <p className="text-gray-600">Select your subjects and proceed to payment.</p>
      </div>
      <div className="space-y-4">
        <Label>
          {" "}
          Select Subjects <span className="text-red-500">*</span>
        </Label>
        <div className="space-y-3">
          {["Physics", "Maths", "Chemistry", "Biology"].map((subject) => (
            <div key={subject} className="flex items-center space-x-2">
              <Checkbox
                id={subject}
                checked={formData.subjects.includes(subject)}
                onCheckedChange={() => handleSubjectToggle(subject)}
              />
              <Label htmlFor={subject} className="text-sm font-normal">
                {subject}
              </Label>
            </div>
          ))}
        </div>
        {errors.subjects && <p className="text-sm text-red-500 mt-1">{errors.subjects}</p>}
      </div>
      {totalAmount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <p className="text-blue-800 text-lg font-semibold">Total Amount: ₹{totalAmount}</p>
          {discountApplied && totalAmount > 0 && ( // Only show discount if applied AND total amount is greater than 0
            <div>
              <span className="text-green-600 font-medium">20% Discount Applied!</span>
            </div>
          )}
        </div>
      )}
      {totalAmount === 0 && formData.subjects.length > 0 && formData.class && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">Please select a class to calculate the total amount.</p>
        </div>
      )}
      {totalAmount === 0 && formData.subjects.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">Please select subjects to calculate the total amount.</p>
        </div>
      )}
      {errors.class && currentStep === 4 && <p className="text-sm text-red-500 mt-1">{errors.class}</p>}
    </div>
  )
}

if (isLoadingVerification) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <p className="text-lg text-gray-700">Loading verification status...</p>
    </div>
  )
}

if (!isVerified) {
  // This block should ideally not be reached if router.push works immediately,
  // but as a fallback or for visual feedback before redirect.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 text-center p-4">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Account Not Verified</h2>
      <p className="text-gray-700 mb-6">Please verify your email to proceed with the registration.</p>
      <Button onClick={() => router.push("/login-account")}>Go to Login/Account</Button>
    </div>
  )
}

if (isRegisteredForOlympiad) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 text-center p-4">
      <Check className="w-20 h-20 text-green-500 mb-6" />
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Already Registered!</h2>
      <p className="text-gray-700 mb-6">You have successfully registered for the Olympia-X exam.</p>
      <Button onClick={() => router.push("/")}>Go to Home</Button>
    </div>
  )
}

return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {stepTitles.map((step, index) => {
            const StepIcon = step.icon
            const stepNumber = index + 1
            const isActive = stepNumber === currentStep
            const isCompleted = stepNumber < currentStep
            return (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : isActive
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                {index < stepTitles.length - 1 && (
                  <div
                    className={`w-16 h-0.5 ml-2 ${stepNumber < currentStep ? "bg-green-500" : "bg-gray-300"}`}
                  />
                )}
              </div>
            )
          })}
        </div>
        <div className="text-center mb-4">
          <span className="text-sm text-gray-600">
            {" "}
            Step {currentStep} of {totalSteps} - {stepTitles[currentStep - 1].title}
          </span>
        </div>
        <Progress value={progressPercentage} className="w-full h-2" />
      </div>
      {/* Form Card */}
      <Card className="shadow-xl border-0">
        <CardContent className="p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {errors.submit && <p className="text-sm text-red-600 mt-2 text-center">{errors.submit}</p>}
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isPaymentProcessing}
              className="flex items-center space-x-2 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNextStep} // Now calls the validation wrapper
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                disabled={isPaymentProcessing}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handlePayment} // Calls handlePayment, which initiates Razorpay and then calls handleSubmit
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={!razorpayLoaded || calculateTotalAmount() === 0 || isPaymentProcessing}
              >
                {isPaymentProcessing ? "Processing..." : "Pay & Submit Form"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)
}

export default OlympiaXRegistrationForm

