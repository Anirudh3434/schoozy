import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Monitor, Users, BookOpen, BarChart } from "lucide-react"

export function IMSSection() {
  const imsFeatures = [
    {
      icon: <Monitor className="w-8 h-8 text-blue-600" />,
      title: "Institute Management System (IMS)",
      description: "Handle Everything From Attendance To Academics Under One Roof",
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Student Management",
      description: "Comprehensive student data management and tracking system",
    },
    {
      icon: <BookOpen className="w-8 h-8 text-purple-600" />,
      title: "Academic Management",
      description: "Streamlined academic processes and curriculum management",
    },
    {
      icon: <BarChart className="w-8 h-8 text-orange-600" />,
      title: "Performance Analytics",
      description: "Advanced analytics and reporting for better insights",
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-6">
              Our Blend Of Experience
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Business <span className="text-blue-600">Success</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Starting A Business Should Be Simple. We Believe In The Power Of Business Startup To Change Lives And
              Change The World.
            </p>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </Button>
          </div>

          {/* Right IMS Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {imsFeatures.map((feature, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4 mx-auto">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
