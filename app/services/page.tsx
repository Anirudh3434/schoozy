import { Header } from "@/components/header"
import { ServicesHero } from "@/components/services/services-hero"
import { ServiceOverview } from "@/components/services/service-overview"
import { DigitalServices } from "@/components/services/digital-services"
import { IMSSection } from "@/components/services/ims-section"
import { PortfolioSection } from "@/components/services/portfolio-section"
import { Footer } from "@/components/footer"

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">

      <main>
        <ServicesHero />
        <ServiceOverview />
        <DigitalServices />
        <IMSSection />
        <PortfolioSection />
      </main>
   
    </div>
  )
}
