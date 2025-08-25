"use client"
import Image from "next/image"

const coverageLinks = [
  {
    name: "Loktej English",
    url: "https://english.loktej.com/article/20134/schoozy-launches-nation-wide-academic-revolution-with-olympia-x-2025?utm_source=JioNews&utm_medium=referral&utm_campaign=JioNews",
    logo: "",
    headline: "Schoozy Launches Nation-Wide Academic Revolution with Olympia-X 2025",
  },
  {
    name: "Dailyhunt",
    url: "https://m.dailyhunt.in/news/india/english/loktej%2Benglish-epaper-loktejen/schoozy%2Blaunches%2Bnationwide%2Bacademic%2Brevolution%2Bwith%2Bolympiax%2B2025-newsid-n674620541?sm=Y",
    logo: "",
    headline: "Olympia-X 2025: Schoozy Brings New Era of Talent Hunt",
  },
  {
    name: "Rajasthan Journal",
    url: "https://rajasthanjournal.com/education/schoozy-launches-nation-wide-academic-revolution-with-olympia-x-2025/",
    logo: "",
    headline: "Schoozy’s Olympia-X 2025 Sparks Academic Revolution Nationwide",
  },
  {
    name: "UP18 News",
    url: "https://up18news.com/schoozy-launches-nation-wide-academic-revolution-with-olympia-x-2025/",
    logo: "",
    headline: "Schoozy Launches Olympia-X 2025 for Students Across India",
  },
  {
    name: "Republic Bytes",
    url: "https://republicbytes.com/schoozy-edutech-unveils-olympia-x-2025-shaping-the-future-of-academic-competitions-in-india",
    logo: "",
    headline: "Olympia-X 2025: Schoozy Edutech Shaping the Future of Academic Competitions",
  },
  {
    name: "Google News",
    url: "https://news.google.com/search?q=Schoozy+Launches+Nation-Wide+Academic+Revolution+with+Olympia-X+2025&hl=en-IN&gl=IN&ceid=IN:en",
    logo: "", // no channel logo here
    headline: "Read aggregated coverage of Olympia-X 2025 across multiple publications",
    isGoogle: true, // flag for special style
  },
]

export default function PressReleasePage() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            PRESS RELEASE
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Schoozy’s <span className="text-blue-600">Olympia-X 2025</span> in the News
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Explore how leading publications are covering Schoozy’s nationwide academic revolution
          </p>
        </div>

        {/* Coverage Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {coverageLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 p-8"
            >
              <div className="flex justify-center mb-4">
           
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-2xl font-bold">
                    📰
                  </div>
               
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center group-hover:text-blue-600">
                {link.name}
              </h3>
              <p className="mt-2 text-sm text-gray-600 text-center leading-snug">
                {link.headline}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
