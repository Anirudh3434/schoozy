"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Atom, Dna, Calculator, FlaskConical, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export function ServicesSection() {
  const router = useRouter()

  const services = [
    {
      icon: <Atom className="w-12 h-12 text-blue-600" />,
      title: "Physics-X",
      subtitle: "Olympia X Physics Olympiad Exam",
      description:
        "The Physics-X Olympiad is designed to test students’ understanding of core physics concepts, analytical thinking, and application-based problem-solving at an advanced level.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: <Dna className="w-12 h-12 text-green-600" />,
      title: "Biology-X",
      subtitle: "Olympia X Biology Olympiad Exam",
      description:
        "Biology-X Olympiad evaluates knowledge in cell biology, genetics, human physiology, and biotechnology while fostering scientific reasoning and curiosity in life sciences.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
    },
    {
      icon: <Calculator className="w-12 h-12 text-purple-600" />,
      title: "Math-X",
      subtitle: "Olympia X Mathematics Olympiad Exam",
      description:
        "Math-X Olympiad challenges students with logical reasoning, numerical ability, and higher-order problem-solving skills essential for excelling in competitive exams.",
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: <FlaskConical className="w-12 h-12 text-orange-600" />,
      title: "Chemistry-X",
      subtitle: "Olympia X Chemistry Olympiad Exam",
      description:
        "The Chemistry-X Olympiad focuses on fundamental and advanced concepts of chemistry, testing speed, clarity, and application of principles in real-world problem scenarios.",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
            OUR EXAMS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Schoozy Edutech – <span className="text-blue-600">OLYMPIA X OLYMPIAD</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Olympia X Olympiad is a national-level competitive exam series across Physics, Chemistry, Math, and Biology, designed to nurture problem-solving, reasoning, and academic excellence.
          </p>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className={`group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 ${service.bgColor} overflow-hidden relative`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              ></div>

              <CardHeader className="text-center pb-4 relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{service.title}</CardTitle>
                <CardDescription className="text-sm font-semibold text-gray-600">{service.subtitle}</CardDescription>
              </CardHeader>

              <CardContent className="relative z-10">
                <p className="text-gray-700 text-sm leading-relaxed mb-6">{service.description}</p>

                <Button
                  onClick={() => router.push('/olympia-x')}
                  variant="ghost"
                  className="w-full group-hover:bg-white group-hover:shadow-md transition-all duration-300"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Register for Olympia X Olympiad
          </Button>
        </div>
      </div>
    </section>
  )
}
