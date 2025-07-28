import Image from "next/image"

export function TrustedBySection() {
  const partners = [
    {
      name: "Partner School 1",
      logo: "/placeholder.svg?height=80&width=120",
    },
    {
      name: "Partner School 2",
      logo: "/placeholder.svg?height=80&width=120",
    },
    {
      name: "Partner School 3",
      logo: "/placeholder.svg?height=80&width=120",
    },
    {
      name: "Partner School 4",
      logo: "/placeholder.svg?height=80&width=120",
    },
    {
      name: "Partner School 5",
      logo: "/placeholder.svg?height=80&width=120",
    },
    {
      name: "Partner School 6",
      logo: "/placeholder.svg?height=80&width=120",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Trusted By</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leading educational institutions across the country trust our programs
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300 group"
            >
              <Image
                src={partner.logo || "/placeholder.svg"}
                alt={partner.name}
                width={120}
                height={80}
                className="max-w-full h-auto opacity-70 group-hover:opacity-100 transition-opacity duration-300 filter grayscale group-hover:grayscale-0"
              />
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
            <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
            <div className="text-gray-700 font-medium">Partner Schools</div>
          </div>
          <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
            <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
            <div className="text-gray-700 font-medium">Cities Covered</div>
          </div>
          <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
            <div className="text-4xl font-bold text-green-600 mb-2">15+</div>
            <div className="text-gray-700 font-medium">Years Experience</div>
          </div>
        </div>
      </div>
    </section>
  )
}
