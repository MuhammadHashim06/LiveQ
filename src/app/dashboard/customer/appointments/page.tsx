'use client'

import { useEffect, useState, useRef } from 'react'
import { Clock, CheckCircle2, XCircle, Building2, MapPin, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

type QueueItem = {
  _id: string
  status: "waiting" | "serving" | "completed" | "removed" | "cancelled"
  joinedAt: string
  name: string
  business: {
    _id: string
    name: string
    category: string
    address?: string
  }
  position?: number
  peopleAhead?: number
}

type AppointmentItem = {
  _id: string
  business: {
    _id: string
    name: string
    category: string
    address?: string
  }
  serviceName: string
  scheduledTime: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  earlyArrivalRequested?: boolean
}

export default function AppointmentsPage() {
  const [queues, setQueues] = useState<QueueItem[]>([])
  const [appointments, setAppointments] = useState<AppointmentItem[]>([])
  const [loadingQueues, setLoadingQueues] = useState(true)
  const [loadingAppts, setLoadingAppts] = useState(true)

  const prevQueuesRef = useRef<QueueItem[]>([])
  const isFirstLoad = useRef(true)

  const fetchQueues = async () => {
    try {
      const res = await fetch('/api/queue/customer')
      if (res.ok) {
        const data = await res.json()

        if (!isFirstLoad.current) {
          const oldList = prevQueuesRef.current;

          // Check if any status changed from 'waiting' to 'serving'
          const newlyServing = data.filter((item: QueueItem) =>
            item.status === 'serving' &&
            oldList.find(old => old._id === item._id && old.status === 'waiting')
          );

          if (newlyServing.length > 0) {
            newlyServing.forEach((item: QueueItem) => {
              toast.success(`It's your turn at ${item.business?.name}!`, { icon: '🎉', duration: 5000 })
            })
          }
        }

        prevQueuesRef.current = data;
        isFirstLoad.current = false;
        setQueues(data)
      } else {
        toast.error('Failed to load your queues')
      }
    } catch (err) {
      console.error(err)
      toast.error('An error occurred while fetching your data')
    } finally {
      setLoadingQueues(false)
    }
  }

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments/customer')
      if (res.ok) {
        const data = await res.json()
        setAppointments(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAppts(false)
    }
  }

  const handleEarlyArrival = async (appointmentId: string) => {
    try {
      const res = await fetch('/api/appointments/customer/early-arrival', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      })

      if (res.ok) {
        toast.success("Request sent to business owner!")
        fetchAppointments()
      } else {
        const data = await res.json()
        toast.error(data.message || "Failed to send request")
      }
    } catch (err) {
      toast.error("Network error")
    }
  }

  useEffect(() => {
    fetchQueues()
    fetchAppointments()

    const interval = setInterval(() => {
      fetchQueues()
      fetchAppointments()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleCancelQueue = async (queueId: string) => {
    if (!confirm("Are you sure you want to leave this queue?")) return;

    // In a real app we'd have a PUT endpoint to update status. 
    // We can just hit a generic update or create one specifically if missing.
    try {
      const res = await fetch(`/api/queue/${queueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (res.ok) {
        toast.success("Successfully left the queue.");
        fetchQueues(); // Refresh the list
      } else {
        toast.error("Failed to cancel queue ticket.");
      }
    } catch {
      toast.error("An error occurred");
    }
  }

  const activeQueues = queues.filter(q => q.status === 'waiting' || q.status === 'serving')
  const pastQueues = queues.filter(q => q.status !== 'waiting' && q.status !== 'serving')

  const upcomingAppts = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed')
  const pastAppts = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled')

  const isLoading = loadingQueues || loadingAppts

  if (isLoading) {
    return (
      <>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Queues & Appointments</h1>
          <p className="text-gray-500 mt-2">Track your live position and view your past history.</p>
        </div>

        {/* Active Queues */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            Active Queues ({activeQueues.length})
          </h2>

          {activeQueues.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No active queues</h3>
              <p className="text-gray-500 mt-1 mb-6">You are not currently waiting in any queues.</p>
              <Link href="/dashboard/customer/find" className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors">
                Find Businesses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeQueues.map(q => (
                <div key={q._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative">
                  {/* Wrap the whole card in a link */}
                  <Link href={`/dashboard/customer/business/${q.business?._id}`} className="block">
                    {/* Card Header */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-red-600 transition-colors">{q.business?.name || "Unknown Business"}</h3>
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold tracking-wide uppercase inline-flex items-center gap-1.5">
                            {q.status === 'serving' ? <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> : null}
                            {q.status}
                          </span>
                        </div>
                        <div className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Building2 className="w-5 h-5" />
                        </div>
                      </div>

                      {q.business?.address && (
                        <div className="flex items-start gap-1.5 text-sm text-gray-500 mt-3">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p className="line-clamp-1">{q.business.address}</p>
                        </div>
                      )}
                    </div>

                    {/* Card Body - Live Tracking */}
                    <div className="p-6 bg-white">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Your Position</p>
                            <p className="text-3xl font-black text-gray-900">
                              {q.position ? `#${q.position}` : 'N/A'}
                            </p>
                          </div>
                          <Users className="w-8 h-8 text-blue-200" />
                        </div>

                        <div className="flex-1 bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Est. Wait</p>
                            <p className="text-3xl font-black text-gray-900">
                              {q.position ? `${(q.position - 1) * 15}m` : 'N/A'}
                            </p>
                          </div>
                          <Clock className="w-8 h-8 text-amber-200" />
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          Joined: {new Date(q.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCancelQueue(q._id);
                          }}
                          className="text-red-500 font-semibold hover:text-red-700 z-10 relative"
                        >
                          Leave Queue
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Appointments */}
        <section className="pt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            Upcoming Appointments ({upcomingAppts.length})
          </h2>

          {upcomingAppts.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center shadow-sm">
              <p className="text-gray-500">You don't have any upcoming appointments.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingAppts.map(a => (
                <div key={a._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{a.business?.name || "Unknown"}</h3>
                      <p className="text-sm text-gray-600">{a.serviceName}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg uppercase tracking-wide ${a.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {a.status}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center mb-4">
                    <div className="text-gray-900 font-bold">
                      {new Date(a.scheduledTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-gray-900 font-bold">
                      {new Date(a.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {a.status === 'confirmed' && new Date(a.scheduledTime).toDateString() === new Date().toDateString() && (
                    <div className="mb-4">
                      {a.earlyArrivalRequested ? (
                        <div className="w-full bg-yellow-50 text-yellow-700 font-semibold py-2 rounded-xl text-center text-sm border border-yellow-200">
                          Early Arrival Requested
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEarlyArrival(a._id)}
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 rounded-xl text-sm transition-colors border border-blue-200"
                        >
                          I'm Here Early
                        </button>
                      )}
                    </div>
                  )}

                  <Link href={`/dashboard/customer/business/${a.business?._id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-center w-full bg-blue-50 py-2 rounded-xl transition">
                    View Business
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past History */}
        <section className="pt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Past History</h2>
          {pastQueues.length === 0 && pastAppts.length === 0 ? (
            <p className="text-gray-500 text-sm">No past appointments found.</p>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {pastQueues.map(q => (
                  <li key={q._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 flex-shrink-0 ${q.status === 'completed' ? 'text-green-500' : 'text-gray-400'}`}>
                        {q.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{q.business?.name || "Unknown"} (Queue)</h4>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Joined: {new Date(q.joinedAt).toLocaleDateString()} at {new Date(q.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:ml-auto pl-9 sm:pl-0">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg uppercase tracking-wide ${q.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {q.status}
                      </span>
                      <Link href={`/dashboard/customer/business/${q.business?._id}`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View Business
                      </Link>
                    </div>
                  </li>
                ))}
                {pastAppts.map(a => (
                  <li key={a._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 flex-shrink-0 ${a.status === 'completed' ? 'text-green-500' : 'text-gray-400'}`}>
                        {a.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{a.business?.name || "Unknown"} (Appointment)</h4>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Scheduled: {new Date(a.scheduledTime).toLocaleDateString()} at {new Date(a.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:ml-auto pl-9 sm:pl-0">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg uppercase tracking-wide ${a.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {a.status}
                      </span>
                      <Link href={`/dashboard/customer/business/${a.business?._id}`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View Business
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
