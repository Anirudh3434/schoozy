import { Button } from "@/components/ui/button"

export function OlympiaHero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] bg-cover bg-center opacity-30"></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
        {/* Main Title */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-4 tracking-wider">
            <span
              className="text-white drop-shadow-2xl"
              style={{
                textShadow: "4px 4px 8px rgba(0,0,0,0.8), -1px -1px 0px rgba(255,255,255,0.1)",
                filter: "contrast(1.2)",
              }}
            >
              OLYMPIA-X
            </span>
          </h1>
          <div className="text-2xl md:text-4xl font-bold text-cyan-300 mb-2 tracking-widest">2025</div>
        </div>

        {/* Subtitle */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-cyan-300 mb-4 tracking-wide">
            INDIA'S BIGGEST TALENT HUNT EXAM
          </h2>
          <p className="text-xl md:text-2xl text-gray-200 font-semibold">
            For Classes 8 to 12 | Nationwide Competition
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            Register Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-12 py-6 text-xl font-bold rounded-full transition-all duration-300 bg-transparent backdrop-blur-sm"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}
