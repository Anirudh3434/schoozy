import { Header } from "@/components/header"
import { OlympiaHero } from "@/components/olympia/olympia-hero"
import { OlympiaOverview } from "@/components/olympia/olympia-overview"
import { SubjectSections } from "@/components/olympia/subject-sections"
import { ExamDetails } from "@/components/olympia/exam-details"
import { ContactSection } from "@/components/olympia/contact-section"
import { Footer } from "@/components/footer"

export default function OlympiaXPage() {
  return (
    <div className="min-h-screen bg-white">

      <main>
        <OlympiaHero />
        <OlympiaOverview />
        <SubjectSections />
        <ExamDetails />
      </main>
     
    </div>
  )
}
