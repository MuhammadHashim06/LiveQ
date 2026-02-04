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
    label: 'Live Queue',
    href: '/dashboard/business/queue',
    icon: <Users className="w-5 h-5 text-red-600" />,
    description: 'Monitor and manage live customer queue in real-time.',
  },
  {
    label: 'Appointments',
    href: '/dashboard/business/appointments',
    icon: <Calendar className="w-5 h-5 text-red-600" />,
    description: 'Manage scheduled appointments and availability.',
  },
  {
    label: 'Analytics',
    href: '/dashboard/business/analytics',
    icon: <BarChart className="w-5 h-5 text-red-600" />,
    description: 'Track performance with advanced business insights.',
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
    icon: <ClipboardList className="w-5 h-5 text-red-600" />,
    description: 'Edit, add, or remove the services you offer.',
  },
  {
    label: 'Settings',
    href: '/dashboard/business/settings',
    icon: <Settings className="w-5 h-5 text-red-600" />,
    description: 'Manage profile, business hours, and account.',
  },
]

export default function BusinessHomePage() {
  return (
    <>
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Business Overview</h1>
        <p className="text-gray-500 font-medium text-lg mt-2">
          Control your operations and grow your presence with LiveQ.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map(({ label, href, icon, description }) => (
          <Link
            key={href}
            href={href}
            className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-red-100 hover:-translate-y-1 transition duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-red-50 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">{icon}</div>
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
