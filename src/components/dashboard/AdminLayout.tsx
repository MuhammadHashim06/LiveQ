"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LogOut,
    LayoutDashboard,
    Building2,
    Users,
    BarChart3,
    ShieldCheck,
    Bell,
    Search
} from "lucide-react"

const navItems = [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Businesses", href: "/dashboard/admin/businesses", icon: Building2 },
    { label: "Users", href: "/dashboard/admin/users", icon: Users },
    { label: "Reports", href: "/dashboard/admin/reports", icon: BarChart3 },
    { label: "Verification", href: "/dashboard/admin/verification", icon: ShieldCheck },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col sticky top-0 h-screen shadow-2xl z-50 overflow-hidden">
                {/* Logo */}
                <div className="px-8 py-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/50">
                        <span className="text-2xl font-black text-white italic">Q</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter">Live<span className="text-red-500">Q</span> Admin</span>
                </div>

                {/* Search */}
                <div className="px-6 mb-8 group">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            className="w-full bg-gray-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all placeholder:text-gray-500 font-medium"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-grow px-4 space-y-1">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2 opacity-50">Main Menu</div>
                    {navItems.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group ${isActive
                                        ? "bg-red-600 text-white shadow-lg shadow-red-900/50"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-red-500"} transition-colors`} />
                                <span>{label}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 mt-auto">
                    <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-400 rounded-full flex items-center justify-center text-sm font-black shadow-lg">SA</div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold truncate">Super Admin</p>
                                <p className="text-[10px] text-gray-500 truncate font-medium uppercase tracking-tighter">System Overseer</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-700 hover:bg-red-600 transition-all duration-300 group"
                        >
                            <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-auto">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">
                        {navItems.find(item => item.href === pathname)?.label || "Dashboard"}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-px h-6 bg-gray-100 mx-2"></div>
                        <div className="text-right">
                            <p className="text-xs font-black text-gray-900">Feb 14, 2026</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Tuesday • 10:15 AM</p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-8 pb-16 flex-grow">
                    {children}
                </main>
            </div>
        </div>
    )
}
