'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Building2, MapPin, Users, Star, Clock, User as UserIcon, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

type Business = {
    _id: string
    name: string
    category: string
    address?: string
    lat: number
    lng: number
    services?: any[]
    stats?: {
        rating: number;
        totalCustomers: number;
    }
}

// Minimal interface for Queue objects fetched from public API
type QueueItem = {
    _id: string
    name: string
    status: string
    joinedAt: string
}

export default function BusinessDetailPage() {
    const params = useParams()
    const businessId = params.id as string

    const [business, setBusiness] = useState<Business | null>(null)

    // Actually, we need to fetch the active queue LIST to display who is waiting (anonymized)
    // Let's modify or use another endpoint. If our public Queue API only returns count right now,
    // we might need to fetch the list. Let's assume we can fetch it, or we'll update the API to return the list.
    const [activeQueue, setActiveQueue] = useState<QueueItem[]>([])
    const [loading, setLoading] = useState(true)
    const [lastFetched, setLastFetched] = useState<Date | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const prevQueueRef = useRef<QueueItem[]>([])
    const isFirstLoad = useRef(true)

    const [isJoiningQueue, setIsJoiningQueue] = useState(false)
    const [bookingName, setBookingName] = useState('')

    const fetchBusinessData = async () => {
        try {
            const [bizRes, queueRes] = await Promise.all([
                fetch(`/api/businesses/${businessId}`),
                fetch(`/api/queue/public?businessId=${businessId}&action=list`)
            ])

            if (bizRes.ok) {
                const bizData = await bizRes.json()
                setBusiness(bizData)
            } else {
                toast.error("Business not found")
            }

            if (queueRes.ok) {
                const queueData = await queueRes.json()
                const newList = queueData.list || []

                // Polling Notifications Logic
                if (!isFirstLoad.current) {
                    const oldList = prevQueueRef.current;
                    const newlyServing = newList.filter((item: QueueItem) =>
                        item.status === 'serving' &&
                        oldList.find(old => old._id === item._id && old.status !== 'serving')
                    );

                    if (newlyServing.length > 0) {
                        toast.success('The queue is moving!', { icon: '🔔' })
                    }
                }

                prevQueueRef.current = newList
                isFirstLoad.current = false
                setActiveQueue(newList)
            }

            setLastFetched(new Date())

        } catch (err) {
            console.error(err)
            toast.error("Failed to load business details")
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }

    const handleManualRefresh = () => {
        setIsRefreshing(true)
        fetchBusinessData()
    }

    useEffect(() => {
        if (businessId) {
            fetchBusinessData()

            // Poll for live queue updates every 10 seconds
            const interval = setInterval(() => {
                fetchBusinessData()
            }, 10000)

            return () => clearInterval(interval)
        }
    }, [businessId])

    const handleJoinQueue = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!business) return

        setIsJoiningQueue(true)
        try {
            const res = await fetch('/api/queue/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business._id,
                    customerName: bookingName || undefined
                })
            })

            if (res.ok) {
                toast.success(`You have successfully joined the queue at ${business.name}!`)
                setBookingName('')
                fetchBusinessData() // Refresh live queue
            } else {
                const data = await res.json()
                toast.error(data.message || 'Failed to join queue')
            }
        } catch (err) {
            toast.error('An error occurred while joining the queue')
        } finally {
            setIsJoiningQueue(false)
        }
    }

    // Obscure names for privacy: "John Doe" -> "Joh... D..."
    const maskName = (name: string) => {
        if (!name) return "Guest"
        const parts = name.split(" ")
        return parts.map(p => p.length > 3 ? p.substring(0, 3) + "..." : p).join(" ")
    }

    if (loading) {
        return (
            <>
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </>
        )
    }

    if (!business) {
        return (
            <>
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold text-gray-900">Business Not Found</h1>
                    <Link href="/dashboard/customer/find" className="text-blue-600 hover:underline mt-4 inline-block">Return to search</Link>
                </div>
            </>
        )
    }

    return (
        <>
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

                {/* Left Column - Business Info & Services */}
                <div className="flex-1 space-y-6">

                    {/* Header Card */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                            <Building2 className="w-48 h-48" />
                        </div>

                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-bold tracking-wide uppercase inline-block mb-4">
                            {business.category || 'General'}
                        </span>

                        <h1 className="text-4xl font-black text-gray-900 mb-2">{business.name}</h1>

                        {business.address && (
                            <div className="flex items-start gap-2 text-gray-600 mt-4">
                                <MapPin className="w-5 h-5 flex-shrink-0 text-red-500" />
                                <p className="text-lg leading-snug">{business.address}</p>
                            </div>
                        )}

                        <div className="flex items-center gap-6 mt-8 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-lg font-bold text-amber-500">
                                <Star className="w-6 h-6 fill-current" />
                                <span>{business.stats?.rating ? business.stats.rating.toFixed(1) : 'New'}</span>
                            </div>
                            <div className="text-gray-400">|</div>
                            <div className="text-gray-600 font-medium tracking-wide">
                                {business.stats?.totalCustomers ? `${business.stats.totalCustomers}+ Customers Served` : 'New Business'}
                            </div>
                        </div>
                    </div>

                    {/* Services List if any */}
                    {business.services && business.services.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Services</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {business.services.map((svc: any, idx: number) => (
                                    <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{svc.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{svc.duration} mins</p>
                                        </div>
                                        <span className="text-lg font-bold text-green-600">${svc.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Live Queue & Booking */}
                <div className="w-full lg:w-[400px] flex flex-col gap-6">

                    {/* Booking Form Card */}
                    <div className="bg-gray-900 text-white rounded-2xl shadow-xl overflow-hidden shadow-bottom p-6">
                        <h2 className="text-2xl font-bold mb-2">Join the Queue</h2>
                        <p className="text-gray-400 text-sm mb-6">Skip the physical waiting room and track your position live.</p>

                        <form onSubmit={handleJoinQueue} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Booking Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Your full name"
                                    value={bookingName}
                                    onChange={(e) => setBookingName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder-gray-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isJoiningQueue}
                                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex justify-center items-center transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
                            >
                                {isJoiningQueue ? 'Joining the line...' : 'Confirm Registration'}
                            </button>
                        </form>
                    </div>

                    {/* Live Queue Status */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                                    Live Tracking
                                </h2>
                                {lastFetched && (
                                    <p className="text-xs text-gray-500 mt-1 font-medium flex items-center gap-1">
                                        Last updated at {lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={handleManualRefresh}
                                disabled={isRefreshing}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                title="Refresh Live Queue"
                            >
                                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
                            </button>
                        </div>

                        <div className="flex bg-white divide-x divide-gray-100 border-b border-gray-100">
                            <div className="flex-1 p-4 text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Waiting</p>
                                <p className="text-2xl font-black text-gray-900">{activeQueue.length}</p>
                            </div>
                            <div className="flex-1 p-4 text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Est. Time</p>
                                <p className="text-2xl font-black text-blue-600">{activeQueue.length * 15}m</p>
                            </div>
                        </div>

                        <div className="bg-white flex-1 p-4 overflow-y-auto max-h-[300px]">
                            {activeQueue.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                                    The queue is currently empty.<br />Be the first to join!
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {activeQueue.map((q, idx) => (
                                        <li key={q._id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 text-sm">{maskName(q.name)}</p>
                                                <p className="text-xs text-gray-500">{new Date(q.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            {q.status === 'serving' ? (
                                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded uppercase tracking-wider">
                                                    Serving
                                                </span>
                                            ) : (
                                                <Clock className="w-4 h-4 text-amber-500" />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
