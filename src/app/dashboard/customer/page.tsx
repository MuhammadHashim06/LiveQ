'use client'

import Link from 'next/link'
import {
  Calendar,
  Clock,
  Search,
  User,
  Video,
} from 'lucide-react'

const quickLinks = [
  {
    label: 'Book an Appointment',
    href: '/dashboard/customer/book',
    icon: <Calendar className="w-5 h-5 text-blue-600" />,
    description: 'Schedule a new appointment with a service provider.',
  },
  {
    label: 'Your Appointments',
    href: '/dashboard/customer/appointments',
    icon: <Clock className="w-5 h-5 text-green-600" />,
    description: 'View and manage your upcoming and past appointments.',
  },
  {
    label: 'Find Businesses',
    href: '/dashboard/customer/find',
    icon: <Search className="w-5 h-5 text-purple-600" />,
    description: 'Browse local businesses offering services.',
  },
  {
    label: 'Your Profile',
    href: '/dashboard/customer/profile',
    icon: <User className="w-5 h-5 text-indigo-600" />,
    description: 'Update your personal info and preferences.',
  },
  {
    label: 'Entertainment Zone',
    href: '/dashboard/customer/entertainment',
    icon: <Video className="w-5 h-5 text-pink-600" />,
    description: 'Watch helpful or fun videos while you wait.',
  },
]

export default function CustomerHomePage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Your Dashboard</h1>
      <p className="text-gray-600 mb-8">Use the options below to quickly get started.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map(({ label, href, icon, description }) => (
          <Link
            key={href}
            href={href}
            className="p-5 bg-white border border-gray-200 rounded-xl shadow hover:shadow-md hover:border-gray-300 transition"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
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
