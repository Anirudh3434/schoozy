"use client"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { GraduationCap, Trophy, Users, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function HeroSection() {
  
  const [loading, setLoading] = useState<boolean>(false)

  const router = useRouter()

 const handleRegister = async () => {
    if (loading) return; // prevent double submit
    setLoading(true);

    try {
      const response = await axios.get("https://schoozy.in/api/auth/verify", {
        withCredentials: true,
        timeout: 5000, // 5s timeout
      });

      console.log("verify response:", response.data.message);

      // Optional: check some condition on response.data before navigating
      if (response.data.message === "User is verified") {
        router.push("/olympia-x-register");
      } else {
      alert("User is not verified");
        router.push("/login-account");

      }
    } catch (err) {
      console.error("handleRegister error:", err);

      router.push("/login-account");
   
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="home"
      className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] opacity-5"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-300 mb-4 tracking-wide">
              SCHOOZY EDUTECH PRIVATE LIMITED
            </h1>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Empowering Students,
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                Discovering Academic Talents,
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Uplifting Futures
              </span>
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join thousands of students in our comprehensive scholarship examination program designed for classes 8-10
            and 11-12
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={handleRegister}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Register Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-transparent"
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-full mb-4">
                <Users className="w-8 h-8 text-blue-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">10K+</div>
              <div className="text-gray-300">Students Enrolled</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-full mb-4">
                <Trophy className="w-8 h-8 text-purple-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-300">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-600/20 rounded-full mb-4">
                <BookOpen className="w-8 h-8 text-cyan-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">4</div>
              <div className="text-gray-300">Core Subjects</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-4">
                <GraduationCap className="w-8 h-8 text-green-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-300">Scholarships</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

