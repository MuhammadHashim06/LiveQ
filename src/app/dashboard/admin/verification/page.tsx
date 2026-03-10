"use client"

import { useState, useEffect } from "react"
import { Building2, MapPin, Tag, ShieldAlert, CheckCircle, Clock, ExternalLink, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

interface Business {
    _id: string
    name: string
    category: string
    address: string
    description: string
    isVerified: boolean
    createdAt: string
}

export default function AdminVerificationQueuePage() {
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPendingBusinesses = async () => {
            try {
                const res = await fetch("/api/admin/businesses")
                if (res.ok) {
                    const data = await res.json()
                    // Filter down to ONLY unverified businesses for the queue
                    const pending = data.filter((b: Business) => !b.isVerified);
                    setBusinesses(pending)
                }
            } catch (err) {
                console.error("Fetch pending err:", err);
                toast.error("Failed to load queue")
            } finally {
                setLoading(false)
            }
        }
        fetchPendingBusinesses()
    }, [])

    const [processingId, setProcessingId] = useState<string | null>(null)

    const approveBusiness = async (id: string, name: string) => {
        setProcessingId(id);
        try {
            const res = await fetch(`/api/admin/businesses/${id}/verify`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isVerified: true }),
            });

            if (res.ok) {
                toast.success(`${name} has been verified and activated!`);
                // Remove from local queue UI
                setBusinesses(businesses.filter(b => b._id !== id));
            } else {
                toast.error("Verification failed");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-yellow-500" />
                        VERIFICATION QUEUE
                    </h1>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Pending Approval: {businesses.length} entities</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-white rounded-3xl border border-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : businesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businesses.map((business) => (
                        <div key={business._id} className="bg-white rounded-3xl border border-yellow-200 shadow-sm relative overflow-hidden flex flex-col group">
                            {/* Decorative banner */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-yellow-400"></div>

                            <div className="p-6 flex-grow mt-2">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center border border-yellow-200 shadow-inner">
                                        <Building2 className="w-7 h-7" />
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-lg border border-yellow-300 shadow-sm">
                                        <Clock className="w-3 h-3" /> ACTION REQUIRED
                                    </div>
                                </div>

                                <div className="space-y-1 mb-4">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">{business.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                                        <Tag className="w-3 h-3" />
                                        {business.category}
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-1">
                                        Registered: {new Date(business.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <p className="text-sm text-gray-600 font-medium mb-6 line-clamp-3 leading-relaxed">
                                    {business.description || "No description provided."}
                                </p>

                                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-6">
                                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-xs font-bold leading-tight line-clamp-2">{business.address || "No precise location set"}</span>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50/80 rounded-b-3xl border-t border-gray-100 flex items-center justify-between">
                                <button className="text-xs font-black text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors uppercase tracking-widest">
                                    Review Details <ExternalLink className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => approveBusiness(business._id, business.name)}
                                    disabled={processingId === business._id}
                                    className={`text-xs font-black bg-green-600 text-white shadow-lg shadow-green-200 px-4 py-2 rounded-xl flex items-center gap-2 uppercase tracking-widest transition-all ${processingId === business._id ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-700 transform hover:scale-105 active:scale-95'}`}
                                >
                                    {processingId === business._id ? (
                                        <>Approving... <Loader2 className="w-4 h-4 animate-spin" /></>
                                    ) : (
                                        <>Approve Now <CheckCircle className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-40 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Queue is empty</h3>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-2 max-w-sm mx-auto">
                        All businesses have been reviewed and verified. Awesome work!
                    </p>
                </div>
            )}
        </div>
    )
}
