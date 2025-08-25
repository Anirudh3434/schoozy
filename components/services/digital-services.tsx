import { Database, Trophy, GraduationCap } from "lucide-react"

export function DigitalServices() {
  const services = [
    {
      icon: <Database className="w-8 h-8 text-orange-600" />,
      title: "IMS",
      progress: 95,
      color: "bg-orange-600",
    },
    {
      icon: <Trophy className="w-8 h-8 text-blue-600" />,
      title: "Olympia-X",
      progress: 90,
      color: "bg-blue-600",
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-green-600" />,
      title: "Student Counseling",
      progress: 85,
      color: "bg-green-600",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-6">
              OUR SERVICES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Empowering Education And Growth With Our{" "}
              <span className="text-blue-600">Core Services</span>
            </h2>

            {/* Services List */}
            <div className="space-y-6">
              {services.map((service, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">{service.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {service.title}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {service.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${service.color} transition-all duration-1000`}
                        style={{ width: `${service.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://registeration-docs.s3.us-east-1.amazonaws.com/image.png')] bg-cover bg-center opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
