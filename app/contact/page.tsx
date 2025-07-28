import { Header } from "@/components/header"
import { ContactHero } from "@/components/contact/contact-hero"
import { ContactForm } from "@/components/contact/contact-form"
import { ContactPartnership } from "@/components/contact/contact-partnership"
import { Footer } from "@/components/footer"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <ContactHero />
        <ContactForm />
        <ContactPartnership />
      </main>
      <Footer />
    </div>
  )
}
