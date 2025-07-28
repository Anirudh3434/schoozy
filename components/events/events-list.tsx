import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, MapPin } from "lucide-react"
import Image from "next/image"

export function EventsList() {
  const events = [
    {
      id: 1,
      title: 'Schoozy, Will Be Presenting A Seminar On "Driving Academic Excellence Through Digital Innovation".',
      date: "11th, 12th And 13th April, 2025",
      location: "Indore, Madhya Pradesh",
      image: "/placeholder.svg?height=400&width=600",
      description:
        "Join us for an insightful seminar on how digital innovation is transforming academic excellence. Learn about the latest educational technologies, digital learning strategies, and innovative approaches to enhance student outcomes.",
    },
    {
      id: 2,
      title: "OLYMPIA-X 2025 National Finals",
      date: "25th, 26th And 27th May, 2025",
      location: "New Delhi",
      image: "/placeholder.svg?height=400&width=600",
      description:
        "The grand finale of OLYMPIA-X 2025, where the brightest minds from across India compete for the ultimate academic recognition and prizes worth ₹1 Crore.",
    },
    {
      id: 3,
      title: "Institute Management System Workshop",
      date: "15th And 16th June, 2025",
      location: "Mumbai, Maharashtra",
      image: "/placeholder.svg?height=400&width=600",
      description:
        "A comprehensive workshop for educational institutions on implementing and maximizing the benefits of our Institute Management System for streamlined operations.",
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
            >
              {/* Event Image */}
              <div className={`${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                <Card className="overflow-hidden shadow-xl border-0">
                  <div className="relative h-96">
                    <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                  </div>
                </Card>
              </div>

              {/* Event Content */}
              <div className={`${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{event.title}</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-medium">{event.date}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                </div>

                <p className="text-lg text-gray-600 leading-relaxed mb-8">{event.description}</p>

                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Registration Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Don't Miss Our <span className="text-blue-600">Upcoming Events</span>
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Stay updated with our latest events, seminars, and workshops designed to enhance educational excellence and
            digital innovation.
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            View All Events
          </Button>
        </div>
      </div>
    </section>
  )
}
