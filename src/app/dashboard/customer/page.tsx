'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  Search,
  User,
  Video,
  CheckCircle2,
  Users,
} from 'lucide-react'

type CustomerStats = {
  activeQueues: number
  nextAppointment: string | null
  nextAppointmentBusiness: string | null
}

const quickLinks = [
  {
    label: 'Book an Appointment',
    href: '/dashboard/customer/book',
    icon: <Calendar className="w-5 h-5 text-red-600" />,
    description: 'Schedule a new appointment with a service provider.',
  },
  {
    label: 'Your Appointments',
    href: '/dashboard/customer/appointments',
    icon: <Clock className="w-5 h-5 text-red-600" />,
    description: 'View and manage your upcoming and past appointments.',
  },
  {
    label: 'Find Businesses',
    href: '/dashboard/customer/find',
    icon: <Search className="w-5 h-5 text-red-600" />,
    description: 'Browse local businesses offering services.',
  },
  {
    label: 'Your Profile',
    href: '/dashboard/customer/profile',
    icon: <User className="w-5 h-5 text-red-600" />,
    description: 'Update your personal info and preferences.',
  },
  {
    label: 'Entertainment Zone',
    href: '/dashboard/customer/entertainment',
    icon: <Video className="w-5 h-5 text-red-600" />,
    description: 'Watch helpful or fun videos while you wait.',
  },
]

export default function CustomerHomePage() {
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null)

  useEffect(() => {
    // Fetch active queues and next appointment in parallel
    Promise.all([
      fetch('/api/queue/customer').then(r => r.ok ? r.json() : []),
      fetch('/api/appointments/customer').then(r => r.ok ? r.json() : []),
    ]).then(([queues, appts]) => {
      const activeQueues = Array.isArray(queues)
        ? queues.filter((q: any) => q.status === 'waiting' || q.status === 'serving').length
        : 0

      const upcoming = Array.isArray(appts)
        ? appts
          .filter((a: any) => a.status === 'pending' || a.status === 'confirmed')
          .sort((a: any, b: any) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
        : []

      setCustomerStats({
        activeQueues,
        nextAppointment: upcoming[0]?.scheduledTime || null,
        nextAppointmentBusiness: upcoming[0]?.business?.name || null,
      })
    }).catch(() => { })
  }, [])

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Your Dashboard</h1>
      <p className="text-gray-600 mb-8">Your queue status and quick actions at a glance.</p>

      {/* Live Status Bar */}
      {customerStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {/* Active Queue Status */}
          <div className={`rounded-2xl border p-5 flex items-center gap-4 shadow-sm transition ${customerStats.activeQueues > 0
              ? 'bg-red-50 border-red-100'
              : 'bg-white border-gray-100'
            }`}>
            <div className={`p-3 rounded-2xl ${customerStats.activeQueues > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <Users className={`w-6 h-6 ${customerStats.activeQueues > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Queue Status</p>
              {customerStats.activeQueues > 0 ? (
                <>
                  <p className="text-xl font-black text-red-700">Active in {customerStats.activeQueues} queue{customerStats.activeQueues > 1 ? 's' : ''}</p>
                  <Link href="/dashboard/customer/appointments" className="text-xs text-red-600 font-semibold hover:underline">
                    Track your position →
                  </Link>
                </>
              ) : (
                <p className="text-lg font-bold text-gray-500">Not in any queue</p>
              )}
            </div>
          </div>

          {/* Next Appointment */}
          <div className={`rounded-2xl border p-5 flex items-center gap-4 shadow-sm transition ${customerStats.nextAppointment
              ? 'bg-amber-50 border-amber-100'
              : 'bg-white border-gray-100'
            }`}>
            <div className={`p-3 rounded-2xl ${customerStats.nextAppointment ? 'bg-amber-100' : 'bg-gray-100'}`}>
              {customerStats.nextAppointment
                ? <Calendar className="w-6 h-6 text-amber-600" />
                : <CheckCircle2 className="w-6 h-6 text-gray-400" />
              }
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Next Appointment</p>
              {customerStats.nextAppointment ? (
                <>
                  <p className="text-lg font-black text-amber-700">
                    {new Date(customerStats.nextAppointment).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' · '}
                    {new Date(customerStats.nextAppointment).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {customerStats.nextAppointmentBusiness && (
                    <p className="text-xs text-amber-600 font-semibold">{customerStats.nextAppointmentBusiness}</p>
                  )}
                </>
              ) : (
                <p className="text-lg font-bold text-gray-500">No upcoming appointments</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map(({ label, href, icon, description }) => (
          <Link
            key={href}
            href={href}
            className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-red-100 hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-red-50 rounded-xl group-hover:bg-red-600 transition-colors duration-200">
                {icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{label}</h2>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
