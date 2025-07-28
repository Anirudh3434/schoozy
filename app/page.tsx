import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { TrustedBySection } from "@/components/trusted-by-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <TrustedBySection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
