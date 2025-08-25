import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"
import ClientLayout from "./client-layout"

export const metadata: Metadata = {
  title: "Olympia-X 2025 – Schoozy Edutech Olympiad Exam",
  description:
    "Join Olympia-X 2025 by Schoozy Edutech – India’s premier Olympiad Exam for Classes 8–12. Win prizes worth up to ₹1 Cr, laptops, certificates, and nationwide recognition!",
  keywords:
    "Schoozy Edutech, scholarship exams, Olympia-X 2025, Olympia X exam, student scholarships, national olympiad 2025, olympiad for class 8, olympiad for class 9, olympiad for class 10, olympiad for class 11, olympiad for class 12, Olympia-X subjects, Physics Olympiad 2025, Chemistry Olympiad 2025, Math Olympiad 2025, Biology Olympiad 2025, science olympiad India, maths olympiad India, student competitions India, online olympiad exam, academic scholarships, education platform India, school scholarship exams 2025, competitive exams for students, talent exams India, OLP program, scholarship program 2025 , CBSE , ICSE , State Board , Sample Paper",
  openGraph: {
    title: "Schoozy Edutech – Uplifting Futures",
    description:
      "Scholarship exam program for classes 8 to 12. Join 10,000+ students nationwide.",
    url: "https://schoozy.in",
    siteName: "Schoozy Edutech",
    images: [
      {
        url: "/favicon.png", // use the favicon image or OG banner
        width: 1200,
        height: 630,
        alt: "Schoozy Scholarship Program",
      },
    ],
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Fonts */}
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />

        {/* Meta Tags for SEO */}
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
        <Toaster />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FWH11SCDCG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FWH11SCDCG');
          `}
        </Script>

        {/* Schema.org Structured Data */}
        <Script id="schema" type="application/ld+json" strategy="afterInteractive">
          {`
          {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "Olympia-X 2025 by Schoozy Edutech",
            "startDate": "2025-09-01T09:00:00+05:30",
            "endDate": "2025-09-30T18:00:00+05:30",
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
            "description": "${metadata.description}",
            "url": "https://schoozy.in/olympia-x",
            "image": "/favicon.png",
            "organizer": {
              "@type": "Organization",
              "name": "Schoozy Edutech",
              "url": "https://schoozy.in"
            },
            "offers": {
              "@type": "Offer",
              "url": "https://schoozy.in/register",
              "price": "0",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "validFrom": "2025-08-01T00:00:00+05:30"
            }
          }
          `}
        </Script>
      </body>
    </html>
  )
}
