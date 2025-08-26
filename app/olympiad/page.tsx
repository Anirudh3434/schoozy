import { NextSeo } from "next-seo"

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/olympia-x',
      permanent: true,
    },
  }
}

export default function OlympiadSEO() {
  return (
    <>
      <NextSeo
        title="Olympiad | Competitive Exam | Schoozy Edutech"
        description="Prepare for Olympiad exams in India with Schoozy Edutech. Olympia-X 2025 provides study material, practice tests, and guidance for students."
        canonical="https://schoozy.in/olympia-x"
        openGraph={{
          url: "https://schoozy.in/olympia-x",
          title: "Olympiad | Competitive Exam | Schoozy Edutech",
          description:
            "Prepare for Olympiad exams with Schoozy Edutech. Olympia-X 2025 is India’s trusted Olympiad platform.",
          images: [
            {
              url: "https://registeration-docs.s3.us-east-1.amazonaws.com/banner.jpeg",
              width: 1200,
              height: 630,
              alt: "Olympiad Exam",
            },
          ],
        }}
      />
    </>
  )
}