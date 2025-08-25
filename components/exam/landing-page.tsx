"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ExamConfig } from "@/types/exam"
import axios from "axios"
import { useEffect } from "react"

interface LandingPageProps {
  config: ExamConfig
  onVerify: () => void
  onNext: () => void
  onStatusChange: (status: string) => void
}

export function LandingPage({ config, onVerify, onNext, onStatusChange }: LandingPageProps) {

   const isVerified = async () => {
    
    const response = await axios.get("https://schoozy.in/api/exam/verify-check", {
      withCredentials: true,
    })

    console.log(response.data)

    if (response.data?.success) {


      if(response.data.exam[0].exam_status === 'Suspended'){
        onStatusChange('Suspended')
      }

      if (response.data.exam[0].exam_status === 'Completed') {
        onStatusChange('Completed')
      }

      onVerify()
    }

 
   }


      useEffect(() => {
    isVerified()
   }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl w-full">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-slate-800 mb-5">{config.title}</h2>
          <p className="text-slate-600 mb-8 text-lg">
            Register now for Olympia X 2025 on our official website{" "}
            <a
              href="https://schoozy.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              schoozy.in
            </a>
            .
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-700 text-lg">Exam Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Duration:</span>
                  <span className="font-medium">{config.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Questions:</span>
                  <span className="font-medium">{config.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Languages:</span>
                  <span className="font-medium">{config.languages.join(", ")}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-700 text-lg">Marking Scheme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Correct:</span>
                  <span className="font-medium text-green-600">+{config.markingScheme.correct}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Incorrect:</span>
                  <span className="font-medium text-red-600">{config.markingScheme.incorrect}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Unanswered:</span>
                  <span className="font-medium text-slate-500">{config.markingScheme.unanswered}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-700 text-lg">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-1">
                <div>• Stable internet connection</div>
                <div>• Camera access required</div>
                <div>• Chrome/Firefox browser</div>
                <div>• No external materials</div>
              </CardContent>
            </Card>
          </div>

          <Button
            onClick={onNext}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold text-lg mt-8"
            size="lg"
          >
            Proceed to Exam Mode
          </Button>
        </div>
      </div>
    </div>
  )
}


