"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

export function IMSFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "How Does The Process Work?",
      answer:
        "Our IMS implementation process begins with understanding your institution's specific needs. We then customize the system, provide training to your staff, and ensure smooth migration of your existing data. Our support team remains available throughout the process.",
    },
    {
      question: "How Far In Advance Should I Schedule My Move?",
      answer:
        "For IMS implementation, we recommend scheduling at least 2-4 weeks in advance. This allows sufficient time for system customization, data migration, staff training, and thorough testing before going live.",
    },
    {
      question: "How Much Does Your Service Cost?",
      answer:
        "Our IMS pricing is flexible and depends on your institution's size, required features, and customization needs. We offer different packages starting from basic plans for small institutions to comprehensive solutions for large educational organizations. Contact us for a personalized quote.",
    },
    {
      question: "What Happens If Something Gets Damaged During My Move?",
      answer:
        "We ensure complete data security and backup during the migration process. In the unlikely event of any data issues, we have multiple backup systems and recovery procedures in place. We also provide comprehensive insurance coverage for your peace of mind.",
    },
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left - FAQ Title */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              You Ask, <span className="text-blue-600">We Answer</span>
            </h2>
          </div>

          {/* Right - FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready To Start? <span className="text-blue-600">Get A Quote Now!</span>
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            As You Have Reached Till Here, Just Click On The Below Button And We Will Be Taking You From There.
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started
          </Button>
        </div>
      </div>
    </section>
  )
}
