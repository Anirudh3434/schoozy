import { Header } from "@/components/header"
import { EventsHero } from "@/components/events/events-hero"
import { EventsList } from "@/components/events/events-list"
import { Footer } from "@/components/footer"

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-white">

      <main>
        <EventsHero />
        <EventsList />
      </main>

    </div>
  )
}
