// Base URL for the exam API consumed by the exam flow pages/components.
//
// Defaults to the local backend (http://localhost:4000/exam).
// To point back at production, set:
//   NEXT_PUBLIC_EXAM_API_BASE=https://schoozy.in/api/exam
export const EXAM_API_BASE =
  process.env.NEXT_PUBLIC_EXAM_API_BASE ?? "http://localhost:4000/exam";
