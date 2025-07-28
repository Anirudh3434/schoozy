import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function IMSTestimonials() {
  const testimonials = [
    {
      name: "Codey Joyner",
      company: "UrbanAcres, LLC",
      rating: 5,
      review:
        "My Move Was Way Less Stressful Than Expected! Movely Packed Everything, Stored It For A Week, And Moved It All To My New Home Just As Promised!",
    },
    {
      name: "Eren Hill",
      company: "H&H Legal Partners",
      rating: 5,
      review:
        "Movely Provided A Very Professional Service When We Moved Offices Last Month. They Were Easy To Work With And Moved Everything On Time.",
    },
    {
      name: "Emanuel Sadler",
      company: "SavvyMarket",
      rating: 5,
      review:
        "Best Experience Ever! I Desperately Needed A Mover To Help With A Last Minute Relocation, And Movely Was So Helpful In Making It A Seamless Process!",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-6">
            OUR HAPPY CUSTOMERS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            We've Helped Thousands Of <span className="text-blue-600">People Move</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{testimonial.name}</h3>
                  <p className="text-gray-600 mb-4">{testimonial.company}</p>

                  {/* Star Rating */}
                  <div className="flex space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">{testimonial.review}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
