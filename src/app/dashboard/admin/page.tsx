"use client"

import { useState, useEffect } from "react"
import { Users, Building2, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"

export default function AdminOverview() {
    const [stats, setStats] = useState<any>({ users: 0, businesses: 0, todayAppointments: 0, growth: 0, recentActivity: [] })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            console.log("AdminOverview: Fetching stats...");
            try {
                const res = await fetch("/api/admin/stats")
                if (res.ok) {
                    const data = await res.json()
                    console.log("AdminOverview: Stats received:", data);
                    setStats(data)
                }
            } catch (err) {
                console.error("AdminOverview: Fetch error:", err);
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const StatCard = ({ title, value, change, trend, icon, color }: any) => (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-50 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {change}%
                </div>
            </div>
            <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{value}</h3>
            </div>
        </div>
    )

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-44 bg-white rounded-3xl border border-gray-100" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users.toLocaleString()}
                    change="12"
                    trend="up"
                    icon={<Users className="w-6 h-6" />}
                    color="bg-red-600"
                />
                <StatCard
                    title="Total Businesses"
                    value={stats.businesses.toLocaleString()}
                    change="8"
                    trend="up"
                    icon={<Building2 className="w-6 h-6" />}
                    color="bg-gray-900"
                />
                <StatCard
                    title="Daily Appointments"
                    value={stats.todayAppointments.toLocaleString()}
                    change="4"
                    trend="down"
                    icon={<Calendar className="w-6 h-6" />}
                    color="bg-red-600"
                />
                <StatCard
                    title="Platform Growth"
                    value={`${stats.growth}%`}
                    change="18"
                    trend="up"
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="bg-gray-900"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Activity className="w-5 h-5 text-red-600" />
                            RECENT SYSTEM ACTIVITY
                        </h3>
                        <button className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-widest">View All</button>
                    </div>
                    <div className="flex-grow">
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((activity: any) => (
                                <div key={activity.id} className="p-5 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{activity.title}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">
                                                {new Date(activity.date).toLocaleString()} • {activity.status}
                                            </p>
                                        </div>
                                    </div>
                                    {activity.status === 'pending' ? (
                                        <div className="px-3 py-1 bg-yellow-50 text-yellow-700 text-[10px] font-black uppercase rounded-lg">Pending</div>
                                    ) : (
                                        <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-lg">Verified</div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-gray-500 font-medium text-sm">
                                No recent activity found.
                            </div>
                        )}
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl shadow-gray-200 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600 rounded-full blur-[80px] opacity-40"></div>

                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-8">System Health</h3>
                        {stats.systemHealth ? (
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Server Memory</span>
                                        <span className={`text-xs font-black ${stats.systemHealth.memoryUsage > 80 ? 'text-red-500' : 'text-green-500'}`}>{stats.systemHealth.memoryUsage}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${stats.systemHealth.memoryUsage > 80 ? 'bg-red-600' : 'bg-green-500'}`} style={{ width: `${stats.systemHealth.memoryUsage}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Database Perf</span>
                                        <span className={`text-xs font-black ${stats.systemHealth.dbStatus === 'Optimal' ? 'text-green-500' : 'text-red-500'}`}>{stats.systemHealth.dbStatus}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${stats.systemHealth.dbStatus === 'Optimal' ? 'bg-green-500 w-full' : 'bg-red-600 w-1/2'}`}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Active Queues</span>
                                        <span className="text-xs font-black text-amber-500">{stats.systemHealth.activeQueues} live</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="w-full h-full bg-amber-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400">Loading metrics...</div>
                        )}
                    </div>

                    <div className="mt-12 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${stats.systemHealth?.dbStatus !== 'Optimal' || stats.systemHealth?.memoryUsage > 80 ? 'text-red-500' : 'text-green-500'}`}>
                            {stats.systemHealth?.dbStatus !== 'Optimal' || stats.systemHealth?.memoryUsage > 80 ? 'Warning' : 'All Clear'}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                            {stats.systemHealth?.dbStatus !== 'Optimal' || stats.systemHealth?.memoryUsage > 80
                                ? 'System is experiencing high load or database degradation.'
                                : 'All systems are currently performing within optimal parameters.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
