"use client"
import { Clock, BookOpen, Laptop, Users, Trophy, DollarSign, Layers, MapPin } from "lucide-react"

export function ExamDetails() {
  const examInfo = [
    { icon: Trophy, label: "Exam Title", value: "OLYMPIA-X India's Biggest Talent Hunt Exam" },
    { icon: BookOpen, label: "Subjects", value: "Physics, Chemistry, Mathematics, Biology" },
    { icon: Users, label: "Eligible Classes", value: "8th To 12th" },
    { icon: Layers, label: "Exam Format", value: "MCQ-Based (Objective)" },
    { icon: Laptop, label: "Round 1", value: "Online (Home Or School-Based)" },
    { icon: MapPin, label: "Round 2 & 3", value: "Offline (At School Or Designated Centers)" },
    { icon: Clock, label: "Duration", value: "60 Minutes Per Subject" },
    { icon: DollarSign, label: "Classes 8-10", value: "₹350 Per Subject" },
    { icon: DollarSign, label: "Classes 11-12", value: "₹500 Per Subject" },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left - Exam Details */}
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-12">
              Exam <span className="text-blue-600">Details</span>
            </h2>

            <div className="space-y-6">
              {examInfo.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-300 border border-gray-100"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium">{item.label}</div>
                    <div className="text-lg font-semibold text-gray-900">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Promotional Card */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-700 to-purple-700 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
              {/* Background Glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-400 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-pink-500 rounded-full blur-3xl opacity-20"></div>

              {/* Content */}
              <div className="relative z-10">
                {/* Logo + Badge */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-20 h-20 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                    <span className="text-blue-900 font-extrabold text-2xl">SE</span>
                  </div>
                  <div className="bg-yellow-400 text-blue-900 px-6 py-2 rounded-full font-bold text-sm shadow">
                    For Classes 8 to 12 | Nationwide Competition
                  </div>
                </div>

                {/* Student Illustration */}
                <div className="text-center mb-6">
                  <div className="w-52 h-52 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center shadow-inner">
                    <div className="w-36 h-36 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-blue-900 text-5xl">🏆</span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center">
                  <div className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-full font-extrabold text-2xl mb-4 inline-block shadow">
                    SCHOOZY
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight mb-2">OLYMPIA-X</div>
                  <div className="text-2xl font-semibold mb-6">INDIA'S BIGGEST TALENT HUNT EXAM 2025</div>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                  <button className="px-8 py-3 bg-yellow-400 text-blue-900 font-bold rounded-full shadow-md hover:bg-yellow-500 transition">
                    Register Now
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}
