'use client'

import { useState, useEffect } from 'react'
import { Users, TrendingUp, Calendar, Star, Clock } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'

type AnalyticsData = {
  today: number
  week: number
  month: number
  totalCustomers: number
  activeQueue: number
  pendingAppointments: number
  rating: number
  dailyData: { date: string; customers: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm">
        <p className="font-bold text-gray-300 mb-1">{label}</p>
        <p className="font-black text-red-400">{payload[0].value} customers</p>
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsData | null>(null)
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

  const StatCard = ({ title, value, icon, gradient, sub }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition group">
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</p>
        <h3 className="text-4xl font-black text-gray-900 mt-2">{value}</h3>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
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

  if (!stats) return null

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">Analytics</h1>
        <p className="text-gray-500 font-medium">Deep dive into your business growth and traffic.</p>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Served Today"
          value={stats.today}
          icon={<Users className="w-8 h-8" />}
          gradient="from-red-600 to-red-400"
          sub="completed queue items"
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

      {/* Status + Rating Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Live Queue</p>
          <p className="text-3xl font-black text-red-600">{stats.activeQueue}</p>
          <p className="text-xs text-gray-400 mt-1">in queue now</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pending Appts</p>
          <p className="text-3xl font-black text-amber-600">{stats.pendingAppointments}</p>
          <p className="text-xs text-gray-400 mt-1">awaiting confirmation</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Avg Rating</p>
          <p className="text-3xl font-black text-yellow-500 flex items-center justify-center gap-1">
            {stats.rating.toFixed(1)} <Star className="w-6 h-6 fill-current" />
          </p>
          <p className="text-xs text-gray-400 mt-1">out of 5.0</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">All-Time</p>
          <p className="text-3xl font-black text-gray-900">{stats.totalCustomers}</p>
          <p className="text-xs text-gray-400 mt-1">customers served</p>
        </div>
      </div>

      {/* Area Chart — 7-Day Trend */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">7-Day Customer Trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={stats.dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="customerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="customers"
              stroke="#dc2626"
              strokeWidth={3}
              fill="url(#customerGrad)"
              dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#dc2626' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart — Same data, different view */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Daily Volume (Bar View)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="customers" fill="#dc2626" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
