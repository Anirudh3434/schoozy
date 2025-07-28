import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart3, MapPin, CreditCard, Database, Wrench } from "lucide-react"

export function IMSFeatures() {
  const features = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Attendance Monitoring",
      description: "Announcements & Notices, Assignments & Circulars, Event Management.",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-green-600" />,
      title: "Admin Dashboards",
      description:
        "Powerful and user-friendly admin dashboards to manage your data, users, and operations in one place. Designed for speed, control, and real-time insights.",
    },
    {
      icon: <MapPin className="w-8 h-8 text-purple-600" />,
      title: "Bus Location Tracking",
      description: "Notifications to parents regarding bus pickup and drop.",
    },
    {
      icon: <CreditCard className="w-8 h-8 text-orange-600" />,
      title: "Cashless Service",
      description: "Secure and convenient cashless payment solutions for fees and services.",
    },
    {
      icon: <Database className="w-8 h-8 text-cyan-600" />,
      title: "Storage Services",
      description: "Comprehensive data storage and management solutions for all institutional needs.",
    },
    {
      icon: <Wrench className="w-8 h-8 text-red-600" />,
      title: "Furniture Assembly",
      description: "Professional furniture assembly and setup services for educational institutions.",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Smart Management. <span className="text-blue-600">Seamless Learning.</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our All-In-One Institute Management System Is Designed To Simplify Operations And Enhance Communication
            Across Schools And Coaching Centers. Available On Android, iOS, And Web Platforms, It Centralizes All
            Academic And Administrative Processes In A User-Friendly Dashboard.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200"
            >
              <CardHeader className="pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
