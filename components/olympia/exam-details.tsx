export function ExamDetails() {
  const examInfo = [
    { label: "Exam Title", value: "OLYMPIA-X India's Biggest Talent Hunt Exam" },
    { label: "Subjects", value: "Physics, Chemistry, Mathematics, Biology" },
    { label: "Eligible Classes", value: "8th To 12th" },
    { label: "Exam Format", value: "MCQ-Based (Objective)" },
    { label: "Round 1", value: "Online (Home Or School-Based)" },
    { label: "Round 2 & 3", value: "Offline (At School Or Designated Centers)" },
    { label: "Duration", value: "60 Minutes Per Subject" },
    { label: "Classes 8-10", value: "₹350 Per Subject" },
    { label: "Classes 11-12", value: "₹500 Per Subject" },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Exam Details */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">
              Exam <span className="text-blue-600">Details</span>
            </h2>

            <div className="space-y-6">
              {examInfo.map((item, index) => (
                <div key={index} className="flex justify-between items-start py-4 border-b border-gray-200">
                  <div className="font-semibold text-gray-700 flex-1">{item.label}:</div>
                  <div className="text-gray-900 flex-2 text-right max-w-md">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Promotional Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=600')] opacity-10"></div>

              {/* Content */}
              <div className="relative z-10">
                {/* Logo */}
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-blue-900 font-bold text-xl">SE</span>
                  </div>
                  <div className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-full font-bold text-sm">
                    For Classes 8 to 12 | Nationwide Competition
                  </div>
                </div>

                {/* Student Image Placeholder */}
                <div className="text-center mb-6">
                  <div className="w-48 h-48 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-blue-900 text-4xl">🏆</span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center">
                  <div className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-full font-bold text-2xl mb-4 inline-block">
                    SCHOOZY
                  </div>
                  <div className="text-4xl font-bold mb-2">OLYMPIA-X</div>
                  <div className="text-2xl font-bold mb-4">INDIA'S BIGGEST TALENT HUNT EXAM 2025</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
