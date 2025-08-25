import Image from "next/image"

export function TrustedBySection() {
  const partners = [
    {
      name: "DPIIT",
      logo: "https://www.livelaw.in/h-upload/2023/07/27/750x450_483231-dpiit.webp",
    },
    {
      name: "Startup India",
      logo: "https://img.manoramayearbook.in/content/dam/yearbook/learn/world/images/2021/feb/startup-india.jpg",
    },
    {
      name: "ISO Certified",
      logo: "https://www.raagconsultants.co.in/admin-panel/images/blogs/20241228154555721.png",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trusted By
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leading educational institutions across the country trust our programs
          </p>
        </div>

        {/* Partners Grid - Enhanced for better centering */}
        <div className="flex flex-wrap justify-center items-center gap-8 max-w-5xl mx-auto">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 group border border-gray-200 min-w-[200px] min-h-[140px]"
            >
              <div className="w-36 h-28 flex items-center justify-center">
                <Image
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  width={200}
                  height={160}
                  className="object-contain max-h-24 opacity-70 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0 group-hover:scale-105"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Alternative: If you prefer grid layout */}
        {/* 
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 items-center justify-items-center max-w-4xl mx-auto">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 group border border-gray-200 w-full max-w-[220px] h-[140px]"
            >
              <div className="w-36 h-28 flex items-center justify-center">
                <Image
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  width={160}
                  height={110}
                  className="object-contain max-h-24 opacity-70 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0 group-hover:scale-105"
                />
              </div>
            </div>
          ))}
        </div>
        */}
      </div>
    </section>
  )
}

