export function ContactPartnership() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Collaborating With <span className="text-blue-600">Institutions & Partners</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              At Schoozy, We Believe In Building Strong Partnerships With Schools, Educators, And Academic Leaders. Our
              Journey Begins With A Collaborative Conversation To Deeply Understand Your Institution's Goals,
              Challenges, And Vision. Together, We Co-Create Tailored Solutions—Whether It's Olympiad Programs, School
              Websites, Or Digital Growth Strategies—That Drive Meaningful Outcomes.
            </p>
          </div>

          {/* Right - Map */}
          <div className="relative">
            <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3430.2891234567!2d76.7234567!3d30.7234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDQzJzI0LjQiTiA3NsKwNDMnMjQuNCJF!5e0!3m2!1sen!2sin!4v1234567890123"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-96"
              ></iframe>
            </div>
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <h4 className="font-bold text-gray-900 mb-1">Schoozy Edutech Private Limited</h4>
              <p className="text-sm text-gray-600">
                Plot no 378, Industrial Area, Phase 8B, Mohali, Thanesar, Punjab 160074
              </p>
              <button className="text-blue-600 text-sm font-medium mt-2 hover:underline">Directions</button>
              <button className="text-blue-600 text-sm font-medium mt-1 block hover:underline">View larger map</button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Let's Connect And Build The Future Of <span className="text-blue-600">Education Together</span>
          </h3>
        </div>
      </div>
    </section>
  )
}
