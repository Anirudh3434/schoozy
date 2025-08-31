import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Target, TrendingUp, AlertCircle, CheckCircle, XCircle, Moon, Sun, Award, BookOpen, Brain, Zap } from "lucide-react";

export default function EnhancedReport({data}: {data: any}) {
  // State for theme (light or dark)
  const [theme, setTheme] = useState("light");

  // Sample data (you can replace this with your actual data)


  // Toggle theme and update document class
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Sync theme with system preference on mount
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  if (!data) return <p className="text-gray-600 dark:text-gray-300">No data available</p>;

  const {
    user_name,
    subject,
    class: studentClass,
    basic_stats,
    charts,
    recommendations,
    weak_areas,
    topic_analysis,
    blooms_analysis,
    difficulty_analysis,
    generated_at,
    negative_marking_info,
  } = data;

  // Chart colors for light and dark themes
  const chartColors = {
    light: {
      correct: "#22c55e",
      incorrect: "#ef4444",
      easy: "#22c55e",
      medium: "#f59e0b",
      hard: "#ef4444",
      primary: "#3b82f6",
      secondary: "#10b981",
      accent: "#8b5cf6",
      warning: "#f59e0b",
    },
    dark: {
      correct: "#34d399",
      incorrect: "#f87171",
      easy: "#34d399",
      medium: "#fbbf24",
      hard: "#f87171",
      primary: "#60a5fa",
      secondary: "#4ade80",
      accent: "#a78bfa",
      warning: "#fbbf24",
    },
  };

  const currentColors = theme === "light" ? chartColors.light : chartColors.dark;

  // Prepare chart data
  const bloomsData = charts.blooms_analysis.x.map((x, i) => ({
    name: x,
    accuracy: charts.blooms_analysis.y_accuracy[i],
    color: charts.blooms_analysis.y_accuracy[i] >= 60 ? currentColors.correct : charts.blooms_analysis.y_accuracy[i] >= 40 ? currentColors.medium : currentColors.incorrect,
  }));

  const topicData = charts.topic_performance.x.map((x, i) => ({
    name: x,
    accuracy: charts.topic_performance.y_accuracy[i],
    avg_time: charts.topic_performance.y_avg_time[i],
  }));

  const difficultyData = charts.difficulty_performance.x.map((x, i) => ({
    name: x,
    accuracy: charts.difficulty_performance.y_accuracy[i],
    color: x === "Easy" ? currentColors.easy : x === "Medium" ? currentColors.medium : currentColors.hard,
  }));

  const timePerformanceData = charts.time_vs_performance.x.map((time, i) => ({
    time: time,
    correct: charts.time_vs_performance.y_accuracy[i],
    question: i + 1,
  }));

  const performanceBreakdown = [
    { name: "Correct", value: basic_stats.correct_answers, color: currentColors.correct },
    { name: "Incorrect", value: basic_stats.total_questions - basic_stats.correct_answers, color: currentColors.incorrect },
  ];

  const weakTopicsData = Object.entries(weak_areas.topic_scores).map(([topic, score]) => ({
    topic,
    score: Number(score.toFixed(1)),
    status: score >= 60 ? "good" : score >= 40 ? "fair" : "weak",
  }));

  // Performance level indicator
  const getPerformanceLevel = (accuracy) => {
    if (accuracy >= 80) return { level: "Excellent", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" };
    if (accuracy >= 60) return { level: "Good", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" };
    if (accuracy >= 40) return { level: "Average", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" };
    return { level: "Needs Improvement", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" };
  };

  const performanceLevel = getPerformanceLevel(basic_stats.accuracy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Theme Toggle Button */}
        <div className="flex justify-end">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 shadow-lg"
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>
        </div>

        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Test Analysis Report
              </h1>
              <div className="flex items-center gap-4 mb-2">
                <p className="text-2xl font-semibold">{user_name || "Student"}</p>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">Class {studentClass}</span>
              </div>
              <p className="text-xl opacity-90 capitalize">Subject: {subject}</p>
              <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full ${performanceLevel.bg} ${performanceLevel.color} font-semibold`}>
                <Brain className="w-5 h-5" />
                {performanceLevel.level}
              </div>
            </div>
            <div className="text-right">
              <div className="text-6xl font-black bg-gradient-to-b from-white to-blue-100 bg-clip-text text-transparent">
                {basic_stats.accuracy.toFixed(1)}%
              </div>
              <p className="text-xl font-semibold opacity-90">Overall Accuracy</p>
              <p className="text-sm opacity-70 mt-1">{generated_at || "Today"}</p>
            </div>
          </div>
        </div>

        {/* Alert for Negative Marking */}
        {basic_stats.total_marks_awarded < 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">Negative Marking Alert</h3>
                <p className="text-red-700 dark:text-red-300 mb-3">
                  Your final score is negative due to incorrect answers. Negative marking: {negative_marking_info?.deduction_rate || "1/4 penalty per wrong answer"}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Total Deducted</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{basic_stats.negative_marks_deducted}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Final Score</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{basic_stats.total_marks_awarded}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="rounded-2xl shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{basic_stats.correct_answers}</p>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Correct Answers</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{basic_stats.total_marks_awarded}</p>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Final Score</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{basic_stats.percentage.toFixed(1)}%</p>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Percentage</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{basic_stats.total_questions}</p>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Total Questions</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="rounded-3xl shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                Performance Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {performanceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} questions`, name]}
                    contentStyle={{
                      backgroundColor: theme === "light" ? "#ffffff" : "#1f2937",
                      color: theme === "light" ? "#374151" : "#d1d5db",
                      border: `1px solid ${theme === "light" ? "#e5e7eb" : "#4b5563"}`,
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                Time vs Performance
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={timePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === "light" ? "#e5e7eb" : "#4b5563"} />
                  <XAxis 
                    dataKey="time" 
                    name="Time (min)" 
                    stroke={theme === "light" ? "#374151" : "#d1d5db"} 
                    label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    dataKey="correct" 
                    name="Correct" 
                    domain={[0, 1]} 
                    stroke={theme === "light" ? "#374151" : "#d1d5db"}
                    label={{ value: 'Accuracy', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "correct" ? (value ? "Correct" : "Incorrect") : value,
                      name === "time" ? "Time (min)" : "Result",
                    ]}
                    labelFormatter={(value) => `Question ${timePerformanceData[value]?.question || value}`}
                    contentStyle={{
                      backgroundColor: theme === "light" ? "#ffffff" : "#1f2937",
                      color: theme === "light" ? "#374151" : "#d1d5db",
                      border: `1px solid ${theme === "light" ? "#e5e7eb" : "#4b5563"}`,
                      borderRadius: "12px",
                    }}
                  />
                  <Scatter dataKey="correct" fill={currentColors.primary} fillOpacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bloom's Taxonomy Analysis */}
        <Card className="rounded-3xl shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              Bloom's Taxonomy Analysis
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={bloomsData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "light" ? "#e5e7eb" : "#4b5563"} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  stroke={theme === "light" ? "#374151" : "#d1d5db"}
                  fontSize={12}
                />
                <YAxis domain={[0, 100]} stroke={theme === "light" ? "#374151" : "#d1d5db"} />
                <Tooltip
                  formatter={(value) => [`${value.toFixed(1)}%`, "Accuracy"]}
                  contentStyle={{
                    backgroundColor: theme === "light" ? "#ffffff" : "#1f2937",
                    color: theme === "light" ? "#374151" : "#d1d5db",
                    border: `1px solid ${theme === "light" ? "#e5e7eb" : "#4b5563"}`,
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                  {bloomsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
              {Object.entries(blooms_analysis).map(([level, stats]) => (
                <div key={level} className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-700 dark:to-slate-600 rounded-xl p-4 border border-gray-200 dark:border-slate-500">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{level}</h4>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{(stats.accuracy).toFixed(1)}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{stats.correct_answers}/{stats.total_questions} correct</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Topic Performance Analysis */}
        <Card className="rounded-3xl shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
              Topic Performance Analysis
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={topicData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "light" ? "#e5e7eb" : "#4b5563"} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  stroke={theme === "light" ? "#374151" : "#d1d5db"}
                  fontSize={12}
                />
                <YAxis yAxisId="left" domain={[0, 100]} stroke={theme === "light" ? "#374151" : "#d1d5db"} />
                <YAxis yAxisId="right" orientation="right" stroke={theme === "light" ? "#374151" : "#d1d5db"} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "light" ? "#ffffff" : "#1f2937",
                    color: theme === "light" ? "#374151" : "#d1d5db",
                    border: `1px solid ${theme === "light" ? "#e5e7eb" : "#4b5563"}`,
                    borderRadius: "12px",
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="accuracy"
                  stroke={currentColors.primary}
                  strokeWidth={4}
                  dot={{ fill: currentColors.primary, r: 8, strokeWidth: 2, stroke: "#fff" }}
                  name="Accuracy (%)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avg_time"
                  stroke={currentColors.secondary}
                  strokeWidth={4}
                  dot={{ fill: currentColors.secondary, r: 8, strokeWidth: 2, stroke: "#fff" }}
                  name="Avg Time (min)"
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-8">
              {Object.entries(topic_analysis).map(([topic, stats]) => {
                const isPositive = stats.marks_awarded > 0;
                return (
                  <div key={topic} className={`rounded-xl p-4 border transition-all duration-300 hover:shadow-lg ${
                    isPositive 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700' 
                      : 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-700'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{topic}</h4>
                      {isPositive ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="flex justify-between">
                        <span className="font-medium">Accuracy:</span> 
                        <span className={stats.accuracy > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          {(stats.accuracy).toFixed(1)}%
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="font-medium">Questions:</span> 
                        <span>{stats.correct_answers}/{stats.total_questions}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="font-medium">Time:</span> 
                        <span>{stats.avg_time.toFixed(1)} min</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="font-medium">Score:</span> 
                        <span className={stats.marks_awarded > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          {stats.marks_awarded}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Analysis */}
        <Card className="rounded-3xl shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-yellow-500 to-red-500 rounded-full"></div>
              Difficulty Level Performance
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={difficultyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "light" ? "#e5e7eb" : "#4b5563"} />
                <XAxis dataKey="name" stroke={theme === "light" ? "#374151" : "#d1d5db"} fontSize={14} />
                <YAxis domain={[0, 100]} stroke={theme === "light" ? "#374151" : "#d1d5db"} />
                <Tooltip
                  formatter={(value) => [`${value.toFixed(1)}%`, "Accuracy"]}
                  contentStyle={{
                    backgroundColor: theme === "light" ? "#ffffff" : "#1f2937",
                    color: theme === "light" ? "#374151" : "#d1d5db",
                    border: `1px solid ${theme === "light" ? "#e5e7eb" : "#4b5563"}`,
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="accuracy" radius={[12, 12, 0, 0]}>
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-6 mt-8">
              {Object.entries(difficulty_analysis).map(([level, stats]) => (
                <div key={level} className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 text-center border border-gray-200 dark:border-slate-500 hover:shadow-lg transition-all duration-300">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    level === "Easy" ? "bg-green-100 dark:bg-green-900/30" :
                    level === "Medium" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                    "bg-red-100 dark:bg-red-900/30"
                  }`}>
                    <Zap className={`w-6 h-6 ${
                      level === "Easy" ? "text-green-600 dark:text-green-400" :
                      level === "Medium" ? "text-yellow-600 dark:text-yellow-400" :
                      "text-red-600 dark:text-red-400"
                    }`} />
                  </div>
                  <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">{level}</h4>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{(stats.accuracy).toFixed(1)}%</p>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p>{stats.correct_answers}/{stats.total_questions} correct</p>
                    <p>Avg: {stats.avg_time.toFixed(1)} min</p>
                    <p className={`font-semibold ${stats.marks_awarded > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      Score: {stats.marks_awarded}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weak Areas Analysis */}
        <Card className="rounded-3xl shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mr-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Critical Areas for Improvement</h2>
                <p className="text-gray-600 dark:text-gray-300">Focus on these areas to maximize your score improvement</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-700">
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Weak Topics
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {weak_areas.weak_topics.map((topic) => {
                    const score = weak_areas.topic_scores[topic];
                    return (
                      <div key={topic} className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
                        <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">{topic}</span>
                        <span className="text-red-600 dark:text-red-400 font-bold">
                          {score.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-700">
                <h3 className="text-lg font-bold text-orange-700 dark:text-orange-400 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Cognitive Skills
                </h3>
                <div className="space-y-3">
                  {weak_areas.weak_blooms.map((level) => {
                    const score = weak_areas.blooms_scores[level];
                    return (
                      <div key={level} className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
                        <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">{level}</span>
                        <span className="text-orange-600 dark:text-orange-400 font-bold">
                          {score.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-700">
                <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-400 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Difficulty Levels
                </h3>
                <div className="space-y-3">
                  {weak_areas.weak_difficulties.map((diff) => {
                    const score = weak_areas.difficulty_scores[diff];
                    return (
                      <div key={diff} className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
                        <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">{diff}</span>
                        <span className="text-yellow-600 dark:text-yellow-400 font-bold">
                          {score.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="rounded-3xl shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mr-4">
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Personalized Recommendations</h2>
                <p className="text-gray-600 dark:text-gray-300">AI-powered insights to boost your performance</p>
              </div>
            </div>
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
              <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                {recommendations}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Action Plan */}
        <Card className="rounded-3xl shadow-xl border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-3">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <span>Immediate Action Plan</span>
                <p className="text-sm font-normal text-gray-600 dark:text-gray-300">Next steps for improvement</p>
              </div>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-3">Immediate Focus</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">Stop Guessing</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Avoid random guessing due to negative marking. Skip uncertain questions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">Build Fundamentals</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Start with basic concepts before attempting complex problems.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-3">Study Strategy</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">Coordinate Geometry First</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Your strongest area (50% accuracy). Build confidence here.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">4</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">Practice Tests</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Take regular mock tests focusing on accuracy over speed.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Report generated on {generated_at || "Today"} • Keep practicing and improving! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}