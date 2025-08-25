import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { TrustedBySection } from "@/components/trusted-by-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { BannerPopup } from "@/components/Banner"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white mt-8">
      <main>
        {/* Responsive banner with desktop, tablet & mobile images */}
     


        {/* Banner popup placed immediately after */}
        <BannerPopup image="https://registeration-docs.s3.us-east-1.amazonaws.com/banner.jpeg" />

        {/* Page sections */}
        <HeroSection />
        <ServicesSection />
        <TrustedBySection />
        <FAQSection />
     
      </main>
    </div>
  )
}

