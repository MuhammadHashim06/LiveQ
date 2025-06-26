'use client'

import BusinessLayout from '@/components/dashboard/BusinessLayout'
import Link from 'next/link'
import {
  Users,
  Calendar,
  BarChart,
  MapPin,
  ClipboardList,
  Settings,
} from 'lucide-react'

const quickLinks = [
  {
    label: 'Queue',
    href: '/dashboard/business/queue',
    icon: <Users className="w-5 h-5 text-blue-600" />,
    description: 'Monitor and manage live customer queue.',
  },
  {
    label: 'Appointments',
    href: '/dashboard/business/appointments',
    icon: <Calendar className="w-5 h-5 text-green-600" />,
    description: 'Manage scheduled appointments efficiently.',
  },
  {
    label: 'Analytics',
    href: '/dashboard/business/analytics',
    icon: <BarChart className="w-5 h-5 text-purple-600" />,
    description: 'Track performance with real-time insights.',
  },
  {
    label: 'Location',
    href: '/dashboard/business/location',
    icon: <MapPin className="w-5 h-5 text-red-600" />,
    description: 'Update your business address or pin on map.',
  },
  {
    label: 'Services',
    href: '/dashboard/business/services',
    icon: <ClipboardList className="w-5 h-5 text-yellow-600" />,
    description: 'Edit, add, or remove the services you offer.',
  },
  {
    label: 'Settings',
    href: '/dashboard/business/settings',
    icon: <Settings className="w-5 h-5 text-gray-600" />,
    description: 'Manage profile, hours, and notification settings.',
  },
]

export default function BusinessHomePage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, Business Owner</h1>
        <p className="text-gray-600 mt-2">
          Manage your operations using the dashboard below.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map(({ label, href, icon, description }) => (
          <Link
            key={href}
            href={href}
            className="p-5 bg-white border border-gray-200 rounded-xl shadow hover:shadow-md hover:border-gray-300 transition"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-gray-100">{icon}</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{label}</h2>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
