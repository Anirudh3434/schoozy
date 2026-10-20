"use client"

import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { EXAM_API_BASE } from "@/lib/exam-api"

interface OverviewRow {
  assignment_id: number
  full_name: string
  email: string
  user_id: string
  exam_code: string
  title: string
  status: string
  start_time: string
  end_time: string
  updated_at: string
  attempted: number
  score: number
  violations: number
}

interface Detail {
  assignment: OverviewRow
  answers: {
    question_number: number
    question_id: number
    question_text: string
    selected_option: string
    is_correct: number
    marks_awarded: number
    time_taken: string
    updated_at: string
  }[]
  violations: {
    violation_type: string
    timestamp_ms: number
    severity: string
    description: string
    snapshot_url: string | null
    created_at: string
  }[]
  analysis: { json_response: unknown; created_at: string } | null
}

const statusColor = (s: string) =>
  s === "Active"
    ? "bg-green-100 text-green-800"
    : s === "Suspended"
      ? "bg-red-100 text-red-800"
      : "bg-slate-200 text-slate-700"

export default function ProctorPage() {
  const [rows, setRows] = useState<OverviewRow[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOverview = useCallback(async () => {
    try {
      const res = await axios.get(`${EXAM_API_BASE}/proctor/overview`)
      if (res.data?.success) setRows(res.data.assignments)
      else setError("Failed to load overview")
    } catch {
      setError("Backend unreachable - is it running on :4000?")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOverview()
    const id = setInterval(loadOverview, 15_000) // live refresh
    return () => clearInterval(id)
  }, [loadOverview])

  const openDetail = async (assignmentId: number) => {
    setSelected(assignmentId)
    setDetail(null)
    try {
      const res = await axios.get(`${EXAM_API_BASE}/proctor/detail`, {
        params: { assignment_id: assignmentId },
      })
      if (res.data?.success) setDetail(res.data)
    } catch {
      setError("Failed to load detail")
    }
  }

  if (loading) return <p className="p-8 text-slate-500">Loading proctor overview...</p>

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Proctor Dashboard</h1>
          <button
            onClick={loadOverview}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            Refresh
          </button>
        </div>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="bg-white rounded-xl shadow overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="p-3">Student</th>
                <th className="p-3">Exam</th>
                <th className="p-3">Status</th>
                <th className="p-3">Attempted</th>
                <th className="p-3">Score</th>
                <th className="p-3">Violations</th>
                <th className="p-3">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.assignment_id}
                  onClick={() => openDetail(r.assignment_id)}
                  className={`border-b hover:bg-indigo-50 cursor-pointer ${selected === r.assignment_id ? "bg-indigo-50" : ""}`}
                >
                  <td className="p-3">
                    <div className="font-medium">{r.full_name}</div>
                    <div className="text-xs text-slate-500">{r.email} · {r.user_id}</div>
                  </td>
                  <td className="p-3">{r.exam_code}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">{r.attempted}</td>
                  <td className="p-3">{r.score}</td>
                  <td className="p-3">
                    <span className={r.violations > 0 ? "text-red-600 font-semibold" : ""}>{r.violations}</span>
                  </td>
                  <td className="p-3 text-xs text-slate-500">{new Date(r.updated_at).toLocaleString()}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    No exam sessions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {detail && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-semibold text-slate-800 mb-3">
                Answers - {detail.assignment.full_name} ({detail.assignment.exam_code})
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {detail.answers.map((a) => (
                  <div key={a.question_number} className="text-sm border rounded-lg p-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Q{a.question_number}</span>
                      <span className={a.is_correct ? "text-green-600" : "text-red-600"}>
                        {a.selected_option || "-"} · {a.marks_awarded}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">{a.question_text}</div>
                  </div>
                ))}
                {detail.answers.length === 0 && <p className="text-sm text-slate-500">No answers yet</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-semibold text-slate-800 mb-3">
                Violation timeline ({detail.violations.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {detail.violations.map((v, i) => (
                  <div key={i} className="text-sm border rounded-lg p-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">
                        {v.violation_type}
                      </span>
                      <span className="text-xs text-slate-500">{new Date(v.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{v.description}</p>
                    {v.snapshot_url && (
                      <img src={v.snapshot_url} alt="violation snapshot" className="mt-2 rounded max-h-40" />
                    )}
                  </div>
                ))}
                {detail.violations.length === 0 && <p className="text-sm text-slate-500">No violations recorded</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
