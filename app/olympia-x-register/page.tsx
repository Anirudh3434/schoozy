import { Header } from "@/components/header"
import { RegisterHero } from "@/components/register/register-hero"
import { Footer } from "@/components/footer"
import OlympiaXRegisterPage from "@/components/register/Form"

export default function OlympiaXRegister() {
  return (
    <div className="min-h-screen bg-white">

      <main>
        <RegisterHero />
        <OlympiaXRegisterPage/>
      </main>
  
    </div>
  )
}
