import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import ProfilePage from "@/components/profile"


export default function Profile() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
         <ProfilePage/>
      </main>
      <Footer />
    </div>
  )
}
