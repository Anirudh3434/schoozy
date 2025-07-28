import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Users, Award, Target } from "lucide-react"

export function OlympiaOverview() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-8">
                <div className="text-white text-4xl font-bold">OX</div>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Olympia-X 2025 By Schoozy Edutech India's Biggest Olympiad Exam
            </h2>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join Olympia-X 2025 By Schoozy Edutech — India's Trusted, DPIIT Certified Olympiad Exam For Class 8-12
              With Prizes Worth Up To ₹1 Cr. Register Now!
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full"
              >
                Register Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-4 text-lg font-semibold rounded-full bg-transparent"
              >
                😊 Benefit
              </Button>
            </div>
          </div>

          {/* Right Stats */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">₹1 Cr+</div>
                <div className="text-gray-600">Prize Money</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
                <div className="text-gray-600">Participants</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <Award className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">DPIIT</div>
                <div className="text-gray-600">Certified</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">4</div>
                <div className="text-gray-600">Subjects</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
