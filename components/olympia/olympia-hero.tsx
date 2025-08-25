"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"

export function OlympiaHero() {
  const router = useRouter()
  const isMobile = useIsMobile()

  return (
    <section className="relative h-[60vh] w-full overflow-hidden bg-[#F9FAFB]">
      {/* Background Image */}
      <img
        src={
          isMobile
            ? "https://registeration-docs.s3.us-east-1.amazonaws.com/Blue+and+Yellow+Professional+Geometry+Digital+Marketing+Strategies+Outdoor+Banner++(9).webp"
            : "https://registeration-docs.s3.us-east-1.amazonaws.com/Blue+and+Yellow+Professional+Geometry+Digital+Marketing+Strategies+Outdoor+Banner++(8).webp"
        }
        alt="Olympia Banner"
        className="absolute inset-0 w-full h-full object-contain object-contain"
      />

    </section>
  )
}
