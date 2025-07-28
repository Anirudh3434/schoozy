import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export function PortfolioSection() {
  const portfolioItems = [
    {
      title: "Mobile App Design",
      category: "UI/UX Design",
      image: "/placeholder.svg?height=300&width=400",
      color: "from-yellow-400 to-orange-500",
    },
    {
      title: "Web Development",
      category: "Development",
      image: "/placeholder.svg?height=300&width=400",
      color: "from-gray-700 to-gray-900",
    },
    {
      title: "Brand Identity",
      category: "Branding",
      image: "/placeholder.svg?height=300&width=400",
      color: "from-blue-400 to-purple-500",
    },
    {
      title: "Landing Page",
      category: "Web Design",
      image: "/placeholder.svg?height=300&width=400",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Dashboard Design",
      category: "UI/UX Design",
      image: "/placeholder.svg?height=300&width=400",
      color: "from-cyan-400 to-blue-500",
    },
    {
      title: "Team Collaboration",
      category: "Photography",
      image: "/placeholder.svg?height=300&width=400",
      color: "from-green-400 to-teal-500",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-6">
            PORTFOLIO
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Our Work — <span className="text-blue-600">Digital Marketing Case Studies</span>
          </h2>
          <div className="max-w-5xl">
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              We Actively Partner With{" "}
              <span className="font-semibold text-gray-900">Forward-Looking Organizations</span> That Recognize A
              Fundamental Truth In Today's Rapidly Evolving Landscape:
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              <span className="font-semibold text-gray-900">
                Embracing And Integrating With The Global Startup Economy Is Not Merely An Option, But A Strategic
                Imperative.
              </span>{" "}
              They Understand That This Dynamic Engagement Is The Most Potent Catalyst To{" "}
              <span className="font-semibold text-gray-900">
                Drive Groundbreaking Innovation, Foster Resilient Growth, And Sustainably Spur Economic Prosperity.
              </span>
            </p>
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item, index) => (
            <Card
              key={index}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-64 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-20`}></div>
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm opacity-90">{item.category}</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
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
            View All Projects
          </Button>
        </div>
      </div>
    </section>
  )
}
