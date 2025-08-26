import { NextSeo } from "next-seo"

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/olympia-x',
      permanent: true, // 301 redirect
    },
  }
}

export default function OlympiaSEO() {
  return (
    <>
      <NextSeo
        title="Olympia | Olympiad Exam | Schoozy Edutech"
        description="Olympia is India’s leading Olympiad exam platform for Class 8-12. Prepare for Olympia, Olympiad, and Olympiad Exam with Schoozy Edutech."
        canonical="https://schoozy.in/olympia-x"
        openGraph={{
          url: "https://schoozy.in/olympia-x",
          title: "Olympia | Olympiad Exam | Schoozy Edutech",
          description:
            "Olympia-X 2025 by Schoozy Edutech is India’s trusted Olympiad exam for Class 8-12 students.",
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
    </>
  )
}