"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Webcam from "react-webcam"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Student } from "@/types/exam"
import axios from "axios"

interface StudentInfoFormProps {
  onSubmit: (student: Student) => void
  onBack: () => void
  onStatusChange: (status: string) => void
}

export function StudentInfoForm({ onSubmit, onBack, onStatusChange }: StudentInfoFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    exam_id: "",
  })
  const [cameraStatus, setCameraStatus] = useState<"checking" | "enabled" | "disabled">("checking")
  const [timeRemaining, setTimeRemaining] = useState("03:00:00")
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const webcamRef = useRef<Webcam>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const [hours, minutes, seconds] = prev.split(":").map(Number)
        const totalSeconds = hours * 3600 + minutes * 60 + seconds
        if (totalSeconds <= 1) {
          clearInterval(timer)
          return "00:00:00"
        }
        const newTotal = totalSeconds - 1
        const newHours = Math.floor(newTotal / 3600)
        const newMinutes = Math.floor((newTotal % 3600) / 60)
        const newSeconds = newTotal % 60
        return `${newHours.toString().padStart(2, "0")}:${newMinutes
          .toString()
          .padStart(2, "0")}:${newSeconds.toString().padStart(2, "0")}`
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const handleUserMedia = useCallback(() => {
    setCameraStatus("enabled")
  }, [])

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error("Camera access denied:", error)
    setCameraStatus("disabled")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setIsSubmitting(true)

    const newErrors: string[] = []
    if (!formData.email.trim()) {
      newErrors.push("Email ID is required")
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push("Please enter a valid email address")
    }
    if (!formData.exam_id.trim()) {
      newErrors.push("Exam ID is required")
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const response = await axios.post("https://schoozy.in/api/exam/verify-id", {
        email: formData.email,
        exam_id: formData.exam_id,
      })

      if (response.status === 200) {
        console.log(response.data)

        if (response.data.message === "Exam is already Suspended") {
          onStatusChange("Suspended")
        }

        if (response.data.message === "Exam is already Completed") {
          onStatusChange("Completed")
        }

        const student: Student = {
          name: "Student",
          email: formData.email,
          examId: formData.exam_id,
          cameraStatus: cameraStatus,
        }
        onSubmit(student)
      } else {
        setErrors([response.data?.message || "Invalid student credentials."])
      }
    } catch (error: any) {
      console.error("Verification failed:", error)
      setErrors([
        error.response?.data?.message || "Failed to verify student information. Please try again.",
      ])
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCameraStatusText = () => {
    switch (cameraStatus) {
      case "checking":
        return "Checking Camera..."
      case "enabled":
        return "Camera Active"
      case "disabled":
        return "Camera Inactive"
    }
  }

  const getCameraStatusColor = () => {
    switch (cameraStatus) {
      case "checking":
        return "text-yellow-600"
      case "enabled":
        return "text-green-600"
      case "disabled":
        return "text-red-600"
    }
  }

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-6xl w-full flex gap-8 flex-col md:flex-row">
        <div className="flex-[2] space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Exam Hall Mode</h2>
            <p className="text-slate-600 text-sm">
              Camera monitoring is essential to prevent cheating. Please ensure your camera is on and functioning
              correctly.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-700 mb-3">Exam Instructions</h3>
            <ul className="space-y-2 text-sm text-slate-600 list-disc ml-5">
              <li>The total duration of the exam is 180 minutes.</li>
              <li>The clock will display the remaining time in the top right corner of the screen.</li>
              <li>Answering all questions is mandatory.</li>
              <li>Any suspicious activity will result in a warning.</li>
              <li>Do not refresh the browser or navigate away from the exam page.</li>
              <li>Ensure stable internet connection throughout the exam.</li>
            </ul>
          </div>

          <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center overflow-hidden">
            {cameraStatus === "enabled" || cameraStatus === "checking" ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
                className="w-full h-full object-cover rounded-lg"
                mirrored={true}
              />
            ) : (
              <div className="text-gray-500 text-center">
                <div className="text-4xl mb-2">📷</div>
                <div className="text-sm">Camera Preview</div>
                <div className="text-xs mt-1">Please allow camera access</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-gray-50 rounded-xl p-6">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl text-slate-800">Student Information</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              {errors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {errors.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email ID:
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your Email ID"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="examId" className="text-sm font-medium text-slate-700">
                    Exam ID:
                  </Label>
                  <Input
                    id="examId"
                    type="text"
                    placeholder="Enter your Exam ID"
                    value={formData.exam_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, exam_id: e.target.value }))}
                    className="mt-1"
                    required
                  />
                </div>

               

                <div>
                  <p className="text-sm text-slate-600 mb-1">Monitoring Status:</p>
                  <p className={`font-medium ${getCameraStatusColor()}`}>{getCameraStatusText()}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || cameraStatus === "disabled"}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isSubmitting ? "Verifying..." : "Start Exam"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
