"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FaceDetector, FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"
import * as cocoSsd from "@tensorflow-models/coco-ssd"
import "@tensorflow/tfjs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ExamState, ExamConfig, Question, ExamStats } from "@/types/exam"
import { EXAM_API_BASE } from "@/lib/exam-api"
import axios from "axios"
import Webcam from "react-webcam"
import { useRouter } from "next/navigation"

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

interface AttemptedAnswer {
  question_number: number
  question_id: number
  selected_option: string
  is_correct: number
  marks_awarded: number
  time_taken: string
}

interface AttemptedQuestionsResponse {
  success: boolean
  total_attempted: number
  question_attempted: number[]
  answers: AttemptedAnswer[]
}

interface CheatingViolation {
  type: "face_not_detected" | "face_absent" | "multiple_faces" | "tab_switch" | "fullscreen_exit" | "suspicious_movement" | "copy_paste" | "context_menu" | "text_select" | "looking_away" | "phone_detected" | "audio_detected"
  timestamp: number
  severity: "low" | "medium" | "high"
  description: string
}

type WarningType = "multiple_faces" | "tab_switch" | "face_absent" | "fullscreen_exit"

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
  faceAbsent: number
  fullscreenExits: number
  total: number
}

export function ExamInterface({ examState, config, onUpdateState }: ExamInterfaceProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState("english")
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [currentApiQuestion, setCurrentApiQuestion] = useState<ApiQuestion | null>(null)
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalQuestions, setTotalQuestions] = useState(30)
  const [attemptedQuestions, setAttemptedQuestions] = useState<AttemptedAnswer[]>([])
  const [attemptedQuestionNumbers, setAttemptedQuestionNumbers] = useState<number[]>([])
  const webcamRef = useRef<Webcam>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [studentName, setStudentName] = useState("Student")
  const [examEndTime, setExamEndTime] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState("")
  
  // Fixed time tracking states
  const [timeTaken, setTimeTaken] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
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
    faceAbsent: 0,
    fullscreenExits: 0,
    total: 0
  })
  const [showSuspendPopup, setShowSuspendPopup] = useState(false)
  const [isExamSuspended, setIsExamSuspended] = useState(false)
  const [showWarningPopup, setShowWarningPopup] = useState(false)
  const [currentWarning, setCurrentWarning] = useState<{
    type: string
    message: string
    count: number
  } | null>(null)

  // Vision/proctoring refs (MediaPipe Tasks Vision)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const modelLoadedRef = useRef(false)
  const faceDetectorRef = useRef<FaceDetector | null>(null)
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
  const objectModelRef = useRef<cocoSsd.ObjectDetection | null>(null)
  const audioRef = useRef<{ ctx: AudioContext; analyser: AnalyserNode; stream: MediaStream; loudStreak: number } | null>(null)

  // Detection parameters
  const FACE_SCORE_THRESHOLD = 0.5
  const NO_FACE_TICKS_FOR_WARNING = 5 // ~10s at 2s cadence
  const AWAY_TICKS_FOR_FLAG = 3 // ~6s of sustained looking-away
  const OBJECT_CHECK_EVERY_MS = 5000
  const AUDIO_RMS_THRESHOLD = 25 // 0-255 scale on time-domain data
  const AUDIO_STREAK_FOR_FLAG = 3

  // Attention-tracking streaks
  const noFaceStreakRef = useRef(0)
  const awayStreakRef = useRef(0)
  const lastObjectCheckRef = useRef(0)

  // Explicit identity for the exam API (cookie sessions are unreliable
  // across localhost ports, so every request carries these as fallback)
  const studentEmail = examState.student?.email ?? ""
  const studentExamId = examState.student?.examId ?? ""

  // Fresh identity mirror for stable callbacks defined below
  const studentCredsRef = useRef({ email: "", exam_id: "" })
  studentCredsRef.current = { email: studentEmail, exam_id: studentExamId }
  // Per-type throttle so a stuck signal (e.g. no face) doesn't spam the API
  const lastViolationSentRef = useRef<Record<string, number>>({})
  // Late-bound warning dispatcher: detectFrame is defined before triggerWarning
  const triggerWarningRef = useRef<((type: WarningType, description: string) => void) | null>(null)

  const logViolationToServer = useCallback(async (
    violation: CheatingViolation,
    opts?: { snapshot?: boolean; throttleMs?: number },
  ) => {
    try {
      const now = Date.now()
      const last = lastViolationSentRef.current[violation.type] || 0
      if (now - last < (opts?.throttleMs ?? 10_000)) return
      lastViolationSentRef.current[violation.type] = now

      let snapshot: string | undefined
      if (opts?.snapshot !== false) {
        try {
          snapshot = webcamRef.current?.getScreenshot() || undefined
        } catch {
          // camera may be unavailable - log without evidence
        }
      }

      await axios.post(`${EXAM_API_BASE}/log-violation`, {
        email: studentCredsRef.current.email,
        exam_id: studentCredsRef.current.exam_id,
        violation_type: violation.type,
        timestamp: violation.timestamp,
        severity: violation.severity,
        description: violation.description,
        snapshot,
      }, { withCredentials: true })
    } catch (error) {
      console.error("Failed to log violation:", error)
    }
  }, [])

  const addViolation = useCallback((violation: CheatingViolation) => {
    setViolations((prev) => [...prev, violation])
    setCurrentViolation(violation)

    setTimeout(() => {
      setCurrentViolation(null)
    }, 5000)

    // Persist to the backend (evidence trail for proctors)
    logViolationToServer(violation)
  }, [logViolationToServer])

  // Check if tracking should be paused
  const isTrackingPaused = showWarningPopup || showSuspendPopup || isExamSuspended

  // Timer management for question time tracking
  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Reset time taken and start time for new question
    setTimeTaken(0)
    setQuestionStartTime(Date.now())

    // Start new timer - only if exam is not suspended or paused
    if (!isExamSuspended && !isTrackingPaused) {
      timerRef.current = setInterval(() => {
        setTimeTaken(prev => prev + 1)
      }, 1000)
    }

    // Cleanup on unmount or question change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [examState.currentQuestion, isExamSuspended, isTrackingPaused])

  // Pause/resume timer based on tracking state
  useEffect(() => {
    if (isTrackingPaused || isExamSuspended) {
      // Pause timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    } else {
      // Resume timer if not already running
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setTimeTaken(prev => prev + 1)
        }, 1000)
      }
    }
  }, [isTrackingPaused, isExamSuspended])

  // Clean up timers, tracking and media on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
        detectionIntervalRef.current = null
      }
      const a = audioRef.current
      if (a) {
        try {
          a.stream.getTracks().forEach((t) => t.stop())
          a.ctx.close()
        } catch {
          // already torn down
        }
        audioRef.current = null
      }
      try {
        faceDetectorRef.current?.close()
        faceLandmarkerRef.current?.close()
      } catch {
        // already torn down
      }
    }
  }, [])

  // Live mirror of the current answer draft for the unload autosave
  const draftRef = useRef<{ qid: number | null; qnum: number; ans: number | null }>({ qid: null, qnum: 1, ans: null })
  draftRef.current = {
    qid: currentApiQuestion?.question_id ?? null,
    qnum: examState.currentQuestion,
    ans: selectedAnswer,
  }

  // Content-theft guards + presence heartbeat + close-tab autosave
  useEffect(() => {
    const flag = (vtype: CheatingViolation["type"], desc: string, prevent: boolean) => (e: Event) => {
      if (prevent) e.preventDefault()
      const v: CheatingViolation = { type: vtype, timestamp: Date.now(), severity: "medium", description: desc }
      setCurrentViolation(v)
      setTimeout(() => setCurrentViolation(null), 4000)
      logViolationToServer(v)
    }
    const onCopy = flag("copy_paste", "Attempted to copy exam content", true)
    const onPaste = flag("copy_paste", "Attempted to paste into exam", true)
    const onCut = flag("copy_paste", "Attempted to cut exam content", true)
    const onMenu = flag("context_menu", "Opened right-click menu during exam", true)
    const onSelect = flag("text_select", "Selected exam text", false)
    document.addEventListener("copy", onCopy)
    document.addEventListener("paste", onPaste)
    document.addEventListener("cut", onCut)
    document.addEventListener("contextmenu", onMenu)
    document.addEventListener("selectstart", onSelect)

    // Presence heartbeat every 30s; also honours server-driven suspension
    // (a proctor can suspend from the dashboard mid-exam)
    const beat = async () => {
      try {
        const res = await axios.post(`${EXAM_API_BASE}/heartbeat`, {
          email: studentCredsRef.current.email,
          exam_id: studentCredsRef.current.exam_id,
        }, { withCredentials: true })
        if (res.data?.exam_status === "Suspended") setIsExamSuspended(true)
        if (res.data?.exam_status === "Completed") router.push("/")
      } catch {
        // offline tolerated - heartbeat is best-effort
      }
    }
    const beatId = setInterval(beat, 30_000)

    // Autosave the current draft if the tab is closed/refreshed
    const onUnload = () => {
      const d = draftRef.current
      if (d.qid == null || d.ans == null) return
      try {
        navigator.sendBeacon(
          `${EXAM_API_BASE}/submit-answer`,
          new Blob([JSON.stringify({
            email: studentCredsRef.current.email,
            exam_id: studentCredsRef.current.exam_id,
            question_number: d.qnum,
            question_id: d.qid,
            answer: optionIndexToLetter(d.ans),
            time_taken: 0,
          })], { type: "application/json" }),
        )
      } catch {
        // unload path - nothing else we can do
      }
    }
    window.addEventListener("beforeunload", onUnload)

    return () => {
      document.removeEventListener("copy", onCopy)
      document.removeEventListener("paste", onPaste)
      document.removeEventListener("cut", onCut)
      document.removeEventListener("contextmenu", onMenu)
      document.removeEventListener("selectstart", onSelect)
      clearInterval(beatId)
      window.removeEventListener("beforeunload", onUnload)
    }
  }, [logViolationToServer, router])

  // Camera permission and setup
  const requestCameraPermission = useCallback(async () => {
    try {
      console.log("Requesting camera permission...")
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported by this browser")
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      })
      
      console.log("Camera permission granted")
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      console.error("Camera permission error:", error)
      const errorMsg = error instanceof Error ? error.message : "Camera access failed"
      setError(`Camera access required: ${errorMsg}`)
      return false
    }
  }, [])

  // Load MediaPipe Tasks Vision models (face detector + face landmarker for
  // presence counting, gaze and head-pose attention tracking)
  const loadModels = useCallback(async () => {
    try {
      console.log("Loading MediaPipe vision models...")
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm"
      )

      const [detector, landmarker] = await Promise.all([
        FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
        }),
        FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        }),
      ])

      faceDetectorRef.current = detector
      faceLandmarkerRef.current = landmarker
      modelLoadedRef.current = true
      console.log("MediaPipe vision models loaded successfully")

      // Secondary-device detector (phones/laptops/books) - best effort
      try {
        const coco = await cocoSsd.load()
        objectModelRef.current = coco
        console.log("Object detection model loaded")
      } catch (objErr) {
        console.warn("Object detection unavailable:", objErr)
      }

      // Ambient-audio monitor - best effort (needs mic permission)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const Ctx = window.AudioContext || (window as any).webkitAudioContext
        const ctx: AudioContext = new Ctx()
        const src = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 512
        src.connect(analyser)
        audioRef.current = { ctx, analyser, stream, loudStreak: 0 }
        console.log("Audio monitoring enabled")
      } catch (audioErr) {
        console.warn("Audio monitoring unavailable (mic denied?)", audioErr)
      }

      return true
    } catch (error) {
      console.error("Failed to load vision models:", error)
      const errorMsg = error instanceof Error ? error.message : "Model loading failed"
      setError(`Face detection setup failed: ${errorMsg}`)
      return false
    }
  }, [])

  // Verify models are properly loaded
  const verifyModelsLoaded = useCallback(() => {
    const ready = !!faceDetectorRef.current && !!faceLandmarkerRef.current
    console.log("Models verification:", ready)
    return ready
  }, [])

  // Get attempted questions API
  const getAttemptedQuestions = useCallback(async () => {
    try {
      const response = await axios.get(`${EXAM_API_BASE}/submit-answer-info`, {
        withCredentials: true,
        params: { email: studentEmail, exam_id: studentExamId },
      })
      
      if (response.data && response.data.success) {
        const data: AttemptedQuestionsResponse = response.data
        console.log("Attempted questions retrieved:", data)
        
        setAttemptedQuestions(data.answers || [])
        setAttemptedQuestionNumbers(data.question_attempted || [])
        
        // Update question states based on attempted answers
        updateQuestionsWithAttemptedAnswers(data.answers || [])
        
        return data
      } else {
        console.warn("Failed to get attempted questions:", response.data?.message)
        return null
      }
    } catch (error) {
      console.error("Failed to retrieve attempted questions:", error)
      return null
    }
  }, [studentEmail, studentExamId])

  // Helper function to convert option letter to index (A=0, B=1, C=2, D=3)
  const optionLetterToIndex = (letter: string): number => {
    return letter.charCodeAt(0) - 65 // A=0, B=1, C=2, D=3
  }

  // Helper function to convert index to option letter
  const optionIndexToLetter = (index: number): string => {
    return String.fromCharCode(65 + index) // 0=A, 1=B, 2=C, 3=D
  }

  // Update questions array with attempted answers
  const updateQuestionsWithAttemptedAnswers = useCallback((attemptedAnswers: AttemptedAnswer[]) => {
    if (!examState.questions.length || !attemptedAnswers.length) return

    const updatedQuestions = [...examState.questions]
    
    attemptedAnswers.forEach((answer) => {
      const questionIndex = answer.question_number - 1
      if (questionIndex >= 0 && questionIndex < updatedQuestions.length) {
        const selectedAnswerIndex = optionLetterToIndex(answer.selected_option)
        
        updatedQuestions[questionIndex] = {
          ...updatedQuestions[questionIndex],
          selectedAnswer: selectedAnswerIndex,
          isAnswered: true,
          isMarkedForReview: false // Reset this as we're loading from server
        }
      }
    })
    
    onUpdateState({ questions: updatedQuestions })
  }, [examState.questions, onUpdateState])

  // Attention analysis from FaceLandmarker landmarks (478-pt topology).
  // Returns true when the student is looking away from the screen:
  // sideways head yaw, downward gaze (phone-in-lap), or sideways iris drift.
  const isLookingAway = useCallback((landmarks: { x: number; y: number }[]) => {
    try {
      const lxOuter = landmarks[33]
      const lxInner = landmarks[133]
      const rxInner = landmarks[362]
      const rxOuter = landmarks[263]
      const nose = landmarks[1]
      const lIris = landmarks[468]
      const rIris = landmarks[473]
      // Eyelid vertical references: upper 159/386, lower 145/374
      const lTop = landmarks[159]
      const lBot = landmarks[145]
      const rTop = landmarks[386]
      const rBot = landmarks[374]
      if (!lxOuter || !rxOuter || !nose || !lIris || !rIris || !lTop || !lBot || !rTop || !rBot) return false

      const eyeW = Math.abs(rxOuter.x - lxOuter.x) || 1e-6
      const eyeMidX = (lxOuter.x + rxOuter.x) / 2

      // Head yaw proxy: nose offset from eye midpoint, normalised by eye width
      const yaw = (nose.x - eyeMidX) / eyeW
      if (Math.abs(yaw) > 0.3) return true

      // Horizontal iris drift per eye
      const drift = (iris: { x: number }, outer: { x: number }, inner: { x: number }) => {
        const t = (iris.x - outer.x) / ((inner.x - outer.x) || 1e-6)
        return Math.abs(t - 0.5)
      }
      if (drift(lIris, lxOuter, lxInner) > 0.3 && drift(rIris, rxOuter, rxInner) > 0.3) return true

      // Downward gaze (both irises low inside the eyelid opening)
      const downRatio = (iris: { y: number }, top: { y: number }, bot: { y: number }) =>
        (iris.y - (top.y + bot.y) / 2) / (Math.abs(bot.y - top.y) || 1e-6)
      if (downRatio(lIris, lTop, lBot) > 0.45 && downRatio(rIris, rTop, rBot) > 0.45) return true

      return false
    } catch {
      return false
    }
  }, [])

  // Ambient-audio sampling: sustained loudness suggests speech in the room
  const sampleAudio = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    try {
      const data = new Uint8Array(a.analyser.fftSize)
      a.analyser.getByteTimeDomainData(data)
      let sum = 0
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / data.length) * 128
      if (rms > AUDIO_RMS_THRESHOLD) {
        a.loudStreak += 1
        if (a.loudStreak >= AUDIO_STREAK_FOR_FLAG) {
          a.loudStreak = 0
          addViolation({
            type: "audio_detected",
            timestamp: Date.now(),
            severity: "medium",
            description: "Sustained audio detected near the microphone - possible speech",
          })
        }
      } else {
        a.loudStreak = 0
      }
    } catch {
      // analyser unavailable - skip silently
    }
  }, [addViolation])

  // Secondary-device sweep (phones/laptops/books) every OBJECT_CHECK_EVERY_MS
  const checkForDevices = useCallback(async (video: HTMLVideoElement) => {
    const model = objectModelRef.current
    if (!model) return
    try {
      const preds = await model.detect(video)
      const hit = preds.find(
        (p) => ["cell phone", "laptop", "book"].includes(p.class) && p.score > 0.5
      )
      if (hit) {
        addViolation({
          type: "phone_detected",
          timestamp: Date.now(),
          severity: "high",
          description: `Possible secondary device in view: ${hit.class} (${Math.round(hit.score * 100)}%)`,
        })
      }
    } catch (error) {
      console.error("Object detection error:", error)
    }
  }, [addViolation])

  // Main tracking tick (every 2s): face count -> absence escalation ->
  // gaze/head attention -> audio sample. Device sweep runs on its own cadence.
  const detectFrame = useCallback(async () => {
    // Early exit conditions - now includes popup checks
    if (!isCameraReady || !modelLoadedRef.current || isTrackingPaused) {
      return
    }

    if (!webcamRef.current?.video) {
      return
    }

    try {
      const video = webcamRef.current.video

      // Check video readiness
      if (video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) {
        return
      }

      const detector = faceDetectorRef.current
      if (!detector) return
      const nowMs = performance.now()
      const faceRes = detector.detectForVideo(video, nowMs)
      const faces = (faceRes.detections || []).filter(
        (d) => (d.categories?.[0]?.score ?? 0) >= FACE_SCORE_THRESHOLD
      )
      const faceCount = faces.length
      const avgConfidence = faceCount > 0
        ? faces.reduce((s, d) => s + (d.categories?.[0]?.score ?? 0), 0) / faceCount
        : 0

      setFaceDetectionResult({
        faces: faceCount,
        confidence: avgConfidence,
        detectionQuality: avgConfidence > 0.8 ? "high" : avgConfidence > 0.6 ? "medium" : "low",
        frameAnalysis: {
          skinPixels: 0,
          faceRegions: faceCount,
          movementDetected: false
        }
      })

      if (faceCount === 0) {
        // Absent face: log (throttled) and escalate after a grace period
        noFaceStreakRef.current += 1
        awayStreakRef.current = 0
        if (noFaceStreakRef.current >= NO_FACE_TICKS_FOR_WARNING) {
          noFaceStreakRef.current = 0
          triggerWarningRef.current?.("face_absent", "No face visible in camera for ~10 seconds")
        } else {
          addViolation({
            type: "face_not_detected",
            timestamp: Date.now(),
            severity: "medium",
            description: "No person detected in camera feed"
          })
        }
      } else if (faceCount > 1) {
        noFaceStreakRef.current = 0
        awayStreakRef.current = 0
        triggerWarningRef.current?.("multiple_faces", `${faceCount} people detected in camera`)
      } else {
        noFaceStreakRef.current = 0
        // Single face: attention check via landmarks
        try {
          const landmarker = faceLandmarkerRef.current
          if (landmarker) {
            const lmRes = landmarker.detectForVideo(video, nowMs)
            const pts = lmRes.faceLandmarks?.[0]
            if (pts && isLookingAway(pts as { x: number; y: number }[])) {
              awayStreakRef.current += 1
              if (awayStreakRef.current >= AWAY_TICKS_FOR_FLAG) {
                awayStreakRef.current = 0
                addViolation({
                  type: "looking_away",
                  timestamp: Date.now(),
                  severity: "medium",
                  description: "Student looking away from screen for ~6 seconds (gaze/head pose)",
                })
              }
            } else {
              awayStreakRef.current = 0
            }
          }
        } catch (lmErr) {
          console.error("Landmark analysis error:", lmErr)
        }
      }

      // Ambient audio sample on every tick
      sampleAudio()

      // Secondary-device sweep on its own cadence
      if (nowMs - lastObjectCheckRef.current > OBJECT_CHECK_EVERY_MS) {
        lastObjectCheckRef.current = nowMs
        await checkForDevices(video)
      }
    } catch (error) {
      if (error instanceof Error && !error.message.includes("Failed to fetch")) {
        console.error("Tracking error:", error.message)
      }
    }
  }, [isCameraReady, isTrackingPaused, addViolation, isLookingAway, sampleAudio, checkForDevices])

  const triggerWarning = useCallback((type: WarningType, description: string) => {
    setWarningCounts(prev => {
      const key = type === "multiple_faces" ? "multipleFaces"
        : type === "tab_switch" ? "tabSwitch"
        : type === "face_absent" ? "faceAbsent" : "fullscreenExits"
      const labels: Record<WarningType, string> = {
        multiple_faces: "Multiple People Detected",
        tab_switch: "Tab Switch Detected",
        face_absent: "No Face Detected",
        fullscreen_exit: "Fullscreen Exit",
      }
      const newCounts = { ...prev, [key]: prev[key] + 1, total: prev.total + 1 }

      // Set current warning details
      setCurrentWarning({ type: labels[type], message: description, count: newCounts[key] })

      // Show warning popup
      setShowWarningPopup(true)

      // Check if suspension is needed (3 strikes per signal)
      if (newCounts[key] >= 3) {
        setTimeout(() => {
          setShowWarningPopup(false)
          setShowSuspendPopup(true)
        }, 100)
        return newCounts
      }

      addViolation({
        type,
        timestamp: Date.now(),
        severity: "high",
        description: `${description} (Warning ${newCounts[key]}/3)`
      })

      return newCounts
    })
  }, [])

  // Bind the late dispatcher once triggerWarning exists
  triggerWarningRef.current = triggerWarning

  // Fullscreen exits escalate: logged every time, warning popup every 3rd
  const fullscreenExitCountRef = useRef(0)
  const reportFullscreenExit = useCallback(() => {
    fullscreenExitCountRef.current += 1
    const n = fullscreenExitCountRef.current
    if (n % 3 === 0) {
      triggerWarning("fullscreen_exit", `Exited fullscreen mode ${n} times`)
    } else {
      addViolation({
        type: "fullscreen_exit",
        timestamp: Date.now(),
        severity: "high",
        description: `Student exited fullscreen mode (${n})`,
      })
    }
  }, [addViolation, triggerWarning])

  const handleWarningOk = useCallback(() => {
    setShowWarningPopup(false)
    setCurrentWarning(null)
  }, [])

  const suspendExam = useCallback(async () => {
    setIsExamSuspended(true)
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }

    try {
      const response = await axios.post(`${EXAM_API_BASE}/suspend-exam`, { email: studentEmail, exam_id: studentExamId }, {
        withCredentials: true
      })
      console.log("Exam suspended successfully:", response.data)
      router.push("/exam")
    } catch (error) {
      console.error("Failed to suspend exam:", error)
    }

    console.log("Exam suspended due to multiple violations")
  }, [router, studentEmail, studentExamId])

  const handleSuspendConfirm = useCallback(() => {
    setShowSuspendPopup(false)
    suspendExam()
    exitFullScreen()
  }, [suspendExam])

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

  // Camera event handlers
  const handleCameraReady = useCallback(() => {
    console.log("Camera ready")
    setIsCameraReady(true)
  }, [])

  const handleCameraError = useCallback((error: string | DOMException) => {
    console.error("Camera error:", error)
    setIsCameraReady(false)
    
    let errorMessage = "Camera access failed"
    if (typeof error === "string") {
      errorMessage = error
    } else if (error.name === "NotAllowedError") {
      errorMessage = "Camera permission denied. Please allow camera access and refresh."
    } else if (error.name === "NotFoundError") {
      errorMessage = "No camera found. Please connect a camera and refresh."
    } else if (error.name === "NotReadableError") {
      errorMessage = "Camera is already in use by another application."
    }
    
    setError(errorMessage)
  }, [])

  // Start face detection when camera and models are ready
  useEffect(() => {
    if (isCameraReady && modelLoadedRef.current && !detectionIntervalRef.current && !isTrackingPaused) {
      console.log("Starting exam tracking...")
      setTimeout(() => {
        detectionIntervalRef.current = setInterval(detectFrame, 2000)
      }, 2000)
    }

    // Stop detection when tracking is paused
    if (isTrackingPaused && detectionIntervalRef.current) {
      console.log("Pausing face detection...")
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }
  }, [isCameraReady, detectFrame, isTrackingPaused])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isTrackingPaused) return

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
    [addViolation, isTrackingPaused],
  )

  const handleVisibilityChange = useCallback(() => {
    if (isTrackingPaused) return

    const isVisible = !document.hidden
    setIsTabActive(isVisible)

    if (!isVisible) {
      triggerWarning("tab_switch", "Student switched away from exam tab")
    }
  }, [triggerWarning, isTrackingPaused])

  const handleFullScreenChange = useCallback(() => {
    const isCurrentlyFullScreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement
    )

    setIsFullScreen(isCurrentlyFullScreen)

    if (!isCurrentlyFullScreen && examState.currentQuestion > 0 && !isTrackingPaused) {
      reportFullscreenExit()
    }
  }, [addViolation, examState.currentQuestion, isTrackingPaused])

  const getQuestion = async (questionNumber: number) => {
    setLoadingQuestion(true)
    setError(null)
    try {
      const response = await axios.get(`${EXAM_API_BASE}/get-question`, {
        withCredentials: true,
        params: {
          question_number: questionNumber,
          email: studentEmail,
          exam_id: studentExamId,
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

  const verifyCheck = async () => {
    try {
      const response = await axios.get(`${EXAM_API_BASE}/verify-check`, {
        withCredentials: true,
        params: { email: studentEmail, exam_id: studentExamId },
      })
      if (response.data && response.data.success) {
        const user = response.data.user[0]
        const exam = response.data.exam[0]
        if (user && user.full_name) {
          setStudentName(user.full_name)
        }
        if (exam && exam.end_time) {
          setExamEndTime(new Date(exam.end_time))
        }
      }
    } catch (error) {
      console.error("Failed to verify check:", error)
    }
  }

  // Main initialization effect
  useEffect(() => {
    const initializeExam = async () => {
      setIsLoading(true)

      try {
        console.log("Initializing exam...")

        // 1. Request camera permission
        const cameraPermission = await requestCameraPermission()
        if (!cameraPermission) {
          setIsLoading(false)
          return
        }

        // 2. Load vision models (MediaPipe face + landmarks, coco objects, audio)
        const modelsLoaded = await loadModels()
        if (!modelsLoaded) {
          setIsLoading(false)
          return
        }

        // 3. Verify models loaded
        if (!verifyModelsLoaded()) {
          setError("Proctoring models failed to load properly")
          setIsLoading(false)
          return
        }

        // 4. Other initialization
        await verifyCheck()
        await enterFullScreen()

        // 5. Set up event listeners
        const handleKeyDownEvent = (e: KeyboardEvent) => {
          if (isTrackingPaused) return

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
        }

        const handleVisibilityChangeEvent = () => {
          if (isTrackingPaused) return

          const isVisible = !document.hidden
          setIsTabActive(isVisible)

          if (!isVisible) {
            triggerWarning("tab_switch", "Student switched away from exam tab")
          }
        }

        const handleFullScreenChangeEvent = () => {
          const isCurrentlyFullScreen = !!(
            document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).msFullscreenElement
          )

          setIsFullScreen(isCurrentlyFullScreen)

          if (!isCurrentlyFullScreen && examState.currentQuestion > 0 && !isTrackingPaused) {
            addViolation({
              type: "fullscreen_exit",
              timestamp: Date.now(),
              severity: "high",
              description: "Student exited fullscreen mode",
            })
          }
        }

        document.addEventListener("keydown", handleKeyDownEvent)
        document.addEventListener("visibilitychange", handleVisibilityChangeEvent)
        document.addEventListener("fullscreenchange", handleFullScreenChangeEvent)
        document.addEventListener("webkitfullscreenchange", handleFullScreenChangeEvent)
        document.addEventListener("msfullscreenchange", handleFullScreenChangeEvent)

        // 6. Initialize questions array first
        const initialQuestions = initializeQuestionsArray()
        onUpdateState({ questions: initialQuestions })

        // 7. Get attempted questions and update state
        await getAttemptedQuestions()

        // 8. Load first question
        await getQuestion(1)

        console.log("Exam initialized successfully")

      } catch (error) {
        console.error("Exam initialization failed:", error)
        const errorMsg = error instanceof Error ? error.message : "Initialization failed"
        setError(`Initialization failed: ${errorMsg}`)
      } finally {
        setIsLoading(false)
      }
    }

    initializeExam()

    // Timer for exam countdown
    const timer = setInterval(() => {
      if (examEndTime && !isExamSuspended) {
        const now = new Date()
        const timeDiff = Math.max(0, (examEndTime.getTime() - now.getTime()) / 1000)
        onUpdateState({ timeRemaining: timeDiff })
      }
    }, 1000)

    return () => {
      clearInterval(timer)
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
        detectionIntervalRef.current = null
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

  // Update selected answer when question changes
  useEffect(() => {
    const currentQuestion = examState.questions[examState.currentQuestion - 1]
    if (currentQuestion) {
      setSelectedAnswer(currentQuestion.selectedAnswer ?? null)
    }
  }, [examState.currentQuestion, examState.questions])

  // Update questions when attempted questions change
  useEffect(() => {
    if (attemptedQuestions.length > 0 && examState.questions.length > 0) {
      updateQuestionsWithAttemptedAnswers(attemptedQuestions)
    }
  }, [attemptedQuestions])

  useEffect(() => {
    if (examState.timeRemaining <= 0 && !examState.isSubmitted) {
      handleSubmitExam()
    }
  }, [examState.timeRemaining, examState.isSubmitted])

  const getCurrentQuestion = () => {
    return examState.questions[examState.currentQuestion - 1]
  }

  const getQuestionStatus = (question: Question, questionNumber: number) => {
    // Check if question was attempted (has server data)
    const isAttempted = attemptedQuestionNumbers.includes(questionNumber)
    
    if (question.isAnswered && question.isMarkedForReview) return "answered-marked"
    if (question.isAnswered || isAttempted) return "answered"
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
    if (isExamSuspended || showWarningPopup) return
    setSelectedAnswer(optionIndex)
  }

  // Modified saveResponse function with fixed time tracking
  const saveResponse = async () => {
    if (!currentApiQuestion || isExamSuspended) return

    try {
      const response = await axios.post(`${EXAM_API_BASE}/submit-answer`, {
        email: studentEmail,
        exam_id: studentExamId,
        question_number: examState.currentQuestion,
        question_id: currentApiQuestion.question_id,
        answer: selectedAnswer !== null ? optionIndexToLetter(selectedAnswer) : "",
        time_taken: timeTaken, // Fixed: using correct variable name
      }, {
        withCredentials: true
      })
      console.log("Response saved:", response.data)
      
      // Refresh attempted questions after saving
      await getAttemptedQuestions()
    } catch (error) {
      console.error("Failed to save response:", error)
    }
  }

  const handleSaveAndNext = async () => {
    if (isExamSuspended || showWarningPopup) return
    await saveResponse()

    const currentIndex = examState.currentQuestion - 1
    updateQuestion(currentIndex, {
      selectedAnswer: selectedAnswer !== null ? selectedAnswer : undefined,
      isAnswered: selectedAnswer !== null,
    })

    if (examState.currentQuestion < totalQuestions) {
      onUpdateState({ currentQuestion: examState.currentQuestion + 1 })
    }
  }

  const handleMarkForReviewAndNext = async () => {
    if (isExamSuspended || showWarningPopup) return
    await saveResponse()

    const currentIndex = examState.currentQuestion - 1
    updateQuestion(currentIndex, {
      selectedAnswer: selectedAnswer !== null ? selectedAnswer : undefined,
      isAnswered: selectedAnswer !== null,
      isMarkedForReview: true,
    })

    if (examState.currentQuestion < totalQuestions) {
      onUpdateState({ currentQuestion: examState.currentQuestion + 1 })
    }
  }

  const handleClearResponse = () => {
    if (isExamSuspended || showWarningPopup) return
    setSelectedAnswer(null)
    const currentIndex = examState.currentQuestion - 1
    updateQuestion(currentIndex, {
      selectedAnswer: undefined,
      isAnswered: false,
    })
  }

  const handlePrevious = () => {
    if (isExamSuspended || showWarningPopup) return
    if (examState.currentQuestion > 1) {
      onUpdateState({ currentQuestion: examState.currentQuestion - 1 })
    }
  }

  const handleNext = () => {
    if (isExamSuspended || showWarningPopup) return
    if (examState.currentQuestion < totalQuestions) {
      onUpdateState({ currentQuestion: examState.currentQuestion + 1 })
    }
  }

  const handleQuestionJump = (questionNumber: number) => {
    if (isExamSuspended || showWarningPopup) return
    onUpdateState({ currentQuestion: questionNumber })
  }

  const handleSubmitExam = async () => {
    onUpdateState({ isSubmitted: true })
    setShowSubmitConfirm(false)

    try {
      const response = await axios.post(`${EXAM_API_BASE}/complete-exam`, { email: studentEmail, exam_id: studentExamId }, {
        withCredentials: true
      })

      if (response.data.success) {
        exitFullScreen()
        alert("Exam submitted successfully!")
        router.push("/")
      }

      console.log("Exam submitted successfully:", response.data)
    } catch (error) {
      console.error("Failed to submit exam:", error)
    }
  }

  const getExamStats = (): ExamStats => {
    const answered = examState.questions.filter((q, index) => {
      const questionNumber = index + 1
      const isAttempted = attemptedQuestionNumbers.includes(questionNumber)
      return (q.isAnswered && !q.isMarkedForReview) || (isAttempted && !q.isMarkedForReview)
    }).length
    
    const markedForReview = examState.questions.filter((q) => q.isMarkedForReview && !q.isAnswered).length
    
    const answeredAndMarkedForReview = examState.questions.filter((q) => q.isAnswered && q.isMarkedForReview).length
    
    const totalAnsweredOrAttempted = examState.questions.filter((q, index) => {
      const questionNumber = index + 1
      const isAttempted = attemptedQuestionNumbers.includes(questionNumber)
      return q.isAnswered || isAttempted
    }).length
    
    const notAnswered = examState.questions.length - totalAnsweredOrAttempted - markedForReview

    return {
      answered,
      notAnswered: Math.max(0, notAnswered),
      markedForReview,
      answeredAndMarkedForReview,
    }
  }

  useEffect(() => {
    if (!examEndTime) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const end = examEndTime.getTime()
      const diff = end - now

      if (diff <= 0) {
        clearInterval(interval)
        setTimeLeft("Exam Finished")
      } else {
        const minutes = Math.floor(diff / 1000 / 60)
        const seconds = Math.floor((diff / 1000) % 60)
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [examEndTime])

  useEffect(() => {
    verifyCheck()
  }, [])

  useEffect(() => {
    if (timeLeft === "Exam Finished" || timeLeft === 0) {
      alert("Time up!")
      router.push("/")
    }
  }, [timeLeft, router]) 

  // Get the attempted answer for current question to show in UI
  const getCurrentQuestionAttemptedAnswer = () => {
    const attemptedAnswer = attemptedQuestions.find(
      answer => answer.question_number === examState.currentQuestion
    )
    return attemptedAnswer
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing secure exam environment...</p>
          <p className="text-sm text-gray-500 mt-2">Loading AI proctoring system...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isExamSuspended) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">Exam Suspended</h2>
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
  const currentAttemptedAnswer = getCurrentQuestionAttemptedAnswer()

  return (
    <div className="min-h-screen bg-gray-100">
      {currentViolation && (
        <Alert className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            <strong>Security Alert:</strong> {currentViolation.description}
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Warning Popup */}
      {showWarningPopup && currentWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-10 max-w-2xl w-full mx-6 text-center border-4 border-yellow-400">
            <div className="text-8xl mb-6 animate-pulse">⚠️</div>
            <h2 className="text-4xl font-bold text-red-600 mb-4">WARNING!</h2>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">{currentWarning.type}</h3>
            
            <div className="bg-red-50 rounded-lg p-6 mb-8 border-2 border-red-200">
              <p className="text-xl text-red-700 font-medium mb-4">{currentWarning.message}</p>
              
              <div className="bg-white rounded-lg p-4 border border-red-300">
                <div className="text-lg font-semibold text-red-800 mb-3">
                  Warning Count: {currentWarning.count}/3
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${
                      currentWarning.count === 1 ? 'bg-yellow-500 w-1/3' :
                      currentWarning.count === 2 ? 'bg-orange-500 w-2/3' :
                      'bg-red-600 w-full'
                    }`}
                  ></div>
                </div>
                
                <p className="text-base text-red-600 font-medium">
                  {currentWarning.count < 3 ? 
                    `You have ${3 - currentWarning.count} warning(s) remaining before exam suspension.` :
                    'FINAL WARNING: Next violation will suspend your exam!'
                  }
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-8 border-2 border-blue-200">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">Security Requirements:</h4>
              <div className="text-left space-y-2 text-blue-700">
                <p>• Keep only yourself visible in the camera</p>
                <p>• Stay focused on this exam tab</p>
                <p>• Maintain proper lighting and camera position</p>
                <p>• Do not use any external help or devices</p>
              </div>
            </div>

            <div className="text-lg text-gray-700 mb-8">
              <p className="font-medium">Exam tracking has been PAUSED.</p>
              <p className="text-base mt-2">Click "I Understand - Continue Exam" to resume monitoring and continue your exam.</p>
            </div>

            <Button
              onClick={handleWarningOk}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              I Understand - Continue Exam
            </Button>
          </div>
        </div>
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

      {!isFullScreen && examState.currentQuestion > 0 && !showSuspendPopup && !showWarningPopup && (
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
                  <h2 className="text-2xl font-semibold text-slate-800">Secure Exam</h2>
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
                    <span className={`px-2 py-1 rounded ${isTrackingPaused ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                      {isTrackingPaused ? "⏸️ Paused" : "▶️ Monitoring"}
                    </span>
                    {(warningCounts.multipleFaces > 0 || warningCounts.tabSwitch > 0 || warningCounts.faceAbsent > 0 || warningCounts.fullscreenExits > 0) && (
                      <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs">
                        👥 {warningCounts.multipleFaces}/3 | 📱 {warningCounts.tabSwitch}/3 | 🚫👤 {warningCounts.faceAbsent}/3 | 🖥️ {warningCounts.fullscreenExits}/3
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
                    <span>
                      Time: <span className="font-medium">{Math.floor(timeTaken / 60)}m {timeTaken % 60}s</span>
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
                          } ${isTrackingPaused ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentApiQuestion.question_id}`}
                            value={index}
                            checked={selectedAnswer === index}
                            onChange={() => handleAnswerSelect(index)}
                            className="mr-3 mt-1"
                            disabled={isTrackingPaused}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-slate-600">{optionIndexToLetter(index)}.</span>
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
                    disabled={loadingQuestion || isTrackingPaused}
                  >
                    Save & Next
                  </Button>
                  <Button
                    onClick={handleMarkForReviewAndNext}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loadingQuestion || isTrackingPaused}
                  >
                    Mark for Review & Next
                  </Button>
                  <Button
                    onClick={handleClearResponse}
                    variant="outline"
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                    disabled={loadingQuestion || isTrackingPaused}
                  >
                    Clear Response
                  </Button>
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    disabled={examState.currentQuestion === 1 || loadingQuestion || isTrackingPaused}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    variant="outline"
                    disabled={examState.currentQuestion === totalQuestions || loadingQuestion || isTrackingPaused}
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
                      frameRate: { ideal: 30 }
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

                  {isTrackingPaused && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        ⏸️ PAUSED
                      </span>
                    </div>
                  )}
                </div>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mx-auto mb-2">
                      {studentName?.charAt(0) || "S"}
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">{studentName || "Student"}</p>
                    <p className="text-xs text-slate-600">Time Left:</p>
                    <p className={`font-bold text-lg ${isExamSuspended ? "text-red-600" : "text-blue-600"}`}>
                      {isExamSuspended ? "SUSPENDED" : timeLeft }
                    </p>
                    {attemptedQuestions.length > 0 && (
                      <div className="mt-2 text-xs text-slate-500">
                        <p>Attempted: {attemptedQuestions.length}/{totalQuestions}</p>
                      </div>
                    )}
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
                        disabled={loadingQuestion || isTrackingPaused}
                        className={`w-8 h-8 text-xs font-semibold rounded ${
                          question ? getStatusColor(getQuestionStatus(question, questionNumber)) : "bg-red-500 text-white"
                        } ${
                          examState.currentQuestion === questionNumber ? "ring-2 ring-slate-800" : ""
                        } ${loadingQuestion || isTrackingPaused ? "opacity-50 cursor-not-allowed" : ""}`}
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
                  disabled={examState.isSubmitted || loadingQuestion || isTrackingPaused}
                >
                  Submit Exam
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSubmitConfirm && !isExamSuspended && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Confirm Submission</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to submit the exam? You cannot make changes after submission.
            </p>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800 font-medium">Exam Summary:</p>
              <div className="text-xs text-blue-700 mt-1 space-y-1">
                <div>Total Questions: {totalQuestions}</div>
                <div>Attempted Questions: {attemptedQuestions.length}</div>
                <div>Answered: {stats.answered}</div>
                <div>Marked for Review: {stats.markedForReview}</div>
                <div>Not Answered: {stats.notAnswered}</div>
              </div>
            </div>
            {violations.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800 font-medium">Security Summary:</p>
                <p className="text-xs text-yellow-700">{violations.length} violations detected during exam</p>
                <div className="text-xs text-yellow-700 mt-1">
                  <div>Multiple faces: {warningCounts.multipleFaces}/3</div>
                  <div>Tab switches: {warningCounts.tabSwitch}/3</div>
                  <div>Face absent: {warningCounts.faceAbsent}/3</div>
                  <div>Fullscreen exits: {warningCounts.fullscreenExits}/3</div>
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