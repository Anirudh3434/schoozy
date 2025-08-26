import { NextSeo } from "next-seo"

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/olympia-x',
      permanent: true,
    },
  }
}

export default function OlympiadExamSEO() {
  return (
    <>
      <NextSeo
        title="Olympiad Exam | Olympia-X 2025 | Schoozy Edutech"
        description="Get ready for Olympiad Exams 2025 with Schoozy Edutech. Explore Olympia-X, syllabus, registration process, and preparation tips for students."
        canonical="https://schoozy.in/olympia-x"
        openGraph={{
          url: "https://schoozy.in/olympia-x",
          title: "Olympiad Exam | Olympia-X 2025 | Schoozy Edutech",
          description:
            "India’s most trusted Olympiad Exam for Class 8-12. Register now for Olympia-X 2025 by Schoozy Edutech.",
          images: [
            {
              url: "https://registeration-docs.s3.us-east-1.amazonaws.com/banner.jpeg",
              width: 1200,
              height: 630,
              alt: "Olympiad Exam 2025",
            },
          ],
        }}
      />
    </>
  )
}