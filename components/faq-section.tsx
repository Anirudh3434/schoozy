"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const router = useRouter()
  const faqs = [
    {
      question: "What Is Schoozy Edutech Pvt. Ltd.?",
      answer:
        "Schoozy Edutech Private Limited is a leading educational technology company that specializes in conducting scholarship examinations and providing comprehensive academic preparation programs for students in classes 8-12. We focus on discovering and nurturing academic talents through our innovative OLYMPIA program.",
    },
    {
      question: "What Is OLYMPIA-X?",
      answer:
        "OLYMPIA-X is our flagship scholarship examination program designed for students in classes 8-10 and 11-12. It covers four core subjects: Physics, Biology, Mathematics, and Chemistry. The program includes comprehensive preparation modules, practice tests, and strategic problem-solving techniques to help students excel in competitive examinations.",
    },
    {
      question: "Who Can Participate In OLYMPIA-X?",
      answer:
        "OLYMPIA-X is open to all students studying in classes 8 to 10 and 11 to 12 from any recognized educational board. Students can participate individually or through their schools. We welcome participants from CBSE, ICSE, State Boards, and other recognized educational systems.",
    },
    {
      question: "How Can A School Partner With Schoozy?",
      answer:
        "Schools can partner with Schoozy Edutech by contacting our partnership team. We offer comprehensive collaboration programs that include conducting examinations at your school, providing preparation materials, teacher training sessions, and student mentorship programs. Our partnership model is designed to enhance the overall academic excellence of your institution.",
    },
    {
      question: "What Are The Benefits Of OLYMPIA-X Program?",
      answer:
        "The OLYMPIA-X program offers numerous benefits including scholarship opportunities, comprehensive subject mastery, competitive exam preparation, performance analysis, strategic problem-solving skills, and recognition certificates. Students also gain access to our expert faculty, study materials, and online learning platform.",
    },
    {
      question: "How Do I Register For The Examination?",
      answer:
        "Registration for OLYMPIA-X can be done online through our website or through your school if they are our partner institution. Simply click on the 'Register' button, fill out the required information, select your preferred subjects and examination center, and complete the payment process. Early bird discounts are available for timely registrations.",
    },
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">Find answers to common questions about our programs and services</p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <button
                className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>

              {openIndex === index && (
                <div className="px-8 pb-6">
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">Still have questions? We're here to help</p>
          <button onClick={()=> router.push("/contact")} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-colors duration-300">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  )
}
