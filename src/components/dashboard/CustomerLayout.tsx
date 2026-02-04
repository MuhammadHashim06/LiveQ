// "use client"
// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { Calendar, Search, User, Clock, Video, LogOut } from "lucide-react"

// const navItems = [
//   { label: "Book Appointment", href: "/dashboard/customer/book", icon: Calendar },
//   { label: "My Appointments", href: "/dashboard/customer", icon: Clock },
//   { label: "Find Business", href: "/dashboard/customer/find", icon: Search },
//   { label: "Profile", href: "/dashboard/customer/profile", icon: User },
//   { label: "Entertainment", href: "/dashboard/customer/entertainment", icon: Video },
// ]

// export default function CustomerLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname()

//   return (
//     <div className="flex min-h-screen">
//       <aside className="w-64 bg-blue-900 text-white flex flex-col p-6 space-y-6">
//         <h2 className="text-2xl font-bold">LiveQ User</h2>
//         <nav className="flex flex-col space-y-4">
//           {navItems.map(({ label, href, icon: Icon }) => (
//             <Link
//               key={href}
//               href={href}
//               className={`flex items-center gap-2 px-3 py-2 rounded ${
//                 pathname === href ? "bg-blue-700" : "hover:bg-blue-700"
//               }`}
//             >
//               <Icon className="h-5 w-5" />
//               {label}
//             </Link>
//           ))}
//         </nav>
//         <div className="mt-auto">
//           <Link
//             href="/login"
//             className="flex items-center gap-2 px-3 py-2 rounded hover:bg-red-700 bg-red-600"
//           >
//             <LogOut className="h-5 w-5" />
//             Logout
//           </Link>
//         </div>
//       </aside>

//       <main className="flex-1 bg-gray-100 p-10">{children}</main>
//     </div>
//   )
// }


// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { Calendar, Search, User, Clock, Video, LogOut } from "lucide-react"

// const navItems = [
//   { label: "Book", href: "/dashboard/customer/book", icon: Calendar },
//   { label: "Appointments", href: "/dashboard/customer", icon: Clock },
//   { label: "Find", href: "/dashboard/customer/find", icon: Search },
//   { label: "Profile", href: "/dashboard/customer/profile", icon: User },
//   { label: "Entertainment", href: "/dashboard/customer/entertainment", icon: Video },
// ]

// export default function CustomerLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname()

//   return (
//     <div className="min-h-screen bg-gray-100 ">
//       {/* Top Nav */}
//       <header className="bg-white shadow flex items-center justify-between px-6 py-3 rounded-b-xl ">
//         {/* Left: Logo */}
//         <div className="text-xl font-bold text-gray-800">
//           Live<span className="text-red-600">Q</span>
//         </div>

//         {/* Center: Navigation */}
//         <nav className="flex space-x-6">
//           {navItems.map(({ label, href, icon: Icon }) => {
//             const isActive = pathname === href
//             return (
//               <Link
//                 key={href}
//                 href={href}
//                 className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${
//                   isActive
//                     ? "bg-blue-100 text-blue-800"
//                     : "text-gray-700 hover:bg-gray-100"
//                 }`}
//               >
//                 <Icon className="h-4 w-4" />
//                 <span>{label}</span>
//               </Link>
//             )
//           })}
//         </nav>

//         {/* Right: Logout */}
//         <Link
//           href="/login"
//           className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition text-sm"
//         >
//           <LogOut className="h-4 w-4" />
//           Logout
//         </Link>
//       </header>

//       {/* Main Content */}
//       <main className="p-6">{children}</main>
//     </div>
//   )
// }

"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, Search, User, Clock, Video, LogOut } from "lucide-react"

const navItems = [
  { label: "Book", href: "/dashboard/customer/book", icon: Calendar },
  { label: "Appointments", href: "/dashboard/customer/appointments", icon: Clock },
  { label: "Find", href: "/dashboard/customer/find", icon: Search },
  { label: "Profile", href: "/dashboard/customer/profile", icon: User },
  { label: "Entertainment", href: "/dashboard/customer/entertainment", icon: Video },
]

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-md px-8 py-3 rounded-b-xl mx-4 mt-4 flex items-center justify-between backdrop-blur-md border border-gray-200">
        {/* Left: Logo */}
        <Link href="/dashboard/customer" className="text-xl font-bold text-gray-800">
          Live<span className="text-red-600">Q</span>
        </Link>

        {/* Center: Nav Items */}
        <nav className="flex space-x-6">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${isActive
                  ? "bg-red-50 text-red-700"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right: Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition text-sm"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="px-8 pt-6">{children}</main>
    </div>
  )
}
