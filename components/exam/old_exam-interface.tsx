"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import * as cocoSsd from "@tensorflow-models/coco-ssd"
import "@tensorflow/tfjs" // must import this once
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ExamState, ExamConfig, Question, ExamStats } from "@/types/exam"
import axios from "axios"
import Webcam from "react-webcam"

interface ExamInterfaceProps {
  examState: ExamState
  config: ExamConfig
  onUpdateState: (updates: Partial<ExamState>) => void
}

interface ApiQuestion {
  question_id: number
  question_text: string
  question_media: string | null
  option_a_text: string
  option_a_media: string | null
  option_b_text: string
  option_b_media: string | null
  option_c_text: string
  option_c_media: string | null
  option_d_text: string
  option_d_media: string | null
  correct_option: string
  marks: number
  class: number
  subject: string
}

interface ApiResponse {
  success: boolean
  question: ApiQuestion
  total_questions: number
}

interface CheatingViolation {
  type: "face_not_detected" | "multiple_faces" | "tab_switch" | "fullscreen_exit" | "suspicious_movement"
  timestamp: number
  severity: "low" | "medium" | "high"
  description: string
}

interface FaceDetectionResult {
  faces: number
  confidence: number
  detectionQuality: "high" | "medium" | "low"
  frameAnalysis: {
    skinPixels: number
    faceRegions: number
    movementDetected: boolean
  }
}

interface WarningCounts {
  multipleFaces: number
  tabSwitch: number
  total: number
}

