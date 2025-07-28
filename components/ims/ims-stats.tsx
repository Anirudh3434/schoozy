export function IMSStats() {
  const stats = [
    {
      number: "100+",
      label: "Customer",
      color: "text-blue-600",
    },
    {
      number: "4.8/5",
      label: "Rating",
      color: "text-blue-600",
    },
    {
      number: "8Lac",
      label: "Students Active",
      color: "text-blue-600",
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-6xl md:text-7xl font-bold ${stat.color} mb-4`}>{stat.number}</div>
              <div className="text-xl font-semibold text-gray-900">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
