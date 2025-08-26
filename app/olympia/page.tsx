"use client"
import { NextSeo } from "next-seo"
import { redirect } from "next/navigation"

export default function OlympiaSEO() {
  // Immediately redirect to /olympia-x
  redirect("/olympia-x")

  return (
    <NextSeo
      title="Olympia | Olympiad Exam | Schoozy Edutech"
      description="Olympia is India’s leading Olympiad exam platform for Class 8-12. Prepare for Olympia, Olympiad, and Olympiad Exam with Schoozy Edutech."
      canonical="https://schoozy.in/olympia-x"
      openGraph={{
        url: "https://schoozy.in/olympia-x",
        title: "Olympia | Olympiad Exam | Schoozy Edutech",
        description: "Olympia-X 2025 by Schoozy Edutech is India’s trusted Olympiad exam for Class 8-12 students.",
        images: [
          {
            url: "https://registeration-docs.s3.us-east-1.amazonaws.com/banner.jpeg",
            width: 1200,
            height: 630,
            alt: "Olympia-X Olympiad Exam",
          },
        ],
      }}
    />
  )
}