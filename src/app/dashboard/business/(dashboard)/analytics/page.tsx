'use client'

import { useState, useEffect } from 'react'
import { Users, TrendingUp, Calendar } from 'lucide-react'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const StatCard = ({ title, value, icon, gradient }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition group">
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</p>
        <h3 className="text-4xl font-black text-gray-900 mt-2">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">Analytics</h1>
        <p className="text-gray-500 font-medium">Deep dive into your business growth and traffic.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Today"
          value={stats.today}
          icon={<Users className="w-8 h-8" />}
          gradient="from-red-600 to-red-400"
        />
        <StatCard
          title="This Week"
          value={stats.week}
          icon={<TrendingUp className="w-8 h-8" />}
          gradient="from-gray-900 to-gray-700"
        />
        <StatCard
          title="This Month"
          value={stats.month}
          icon={<Calendar className="w-8 h-8" />}
          gradient="from-red-900 to-red-700"
        />
      </div>

      {/* Placeholder for future charts */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        <p className="text-gray-400">Detailed charts coming soon...</p>
      </div>
    </div>
  )
}
