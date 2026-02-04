"use client"

import { useState, useEffect } from "react"
import { Building2, MapPin, Tag, ShieldCheck, ShieldAlert, ExternalLink, MoreVertical, Search } from "lucide-react"
import toast from "react-hot-toast"

interface Business {
    _id: string
    name: string
    category: string
    address: string
    description: string
    isVerified: boolean
}

export default function AdminBusinessesPage() {
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchBusinesses = async () => {
            console.log("AdminBusinessesPage: Fetching businesses...");
            try {
                const res = await fetch("/api/admin/businesses")
                console.log("AdminBusinessesPage: Fetch response status:", res.status);
                if (res.ok) {
                    const data = await res.json()
                    console.log("AdminBusinessesPage: Data received:", data.length, "businesses");
                    setBusinesses(data)
                }
            } catch (err) {
                console.error("AdminBusinessesPage: Fetch error:", err);
                toast.error("Failed to load businesses")
            } finally {
                setLoading(false)
            }
        }
        fetchBusinesses()
    }, [])

    const filteredBusinesses = businesses.filter(b =>
        (b.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (b.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">PLATFORM BUSINESSES</h1>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Total: {businesses.length} registered entities</p>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search businesses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all shadow-sm font-medium"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-white rounded-3xl border border-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBusinesses.map((business) => (
                        <div key={business._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-50 transition-all duration-300 flex flex-col group">
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100 shadow-inner group-hover:scale-110 transition-transform">
                                        <Building2 className="w-7 h-7" />
                                    </div>
                                    <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-1 mb-4">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-red-600 transition-colors">{business.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                                        <Tag className="w-3 h-3 uppercase" />
                                        {business.category}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-2">
                                    {business.description || "No description provided."}
                                </p>

                                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-6">
                                    <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                                    <span className="text-xs font-bold truncate">{business.address || "No address set"}</span>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50/50 rounded-b-3xl border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {business.isVerified ? (
                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                                            <ShieldCheck className="w-3 h-3" /> VERIFIED
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                            <ShieldAlert className="w-3 h-3" /> PENDING
                                        </div>
                                    )}
                                </div>
                                <button className="text-xs font-black text-red-600 flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-widest">
                                    Manage <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredBusinesses.length === 0 && (
                <div className="text-center py-40">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">No businesses found</h3>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">{searchTerm ? `Matching "${searchTerm}"` : "Try registering a business first"}</p>
                </div>
            )}
        </div>
    )
}
