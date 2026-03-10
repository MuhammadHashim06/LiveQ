'use client'

import { useState, useEffect } from 'react'
import { Star, MessageSquare, Calendar, User, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface Review {
    _id: string
    rating: number
    comment: string
    user: {
        name: string
        profileImage?: string
    }
    createdAt: string
}

export default function BusinessReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // For business dashboard, we'll need an endpoint that returns reviews for the LOGGED IN business
                // Or we fetch business first then its reviews.
                // Let's check /api/business/me to get ID first or use an optimized endpoint
                const bizRes = await fetch('/api/business/me')
                if (!bizRes.ok) throw new Error("Failed to fetch business info")
                const bizData = await bizRes.json()

                const res = await fetch(`/api/reviews?businessId=${bizData._id}`)
                if (res.ok) {
                    const data = await res.json()
                    setReviews(data)
                }
            } catch (err) {
                console.error(err)
                toast.error("Failed to load reviews")
            } finally {
                setLoading(false)
            }
        }
        fetchReviews()
    }, [])

    const filteredReviews = reviews.filter(r =>
        (r.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.comment || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0'

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
        </div>
    )

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customer Reviews</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage and respond to your customer feedback.</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Avg Rating</p>
                        <div className="flex items-center gap-1.5 justify-center text-amber-500">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="text-2xl font-black text-gray-900">{averageRating}</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-gray-100"></div>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Total Reviews</p>
                        <p className="text-2xl font-black text-gray-900">{reviews.length}</p>
                    </div>
                </div>
            </div>

            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search comments or customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all shadow-sm font-medium"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredReviews.map((review) => (
                    <div key={review._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold">
                                    {review.user?.name ? review.user.name[0].toUpperCase() : <User className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.user?.name || 'Anonymous Customer'}</h4>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                <span className="text-sm font-black text-amber-600">{review.rating}</span>
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                            </div>
                        </div>

                        <div className="relative">
                            <MessageSquare className="absolute -top-1 -left-1 w-8 h-8 text-red-50/50 -z-10 group-hover:scale-110 transition-transform" />
                            <p className="text-gray-600 text-sm italic leading-relaxed">
                                "{review.comment || 'No comment provided.'}"
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && filteredReviews.length === 0 && (
                <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-gray-200" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No reviews found</h3>
                    <p className="text-gray-500 text-sm mt-1">{searchTerm ? "Try searching for something else." : "Reviews will appear here once customers start rating your service."}</p>
                </div>
            )}
        </div>
    )
}
