"use client"

import { useState } from "react"
import type { ExamState } from "@/types/exam"
import { LandingPage } from "@/components/exam/landing-page"
import { StudentInfoForm } from "@/components/exam/student-info-form"
import { InstructionsPage } from "@/components/exam/instructions-page"
import { ExamInterface } from "@/components/exam/exam-interface"

const initialExamConfig = {
  title: "Olympiad Exam",
  duration: 180, // 3 hours
  totalQuestions: 100,
  markingScheme: {
    correct: 4,
    incorrect: -1,
    unanswered: 0,
  },
  languages: ["English", "Hindi"],
}

export default function ExamApp() {
  const [examState, setExamState] = useState<ExamState>({
    currentPage: "landing",
    student: null,
    timeRemaining: initialExamConfig.duration * 60,
    currentQuestion: 1,
    questions: [],
    isSubmitted: false,
  })

  const [examStatus, setExamStatus] = useState("")

  const updateExamState = (updates: Partial<ExamState>) => {
    setExamState((prev) => ({ ...prev, ...updates }))
  }

  const renderCurrentPage = () => {
    switch (examState.currentPage) {
      case "landing":
        return (
          <LandingPage
            config={initialExamConfig}
            onVerify={() => updateExamState({ currentPage: "instructions" })}
            onNext={() => updateExamState({ currentPage: "student-info" })}
            onStatusChange={setExamStatus}  // ✅ renamed
          />
        )
      case "student-info":
        return (
          <StudentInfoForm
            onSubmit={(student) => {
              updateExamState({
                student,
                currentPage: "instructions",
              })
            }}
            onBack={() => updateExamState({ currentPage: "landing" })}
            onStatusChange={setExamStatus}
          />
        )
      case "instructions":
        return (
          <InstructionsPage
            config={initialExamConfig}
            onStartExam={() => updateExamState({ currentPage: "exam" })}
            onBack={() => updateExamState({ currentPage: "student-info" })}
          />
        )
      case "exam":
        return (
          <ExamInterface
            examState={examState}
            config={initialExamConfig}
            onUpdateState={updateExamState}
         
          />
        )
      default:
        return null
    }
  }

  if (examStatus === "Suspended") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl w-full">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-slate-800 mb-5">
              Exam Suspended
            </h2>
            <p className="text-slate-600 mb-8 text-lg">
              Your exam has been suspended. Please try again later.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (examStatus === "Completed") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl w-full">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-slate-800 mb-5">
              Exam Completed
            </h2>
            <p className="text-slate-600 mb-8 text-lg">
              Thank you for completing the exam. Your responses have been
              submitted successfully.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // default case → keep exam running
  return <div className="min-h-screen bg-gray-100">{renderCurrentPage()}</div>
}
