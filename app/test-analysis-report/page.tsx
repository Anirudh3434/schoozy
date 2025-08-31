"use client";
import Report from "@/components/exam/report";
import axios from "axios";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function TestAnalysisReport() {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:4000/exam/analysis-report", {
        withCredentials: true,
        params: {
          user_id: "UID_6cf8d232",
        },
      });

      console.log("API Response:", response.data);

      if (response.data.analysis && response.data.analysis.length > 0) {
        setData(response.data.analysis[0].json_response);
      } else {
        setError("No analysis record found for this user.");
      }
    } catch (err) {
      setError("Failed to fetch analysis report. Please try again later.");
      console.error("Error fetching report:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh] text-center px-6">
        <div className="bg-red-50 p-6 rounded-2xl shadow-lg max-w-md w-full">
          <AlertTriangle className="text-red-500 w-30 ch-30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="text-center text-gray-500 mt-10">Loading report...</p>;
  }

  return <Report data={data} />;
}