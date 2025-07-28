import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Shield, LifeBuoy } from "lucide-react"

export function ServiceOverview() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            We Aim To Celebrate Academic Brilliance And Turn It Into National Recognition—
            <span className="text-blue-600"> Backed By Smart, Tailored Solutions For Educational Growth.</span>
          </h2>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
                <Lightbulb className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Work With Us</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 leading-relaxed">
                Join Hands With Schoozy To Empower Students And Schools Through Innovative Olympiads, Tech-Enabled
                Tools, And Customized Digital Solutions. Let's Create Impactful Learning Together.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 mx-auto">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Our Process</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 leading-relaxed">
                We Begin By Understanding Your Institution's Academic Goals. Through Collaboration, We Tailor Our
                Olympiad Programs, Management Systems, And Digital Services To Suit Your Needs.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 mx-auto">
                <LifeBuoy className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">How We Help</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 leading-relaxed">
                Schoozy Supports Schools And Students With Academic Competitions, Smart Tech Platforms, And Digital
                Growth Tools—Ensuring Better Learning Outcomes And Institutional Success.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
