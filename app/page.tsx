import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { TrustedBySection } from "@/components/trusted-by-section";
import { FAQSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";
import { BannerPopup } from "@/components/Banner";
import { NextSeo } from "next-seo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white mt-8">
      {/* ✅ SEO Configuration */}
      <NextSeo
        title="Olympia-X 2025 By Schoozy Edutech | India's Biggest Olympiad Exam"
        description="Join Olympia-X 2025 By Schoozy Edutech — India's Trusted, DPIIT Certified Olympiad Exam For Class 8-12 With Prizes Worth Up To ₹1 Cr. Register Now!"
        canonical="https://schoozy.in/"
        openGraph={{
          url: "https://schoozy.in/",
          title: "Olympia-X 2025 By Schoozy Edutech | India's Biggest Olympiad Exam",
          description:
            "India's Trusted, DPIIT Certified Olympiad Exam For Class 8-12. Win prizes worth up to ₹1 Cr. Register now for Olympia-X 2025!",
          images: [
            {
              url: "https://registeration-docs.s3.us-east-1.amazonaws.com/banner.jpeg",
              width: 1200,
              height: 630,
              alt: "Olympia-X 2025 Olympiad Banner",
            },
          ],
          siteName: "Schoozy Edutech",
        }}
        twitter={{
          handle: "@schoozy",
          site: "@schoozy",
          cardType: "summary_large_image",
        }}
      />

      {/* ✅ Structured Data for Event */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: "Olympia-X 2025 By Schoozy Edutech",
            description:
              "India's Trusted, DPIIT Certified Olympiad Exam for Class 8-12 with prizes worth ₹1 Cr.",
            organizer: {
              "@type": "Organization",
              name: "Schoozy Edutech",
              url: "https://schoozy.in",
            },
            eventAttendanceMode:
              "https://schema.org/OnlineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            startDate: "2025-11-01T09:00",
            endDate: "2025-12-30T17:00",
            location: {
              "@type": "VirtualLocation",
              url: "https://schoozy.in/",
            },
            offers: {
              "@type": "Offer",
              url: "https://schoozy.in/register",
              price: "499",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              validFrom: "2025-08-01T00:00",
            },
          }),
        }}
      />

      <main>
        {/* ✅ Banner popup */}
        <BannerPopup image="https://registeration-docs.s3.us-east-1.amazonaws.com/banner.jpeg" />

        {/* ✅ Page Sections */}
        <HeroSection />
        <ServicesSection />
        <TrustedBySection />
        <FAQSection />
        <Footer />
      </main>
    </div>
  );
}