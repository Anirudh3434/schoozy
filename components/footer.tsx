import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
            
              <div>
                <h3 className="text-xl font-bold">Schoozy Edutech</h3>
                <p className="text-sm text-gray-400">Private Limited</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Empowering students through innovative educational programs and scholarship examinations. Discovering
              academic talents and uplifting futures since our inception.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/schoozy.in/"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
             
              <a
                href="https://www.instagram.com/schoozy.in?igsh=MXB3aDY3ZDNyeHB0cg=="
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/schoozy-psm/"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Home
                </a>
              </li>
              <li>
                <a href="/services" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Services
                </a>
              </li>
              <li>
                <a href="/olympia-x" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Olympia X
                </a>
              </li>
              <li>
                <a href="/ims" className="text-gray-300 hover:text-white transition-colors duration-200">
                  IMS
                </a>
              </li>
             
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">info@schoozy.in</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">+91-9817939901</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                <p className="text-gray-300">
                   Schoozy Edutech Pvt Ltd, Plot No.
                    378, Industrial Area, Phase 8B, Sector 74,
                    Mohali, Punjab, 160074.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 Schoozy Edutech Private Limited. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://profound-youtiao-4ab60d.netlify.app" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="https://illustrious-alpaca-6e42db.netlify.app" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Terms of Service
            </a>
            <a href="https://illustrious-alpaca-6e42db.netlify.app" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Cookie Policy
            </a>

            <a href="https://extraordinary-melomakarona-afd5de.netlify.app" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
              Cancellation Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

