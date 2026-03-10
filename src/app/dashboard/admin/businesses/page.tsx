"use client"

import { useState, useEffect } from "react"
import { Building2, MapPin, Tag, ShieldCheck, ShieldAlert, CheckCircle, XCircle, Search, Trash2, Loader2, MessageSquare, Star, X, Calendar } from "lucide-react"
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

    // Review Modal State
    const [selectedBusinessForReviews, setSelectedBusinessForReviews] = useState<Business | null>(null)
    const [businessReviews, setBusinessReviews] = useState<any[]>([])
    const [loadingReviews, setLoadingReviews] = useState(false)

    const fetchBusinessReviews = async (business: Business) => {
        setSelectedBusinessForReviews(business)
        setLoadingReviews(true)
        try {
            const res = await fetch(`/api/reviews?businessId=${business._id}`)
            if (res.ok) {
                const data = await res.json()
                setBusinessReviews(data)
            }
        } catch (err) {
            toast.error("Failed to load reviews")
        } finally {
            setLoadingReviews(false)
        }
    }

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const res = await fetch("/api/admin/businesses")
                if (res.ok) {
                    const data = await res.json()
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

    const [verifyingId, setVerifyingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const toggleVerification = async (id: string, currentStatus: boolean) => {
        setVerifyingId(id);
        try {
            const res = await fetch(`/api/admin/businesses/${id}/verify`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isVerified: !currentStatus }),
            });

            if (res.ok) {
                toast.success(`Business ${!currentStatus ? 'verified' : 'unverified'}`);
                setBusinesses(businesses.map(b =>
                    b._id === id ? { ...b, isVerified: !currentStatus } : b
                ));
            } else {
                toast.error("Failed to update status");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
        } finally {
            setVerifyingId(null);
        }
    };

    const deleteBusiness = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the business "${name}"? This action cannot be undone.`)) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/businesses/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Business removed from platform");
                setBusinesses(businesses.filter(b => b._id !== id));
            } else {
                toast.error("Failed to delete business");
            }
        } catch (err) {
            toast.error("An error occurred identifying deletion");
        } finally {
            setDeletingId(null);
        }
    };

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
                                    <button
                                        onClick={() => deleteBusiness(business._id, business.name)}
                                        disabled={deletingId === business._id}
                                        className={`p-2 rounded-xl transition-all ${deletingId === business._id ? 'text-gray-400 cursor-not-allowed' : 'text-gray-300 hover:text-red-600 hover:bg-red-50'}`}
                                        title="Delete Business"
                                    >
                                        {deletingId === business._id ? <Loader2 className="w-5 h-5 animate-spin text-red-400" /> : <Trash2 className="w-5 h-5" />}
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

                                <button
                                    onClick={() => fetchBusinessReviews(business)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 hover:text-red-600 hover:border-red-100 hover:shadow-sm transition-all"
                                >
                                    <MessageSquare className="w-4 h-4" /> View Reviews
                                </button>
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
                                <button
                                    onClick={() => toggleVerification(business._id, business.isVerified)}
                                    disabled={verifyingId === business._id}
                                    className={`text-xs font-black flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-widest ${verifyingId === business._id ? 'opacity-50 cursor-not-allowed' : business.isVerified ? 'text-gray-500 hover:text-gray-700' : 'text-green-600 hover:text-green-700'}`}
                                >
                                    {verifyingId === business._id ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> ...</>
                                    ) : business.isVerified ? (
                                        <>Unverify <XCircle className="w-4 h-4" /></>
                                    ) : (
                                        <>Verify <CheckCircle className="w-4 h-4" /></>
                                    )}
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

            {/* Reviews Modal */}
            {selectedBusinessForReviews && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">REVIEWS</h2>
                                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">FOR {selectedBusinessForReviews.name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedBusinessForReviews(null)}
                                className="p-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-2xl border border-gray-100 transition-all shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
                            {loadingReviews ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Fetching feedback...</p>
                                </div>
                            ) : businessReviews.length === 0 ? (
                                <div className="text-center py-20 flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                        <MessageSquare className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No reviews found for this business</p>
                                </div>
                            ) : (
                                businessReviews.map((r) => (
                                    <div key={r._id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                                                    {r.user?.name ? r.user.name[0].toUpperCase() : "U"}
                                                </div>
                                                <span className="text-sm font-black text-gray-900 tracking-tight">{r.user?.name || "Customer"}</span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                                <span className="text-xs font-black text-amber-600">{r.rating}</span>
                                                <Star className="w-3 h-3 text-amber-400 fill-current" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium italic">"{r.comment || "No comment provided."}"</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Submitted {new Date(r.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedBusinessForReviews(null)}
                                className="px-8 py-3 bg-gray-900 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95"
                            >
                                CLOSE DASHBOARD
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