export function ExamInterface({ examState, config, onUpdateState }: ExamInterfaceProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState("english")
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [currentApiQuestion, setCurrentApiQuestion] = useState<ApiQuestion | null>(null)
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalQuestions, setTotalQuestions] = useState(30)
  const webcamRef = useRef<Webcam>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)

  // Proctoring states
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [violations, setViolations] = useState<CheatingViolation[]>([])
  const [currentViolation, setCurrentViolation] = useState<CheatingViolation | null>(null)
  const [faceDetectionResult, setFaceDetectionResult] = useState<FaceDetectionResult>({
    faces: 0,
    confidence: 0,
    detectionQuality: "low",
    frameAnalysis: {
      skinPixels: 0,
      faceRegions: 0,
      movementDetected: false,
    },
  })
  const [isTabActive, setIsTabActive] = useState(true)
  const [warningCounts, setWarningCounts] = useState<WarningCounts>({
    multipleFaces: 0,
    tabSwitch: 0,
    total: 0
  })
  const [showSuspendPopup, setShowSuspendPopup] = useState(false)
  const [isExamSuspended, setIsExamSuspended] = useState(false)

  // Face detection refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastFaceDetectionRef = useRef<number>(Date.now())
  const detectionHistoryRef = useRef<number[]>([])
  const previousFrameRef = useRef<ImageData | null>(null)
  const stableDetectionRef = useRef<{ count: number; faces: number }>({ count: 0, faces: 0 })
  const detectionBufferRef = useRef<number[]>([])
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null)

  // Detection parameters
  const DETECTION_BUFFER_SIZE = 8
  const CONFIDENCE_THRESHOLD = 0.75
  const STABLE_DETECTION_REQUIRED = 5

  const triggerWarning = useCallback((type: "multiple_faces" | "tab_switch", description: string) => {
    setWarningCounts(prev => {
      const newCounts = {
        ...prev,
        [type === "multiple_faces" ? "multipleFaces" : "tabSwitch"]: prev[type === "multiple_faces" ? "multipleFaces" : "tabSwitch"] + 1,
        total: prev.total + 1
      }

      if (type === "multiple_faces" && newCounts.multipleFaces >= 3) {
        setShowSuspendPopup(true)
        return newCounts
      }
      
      if (type === "tab_switch" && newCounts.tabSwitch >= 3) {
        setShowSuspendPopup(true)
        return newCounts
      }

      addViolation({
        type: type === "multiple_faces" ? "multiple_faces" : "tab_switch",
        timestamp: Date.now(),
        severity: "high",
        description: `${description} (Warning ${newCounts[type === "multiple_faces" ? "multipleFaces" : "tabSwitch"]}/3)`
      })

      return newCounts
    })
  }, [])

  const suspendExam = useCallback(() => {
    setIsExamSuspended(true)
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
    }
    console.log("🚨 EXAM SUSPENDED: Multiple violations detected")
  }, [])

  const handleSuspendConfirm = useCallback(() => {
    setShowSuspendPopup(false)
    suspendExam()
    exitFullScreen()
  }, [suspendExam])

  // Face detection implementation
  const detectFaces = useCallback(async () => {
    if (!webcamRef.current || !canvasRef.current || !isCameraReady || !modelRef.current || isExamSuspended) {
      return
    }

    try {
      const video = webcamRef.current.video
      if (!video || video.readyState !== 4) return

      const predictions = await modelRef.current.detect(video)
      let personCount = 0
      let totalConfidence = 0

      predictions.forEach((prediction) => {
        if (prediction.class === "person" && prediction.score > CONFIDENCE_THRESHOLD) {
          personCount++
          totalConfidence += prediction.score
        }
      })

      const avgConfidence = personCount > 0 ? totalConfidence / personCount : 0

      // Update detection buffer
      detectionBufferRef.current.push(personCount)
      if (detectionBufferRef.current.length > DETECTION_BUFFER_SIZE) {
        detectionBufferRef.current.shift()
      }

      // Calculate stable detection
      if (detectionBufferRef.current.length >= DETECTION_BUFFER_SIZE) {
        const avgFaces = detectionBufferRef.current.reduce((a, b) => a + b, 0) / detectionBufferRef.current.length
        const roundedFaces = Math.round(avgFaces)

        setFaceDetectionResult({
          faces: roundedFaces,
          confidence: avgConfidence,
          detectionQuality: avgConfidence > 0.8 ? "high" : avgConfidence > 0.6 ? "medium" : "low",
          frameAnalysis: {
            skinPixels: 0, // Simplified implementation
            faceRegions: roundedFaces,
            movementDetected: false
          }
        })

        // Trigger warnings based on stable detection
        if (roundedFaces === 0) {
          addViolation({
            type: "face_not_detected",
            timestamp: Date.now(),
            severity: "medium",
            description: "No person detected in camera feed"
          })
        } else if (roundedFaces > 1) {
          triggerWarning("multiple_faces", `${roundedFaces} people detected in camera`)
        }
      }

      lastFaceDetectionRef.current = Date.now()
    } catch (error) {
      console.error("Face detection error:", error)
    }
  }, [isCameraReady, isExamSuspended, triggerWarning])

  const addViolation = useCallback((violation: CheatingViolation) => {
    setViolations((prev) => [...prev, violation])
    setCurrentViolation(violation)

    setTimeout(() => {
      setCurrentViolation(null)
    }, 5000)

    logViolationToServer(violation)
  }, [])

  const logViolationToServer = async (violation: CheatingViolation) => {
    try {
      await axios.post("https://schoozy.in/api/exam/log-violation", {
        violation_type: violation.type,
        timestamp: violation.timestamp,
        severity: violation.severity,
        description: violation.description
      })
    } catch (error) {
      console.error("Failed to log violation:", error)
    }
  }

  const enterFullScreen = useCallback(() => {
    const element = document.documentElement
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if ((element as any).webkitRequestFullscreen) {
      ;(element as any).webkitRequestFullscreen()
    } else if ((element as any).msRequestFullscreen) {
      ;(element as any).msRequestFullscreen()
    }
  }, [])

  const exitFullScreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      ;(document as any).webkitExitFullscreen()
    } else if ((document as any).msExitFullscreen) {
      ;(document as any).msExitFullscreen()
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isExamSuspended) return
      
      const forbiddenKeys = [
        "F12", "F11", "Tab", "Escape",
      ]

      if (
        forbiddenKeys.includes(e.key) ||
        (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "a" || e.key === "t" || e.key === "w")) ||
        (e.altKey && e.key === "Tab") ||
        (e.ctrlKey && e.shiftKey && e.key === "I")
      ) {
        e.preventDefault()
        addViolation({
          type: "suspicious_movement",
          timestamp: Date.now(),
          severity: "medium",
          description: `Attempted to use forbidden key: ${e.key}`,
        })
      }
    },
    [addViolation, isExamSuspended],
  )

  const handleVisibilityChange = useCallback(() => {
    if (isExamSuspended) return
    
    const isVisible = !document.hidden
    setIsTabActive(isVisible)

    if (!isVisible) {
      triggerWarning("tab_switch", "Student switched away from exam tab")
    }
  }, [triggerWarning, isExamSuspended])

  const handleFullScreenChange = useCallback(() => {
    const isCurrentlyFullScreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement
    )

    setIsFullScreen(isCurrentlyFullScreen)

    if (!isCurrentlyFullScreen && examState.currentQuestion > 0 && !isExamSuspended) {
      addViolation({
        type: "fullscreen_exit",
        timestamp: Date.now(),
        severity: "high",
        description: "Student exited fullscreen mode",
      })
    }
  }, [addViolation, examState.currentQuestion, isExamSuspended])

  // Load TensorFlow model
  const loadModel = useCallback(async () => {
    try {
      console.log("Loading COCO-SSD model...")
      const model = await cocoSsd.load()
      modelRef.current = model
      console.log("Model loaded successfully")
    } catch (error) {
      console.error("Failed to load model:", error)
    }
  }, [])

  const getQuestion = async (questionNumber: number) => {
    setLoadingQuestion(true)
    setError(null)
    try {
      const response = await axios.get("https://schoozy.in/api/exam/get-question", {
        withCredentials: true,
        params: {
          question_number: questionNumber,
        },
      })

      if (response.data && response.data.success) {
        const apiData: ApiResponse = response.data
        setCurrentApiQuestion(apiData.question)

        if (apiData.total_questions) {
          setTotalQuestions(apiData.total_questions)
        }

        return apiData.question
      } else {
        throw new Error(response.data?.message || "Failed to fetch question")
      }
    } catch (error) {
      console.error("Failed to fetch question:", error)
      setError("Failed to load question. Please try again.")
      return null
    } finally {
      setLoadingQuestion(false)
    }
  }

  const initializeQuestionsArray = () => {
    return Array.from({ length: totalQuestions }, (_, i) => ({
      id: i + 1,
      text: "",
      options: [],
      selectedAnswer: undefined,
      isMarkedForReview: false,
      isAnswered: false,
    }))
  }

  const getQuestionOptions = (apiQuestion: ApiQuestion): string[] => {
    return [
      apiQuestion.option_a_text,
      apiQuestion.option_b_text,
      apiQuestion.option_c_text,
      apiQuestion.option_d_text,
    ].filter(Boolean)
  }

  const handleCameraReady = () => {
    setIsCameraReady(true)
  }

  const handleCameraError = () => {
    setIsCameraReady(false)
  }

  useEffect(() => {
    const initializeExam = async () => {
      setIsLoading(true)

      // Load AI model
      await loadModel()

      // Force fullscreen mode
      await enterFullScreen()

      // Setup event listeners
      document.addEventListener("keydown", handleKeyDown)
      document.addEventListener("visibilitychange", handleVisibilityChange)
      document.addEventListener("fullscreenchange", handleFullScreenChange)
      document.addEventListener("webkitfullscreenchange", handleFullScreenChange)
      document.addEventListener("msfullscreenchange", handleFullScreenChange)

      // Start face detection after model loads
      setTimeout(() => {
        detectionIntervalRef.current = setInterval(detectFaces, 2000)
      }, 3000)

      const firstQuestion = await getQuestion(1)
      const initialQuestions = initializeQuestionsArray()
      onUpdateState({ questions: initialQuestions })

      setIsLoading(false)
    }

    initializeExam()

    const timer = setInterval(() => {
      if (!isExamSuspended) {
        onUpdateState({
          timeRemaining: Math.max(0, examState.timeRemaining - 1),
        })
      }
    }, 1000)

    return () => {
      clearInterval(timer)
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("fullscreenchange", handleFullScreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullScreenChange)
      document.removeEventListener("msfullscreenchange", handleFullScreenChange)
    }
  }, [])

  useEffect(() => {
    if (examState.currentQuestion && examState.questions.length > 0 && !isExamSuspended) {
      getQuestion(examState.currentQuestion)
    }
  }, [examState.currentQuestion, isExamSuspended])

  useEffect(() => {
    const currentQuestion = examState.questions[examState.currentQuestion - 1]
    if (currentQuestion) {
      setSelectedAnswer(currentQuestion.selectedAnswer ?? null)
    }
  }, [examState.currentQuestion, examState.questions])

  useEffect(() => {
    if (examState.timeRemaining <= 0 && !examState.isSubmitted) {
      handleSubmitExam()
    }
  }, [examState.timeRemaining])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getCurrentQuestion = () => {
    return examState.questions[examState.currentQuestion - 1]
  }

  const getQuestionStatus = (question: Question) => {
    if (question.isAnswered && question.isMarkedForReview) return "answered-marked"
    if (question.isAnswered) return "answered"
    if (question.isMarkedForReview) return "marked"
    return "not-answered"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered":
        return "bg-green-500 text-white"
      case "marked":
        return "bg-blue-500 text-white"
      case "answered-marked":
        return "bg-purple-500 text-white"
      default:
        return "bg-red-500 text-white"
    }
  }

  const updateQuestion = (questionIndex: number, updates: Partial<Question>) => {
    const updatedQuestions = [...examState.questions]
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], ...updates }
    onUpdateState({ questions: updatedQuestions })
  }

  const handleAnswerSelect = (optionIndex: number) => {
    if (isExamSuspended) return
    setSelectedAnswer(optionIndex)
  }

  const saveResponse = async () => {
    if (!currentApiQuestion || isExamSuspended) return

    try {
      const response = await axios.post("https://schoozy.in/api/exam/submit-answer", {
        question_number: examState.currentQuestion,
        question_id: currentApiQuestion.question_id,
        answer: selectedAnswer !== null ? String.fromCharCode(65 + selectedAnswer) : "",
        time_taken: 34,
      })
      console.log("Response saved:", response.data)
    } catch (error) {
      console.error("Failed to save response:", error)
    }
  }

  const handleSaveAndNext = async () => {
    if (isExamSuspended) return
    await saveResponse()

    const currentIndex = examState.currentQuestion - 1
    updateQuestion(currentIndex, {
      selectedAnswer,
      isAnswered: selectedAnswer !== null,
    })

    if (examState.currentQuestion < totalQuestions) {
      onUpdateState({ currentQuestion: examState.currentQuestion + 1 })
    }
  }

  const handleMarkForReviewAndNext = async () => {
    if (isExamSuspended) return
    await saveResponse()

    const currentIndex = examState.currentQuestion - 1
    updateQuestion(currentIndex, {
      selectedAnswer,
      isAnswered: selectedAnswer !== null,
      isMarkedForReview: true,
    })

    if (examState.currentQuestion < totalQuestions) {
      onUpdateState({ currentQuestion: examState.currentQuestion + 1 })
    }
  }

  const handleClearResponse = () => {
    if (isExamSuspended) return
    setSelectedAnswer(null)
    const currentIndex = examState.currentQuestion - 1
    updateQuestion(currentIndex, {
      selectedAnswer: undefined,
      isAnswered: false,
    })
  }

  const handlePrevious = () => {
    if (isExamSuspended) return
    if (examState.currentQuestion > 1) {
      onUpdateState({ currentQuestion: examState.currentQuestion - 1 })
    }
  }

  const handleNext = () => {
    if (isExamSuspended) return
    if (examState.currentQuestion < totalQuestions) {
      onUpdateState({ currentQuestion: examState.currentQuestion + 1 })
    }
  }

  const handleQuestionJump = (questionNumber: number) => {
    if (isExamSuspended) return
    onUpdateState({ currentQuestion: questionNumber })
  }

  const handleSubmitExam = () => {
    onUpdateState({ isSubmitted: true })
    setShowSubmitConfirm(false)
    exitFullScreen()
    alert("Exam submitted successfully!")
  }

  const getExamStats = (): ExamStats => {
    const answered = examState.questions.filter((q) => q.isAnswered && !q.isMarkedForReview).length
    const markedForReview = examState.questions.filter((q) => q.isMarkedForReview && !q.isAnswered).length
    const answeredAndMarkedForReview = examState.questions.filter((q) => q.isAnswered && q.isMarkedForReview).length
    const notAnswered = examState.questions.length - answered - markedForReview - answeredAndMarkedForReview

    return {
      answered,
      notAnswered,
      markedForReview,
      answeredAndMarkedForReview,
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing secure exam environment...</p>
          <p className="text-sm text-gray-500 mt-2">Loading AI proctoring system...</p>
        </div>
      </div>
    )
  }

  if (isExamSuspended) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Exam Suspended</h1>
          <p className="text-red-700 mb-6">
            Your exam has been suspended due to multiple security violations. Please contact your exam administrator.
          </p>
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">Violation Summary:</h3>
            <div className="text-sm text-red-700 space-y-1">
              <p>Multiple faces detected: {warningCounts.multipleFaces}/3 warnings</p>
              <p>Tab switches: {warningCounts.tabSwitch}/3 warnings</p>
              <p>Total violations: {warningCounts.total}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = getCurrentQuestion()
  const stats = getExamStats()

  return (
    <div className="min-h-screen bg-gray-100">
      {currentViolation && (
        <Alert className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            <strong>Security Alert:</strong> {currentViolation.description}
          </AlertDescription>
        </Alert>
      )}

      {showSuspendPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-red-600 mb-4">EXAM SUSPENSION</h3>
            <p className="text-gray-700 mb-6 text-lg">
              Your exam is being suspended due to multiple security violations.
            </p>
            <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold text-red-800 mb-2">Violations Detected:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {warningCounts.multipleFaces >= 3 && (
                  <li>• Multiple people detected: 3/3 warnings</li>
                )}
                {warningCounts.tabSwitch >= 3 && (
                  <li>• Tab switching violations: 3/3 warnings</li>
                )}
              </ul>
              <p className="text-xs text-red-600 mt-3">
                Total violations: {warningCounts.total}
              </p>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Click "OK" to acknowledge. Your exam session will be terminated and you will be returned to the main screen.
            </p>
            <Button 
              onClick={handleSuspendConfirm} 
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 text-lg"
            >
              OK - Suspend Exam
            </Button>
          </div>
        </div>
      )}

      {!isFullScreen && examState.currentQuestion > 0 && !showSuspendPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Fullscreen Required</h3>
            <p className="text-gray-600 mb-6">
              You must remain in fullscreen mode during the exam. Click below to return to fullscreen.
            </p>
            <Button onClick={enterFullScreen} className="bg-red-600 hover:bg-red-700">
              Return to Fullscreen
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex h-[calc(100vh-2rem)]">
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start mb-2">
                  <h1 className="text-2xl font-semibold text-slate-800">Secure Exam</h1>
                  <div className="flex gap-2 text-xs">
                    <span
                      className={`px-2 py-1 rounded ${isFullScreen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {isFullScreen ? "🔒 Secure" : "⚠️ Unsecure"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded ${isTabActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {isTabActive ? "👁️ Focused" : "⚠️ Unfocused"}
                    </span>
                    <span className="px-2 py-1 rounded bg-orange-100 text-orange-800">
                      ⚠️ {warningCounts.total} Warnings
                    </span>
                    {(warningCounts.multipleFaces > 0 || warningCounts.tabSwitch > 0) && (
                      <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs">
                        👥 {warningCounts.multipleFaces}/3 | 📱 {warningCounts.tabSwitch}/3
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-lg text-slate-700 mb-4">
                  Question No. <span className="font-semibold">{examState.currentQuestion}</span> of {totalQuestions}
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-slate-600">View in</span>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.languages?.map((lang) => (
                        <SelectItem key={lang.toLowerCase()} value={lang.toLowerCase()}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {currentApiQuestion && (
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>
                      Subject: <span className="font-medium">{currentApiQuestion.subject}</span>
                    </span>
                    <span>
                      Class: <span className="font-medium">{currentApiQuestion.class}</span>
                    </span>
                    <span>
                      Marks: <span className="font-medium">{currentApiQuestion.marks}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                {loadingQuestion ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading question...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <p className="text-red-600 mb-4">{error}</p>
                      <Button
                        onClick={() => getQuestion(examState.currentQuestion)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : currentApiQuestion ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-lg text-slate-800 leading-relaxed mb-4">{currentApiQuestion.question_text}</p>
                      {currentApiQuestion.question_media && (
                        <div className="mb-4">
                          <img
                            src={currentApiQuestion.question_media || "/placeholder.svg"}
                            alt="Question media"
                            className="max-w-full h-auto rounded-lg border"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {getQuestionOptions(currentApiQuestion).map((option, index) => (
                        <label
                          key={index}
                          className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedAnswer === index
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 hover:border-gray-300"
                          } ${isExamSuspended ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentApiQuestion.question_id}`}
                            value={index}
                            checked={selectedAnswer === index}
                            onChange={() => handleAnswerSelect(index)}
                            className="mr-3 mt-1"
                            disabled={isExamSuspended}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-slate-600">{String.fromCharCode(65 + index)}.</span>
                            </div>
                            <span className="text-slate-700">{option}</span>
                            {index === 0 && currentApiQuestion.option_a_media && (
                              <img
                                src={currentApiQuestion.option_a_media || "/placeholder.svg"}
                                alt="Option A"
                                className="mt-2 max-w-xs h-auto rounded"
                              />
                            )}
                            {index === 1 && currentApiQuestion.option_b_media && (
                              <img
                                src={currentApiQuestion.option_b_media || "/placeholder.svg"}
                                alt="Option B"
                                className="mt-2 max-w-xs h-auto rounded"
                              />
                            )}
                            {index === 2 && currentApiQuestion.option_c_media && (
                              <img
                                src={currentApiQuestion.option_c_media || "/placeholder.svg"}
                                alt="Option C"
                                className="mt-2 max-w-xs h-auto rounded"
                              />
                            )}
                            {index === 3 && currentApiQuestion.option_d_media && (
                              <img
                                src={currentApiQuestion.option_d_media || "/placeholder.svg"}
                                alt="Option D"
                                className="mt-2 max-w-xs h-auto rounded"
                              />
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-600">No question available</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleSaveAndNext}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={loadingQuestion || isExamSuspended}
                  >
                    Save & Next
                  </Button>
                  <Button
                    onClick={handleMarkForReviewAndNext}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loadingQuestion || isExamSuspended}
                  >
                    Mark for Review & Next
                  </Button>
                  <Button
                    onClick={handleClearResponse}
                    variant="outline"
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                    disabled={loadingQuestion || isExamSuspended}
                  >
                    Clear Response
                  </Button>
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    disabled={examState.currentQuestion === 1 || loadingQuestion || isExamSuspended}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    variant="outline"
                    disabled={examState.currentQuestion === totalQuestions || loadingQuestion || isExamSuspended}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>

            <div className="w-80 border-l bg-gray-50 flex flex-col">
              <div className="p-4 space-y-4">
                <div className="bg-gray-200 rounded-lg h-40 flex items-center justify-center overflow-hidden relative">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    width={320}
                    height={160}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 640,
                      height: 480,
                      facingMode: "user",
                    }}
                    onUserMedia={handleCameraReady}
                    onUserMediaError={handleCameraError}
                    className="w-full h-full object-cover rounded-lg"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  {!isCameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                      <span className="bg-white bg-opacity-75 px-2 py-1 rounded">Camera Loading...</span>
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      faceDetectionResult.detectionQuality === "high" ? "bg-green-500 text-white" :
                      faceDetectionResult.detectionQuality === "medium" ? "bg-yellow-500 text-white" :
                      "bg-red-500 text-white"
                    }`}>
                      {faceDetectionResult.faces} 👤
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-500 text-white">
                      {Math.round(faceDetectionResult.confidence * 100)}%
                    </span>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mx-auto mb-2">
                      {examState.student?.name?.charAt(0) || "S"}
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">{examState.student?.name || "Student"}</p>
                    <p className="text-xs text-slate-600">Time Left:</p>
                    <p className={`font-bold text-lg ${isExamSuspended ? "text-red-600" : "text-blue-600"}`}>
                      {isExamSuspended ? "SUSPENDED" : formatTime(examState.timeRemaining)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex-1 p-4">
                <h3 className="font-semibold text-slate-700 mb-3">Question Palette</h3>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {Array.from({ length: totalQuestions }, (_, i) => {
                    const questionNumber = i + 1
                    const question = examState.questions[i]
                    return (
                      <button
                        key={questionNumber}
                        onClick={() => handleQuestionJump(questionNumber)}
                        disabled={loadingQuestion || isExamSuspended}
                        className={`w-8 h-8 text-xs font-semibold rounded ${
                          question ? getStatusColor(getQuestionStatus(question)) : "bg-red-500 text-white"
                        } ${
                          examState.currentQuestion === questionNumber ? "ring-2 ring-slate-800" : ""
                        } ${loadingQuestion || isExamSuspended ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {questionNumber}
                      </button>
                    )
                  })}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Answered ({stats.answered})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Not Answered ({stats.notAnswered})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Marked for Review ({stats.markedForReview})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span>Answered & Marked ({stats.answeredAndMarkedForReview})</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t">
                <Button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={examState.isSubmitted || loadingQuestion || isExamSuspended}
                >
                  Submit Exam
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {showSubmitConfirm && !isExamSuspended && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Confirm Submission</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to submit the exam? You cannot make changes after submission.
            </p>
            {violations.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800 font-medium">Security Summary:</p>
                <p className="text-xs text-yellow-700">{violations.length} violations detected during exam</p>
                <div className="text-xs text-yellow-700 mt-1">
                  <div>Multiple faces: {warningCounts.multipleFaces}/3</div>
                  <div>Tab switches: {warningCounts.tabSwitch}/3</div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={() => setShowSubmitConfirm(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmitExam} className="flex-1 bg-red-600 hover:bg-red-700">
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
