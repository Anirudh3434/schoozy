import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
// app/page.tsx
export const metadata = {
  title: "Schoozy Edutech – Scholarship Platform for Students",
  description: "Join Schoozy Edutech’s scholarship programs for students in grades 8–12. Discover your true potential and earn rewards through exciting challenges.",
  keywords: "Schoozy Edutech, scholarship exams, student scholarships, class 8, class 9, class 10, class 11, class 12, education platform",
  openGraph: {
    title: "Schoozy Edutech – Uplifting Futures",
    description: "Scholarship exam program for classes 8 to 12. Join 10,000+ students nationwide.",
    url: "https://schoozy.in",
    siteName: "Schoozy Edutech",
    images: [
      {
        url: "https://schoozy.in/og-image.jpg", // Change to your actual image
        width: 1200,
        height: 630,
        alt: "Schoozy Scholarship Program",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Schoozy Edutech",
    description: "India’s leading scholarship program for school students.",
    images: ["https://schoozy.in/og-image.jpg"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
       <Header/>
      <body>{children}</body>
       <Footer/>
    </html>
  )
}
