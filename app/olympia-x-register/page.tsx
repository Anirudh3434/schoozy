import { Header } from "@/components/header"
import { RegisterHero } from "@/components/register/register-hero"
import { Footer } from "@/components/footer"
import OlympiaXRegistrationForm from "@/components/register/Form"

export default function OlympiaXRegister() {
  return (
    <div className="min-h-screen bg-white">

      <main>
        <RegisterHero />
        <OlympiaXRegistrationForm/>
      </main>
  
    </div>
  )
}
