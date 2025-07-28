import { Header } from "@/components/header"
import { IMSHero } from "@/components/ims/ims-hero"
import { IMSFeatures } from "@/components/ims/ims-features"
import { IMSStats } from "@/components/ims/ims-stats"
import { IMSTestimonials } from "@/components/ims/ims-testimonials"
import { IMSFAQ } from "@/components/ims/ims-faq"
import { Footer } from "@/components/footer"

export default function IMSPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <IMSHero />
        <IMSFeatures />
        <IMSStats />
        <IMSTestimonials />
        <IMSFAQ />
      </main>
      <Footer />
    </div>
  )
}
