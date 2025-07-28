import { Header } from "../components/Header"
import { ServicesHero } from "../components/services/ServicesHero"
import { ServiceOverview } from "../components/services/ServiceOverview"
import { DigitalServices } from "../components/services/DigitalServices"
import { IMSSection } from "../components/services/IMSSection"
import { PortfolioSection } from "../components/services/PortfolioSection"
import { Footer } from "../components/Footer"

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <ServicesHero />
        <ServiceOverview />
        <DigitalServices />
        <IMSSection />
        <PortfolioSection />
      </main>
      <Footer />
    </div>
  )
}
