import { Button } from "@/components/ui/button"

export function IMSHero() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="mb-6">
              <span className="text-blue-600 font-semibold text-lg">Institute Management System</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Simplify, Streamline, <span className="text-blue-600">Succeed</span>
            </h1>

            <div className="space-y-6 mb-8">
              <p className="text-xl text-gray-600 leading-relaxed">
                Our Powerful Institute Management System Helps You Manage Admissions, Attendance, Fee Collection, Exams,
                And More—All In One Place. Designed For Schools And Coaching Institutes, It Brings Automation And
                Clarity To Daily Operations.
              </p>

              <p className="text-lg text-gray-600 leading-relaxed">
                Let Us Take The Hassle Out Of Administration—So You Can Focus On Delivering Quality Education.
              </p>
            </div>

            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Quote
            </Button>
          </div>

          {/* Right Logo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-96 h-96 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-gray-100">
                {/* Outer Ring Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 400 400">
                    <defs>
                      <path id="circle-path" d="M 200, 200 m -150, 0 a 150,150 0 1,1 300,0 a 150,150 0 1,1 -300,0" />
                    </defs>
                    <text className="text-sm font-bold fill-gray-700 tracking-wider">
                      <textPath href="#circle-path" startOffset="0%">
                        SCHOOZY • INSTITUTE MANAGEMENT SOFTWARE •
                      </textPath>
                    </text>
                  </svg>
                </div>

                {/* Center Icon */}
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-white">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                      <rect
                        x="2"
                        y="3"
                        width="20"
                        height="18"
                        rx="2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
