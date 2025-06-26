// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import {
//   LogOut,
//   Users,
//   Calendar,
//   BarChart,
//   MapPin,
//   Settings,
//   ClipboardList,
// } from "lucide-react"

// const navItems = [
//   { label: "Queue", href: "/dashboard/business/queue", icon: Users },
//   { label: "Appointments", href: "/dashboard/business/appointments", icon: Calendar },
//   { label: "Analytics", href: "/dashboard/business/analytics", icon: BarChart },
//   { label: "Location", href: "/dashboard/business/location", icon: MapPin },
//   { label: "Services", href: "/dashboard/business/services", icon: ClipboardList },
//   { label: "Settings", href: "/dashboard/business/settings", icon: Settings },
// ]

// export default function BusinessLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname()

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sticky Sidebar */}
//       <aside className="w-64 bg-gray-900 text-white flex flex-col p-6 shadow-xl sticky top-0 h-screen rounded-r-xl">
//         {/* Logo */}
//         <div className="text-2xl font-bold tracking-wide mb-8">
//           Live<span className="text-red-500">Q</span> Admin
//         </div>

//         {/* Navigation */}
//         <nav className="flex flex-col gap-3">
//           {navItems.map(({ label, href, icon: Icon }) => {
//             const isActive = pathname === href
//             return (
//               <Link
//                 key={href}
//                 href={href}
//                 className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
//                   isActive
//                     ? "bg-gray-700 text-white"
//                     : "text-gray-300 hover:bg-gray-700 hover:text-white"
//                 }`}
//               >
//                 <Icon className="h-5 w-5" />
//                 <span>{label}</span>
//               </Link>
//             )
//           })}
//         </nav>

//         {/* Logout */}
//         <div className="mt-auto pt-6 border-t border-gray-700">
//           <Link
//             href="/login"
//             className="flex items-center gap-3 px-4 py-2 mt-4 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
//           >
//             <LogOut className="h-5 w-5" />
//             <span>Logout</span>
//           </Link>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-8">{children}</main>
//     </div>
//   )
// }


"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LogOut,
  Users,
  Calendar,
  BarChart,
  MapPin,
  Settings,
  ClipboardList,
} from "lucide-react"

const navItems = [
  { label: "Queue", href: "/dashboard/business/queue", icon: Users },
  { label: "Appointments", href: "/dashboard/business/appointments", icon: Calendar },
  { label: "Analytics", href: "/dashboard/business/analytics", icon: BarChart },
  { label: "Location", href: "/dashboard/business/location", icon: MapPin },
  { label: "Services", href: "/dashboard/business/services", icon: ClipboardList },
  { label: "Settings", href: "/dashboard/business/settings", icon: Settings },
]

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-gray-900 text-white shadow-md rounded-b-xl mx-4 mt-4 px-6 py-3 flex items-center justify-between backdrop-blur border border-gray-800">
        {/* Logo */}
        <Link href="/dashboard/business" className="text-xl font-bold tracking-wide">
  Live<span className="text-red-500">Q</span> Admin
</Link>

        {/* Center Nav */}
        <nav className="flex space-x-6">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  isActive
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right: Logout */}
        <Link
          href="/login"
          className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </header>

      {/* Main Content */}
      <main className="px-8 pt-6">{children}</main>
    </div>
  )
}
