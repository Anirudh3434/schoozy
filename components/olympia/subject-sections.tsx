"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export function SubjectSections() {
  const router = useRouter()

  const subjects = [
    {
      id: "physics",
      title: "Physics-X",
      logo: "https://registeration-docs.s3.us-east-1.amazonaws.com/phyiscs.png",
      description:
        "Step into the world of motion, energy, and matter! The Physics Olympiad under OLYMPIA-X challenges logic, concept clarity, and application skills. Designed for Classes 8–12, it covers mechanics, electricity, optics, and more — perfect for aspiring engineers and scientists.",
      buttonText: "Physics Syllabus",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "chemistry",
      title: "Chem-X",
      logo: "https://registeration-docs.s3.us-east-1.amazonaws.com/chemistry.png",
      description:
        "Unleash the scientist within! Chem-X dives into physical, organic, and inorganic chemistry. This national-level Olympiad helps NEET/JEE aspirants test concepts, reactions, and logic beyond textbooks. Classes 8–12 only.",
      buttonText: "Chemistry Syllabus",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "math",
      title: "Math-X",
      logo: "https://registeration-docs.s3.us-east-1.amazonaws.com/maths.png",
      description:
        "Solve, analyze, and win! Math-X covers algebra, geometry, trigonometry, and calculus. Ideal for Olympiad and competitive exam aspirants from Classes 8–12. Hone logical thinking and problem-solving skills.",
      buttonText: "Math Syllabus",
      color: "from-purple-500 to-violet-500",
    },
    {
      id: "biology",
      title: "Biology",
      logo: "https://registeration-docs.s3.us-east-1.amazonaws.com/bio.png",
      description:
        "Explore the wonders of life sciences! The Biology Olympiad spans cell biology, human physiology, and genetics. Designed for NEET aspirants and students from Classes 8–12. Compete nationally and win scholarships.",
      buttonText: "Biology Syllabus",
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your <span className="text-blue-600">Subject</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive Olympiad programs designed for academic excellence.
          </p>
        </div>

        <div className="space-y-20">
          {subjects.map((subject, index) => (
            <div
              key={subject.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
              }`}
            >
              {/* Image */}
              <div className={`${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                <Card className=" border-0 transition-all duration-300">
                  <img
                    src={subject.logo}
                    alt={`${subject.title} Logo`}
                    className="w-full h-auto object-contain"
                  />
                </Card>
              </div>

              {/* Content */}
              <div className={`${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
                <span className="text-blue-600 font-semibold text-lg mb-2 block">Schoozy</span>
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{subject.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-8 text-lg">{subject.description}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => router.push("/olympia-x-register")}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full"
                  >
                    Register Now
                  </Button>
                  {/* Optional syllabus button
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-4 text-lg font-semibold rounded-full bg-transparent"
                  >
                    {subject.buttonText}
                  </Button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
