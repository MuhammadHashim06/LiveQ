"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Clock, User, Check, X, Filter } from "lucide-react"
import toast from "react-hot-toast"

interface Appointment {
  _id: string
  user: {
    name: string
    email: string
  }
  serviceName: string
  scheduledTime: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
}

export default function BusinessAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/business/appointments")
      if (res.ok) {
        const data = await res.json()
        setAppointments(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/business/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: id, status }),
      })
      if (res.ok) {
        toast.success(`Appointment ${status}`)
        fetchAppointments()
      }
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  const filteredAppointments = appointments.filter((app) =>
    filter === "all" ? true : app.status === filter
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Appointments</h1>
          <p className="text-gray-500 font-medium">Manage your schedule and customer bookings</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border shadow-sm">
          <Filter className="w-4 h-4 text-gray-400 ml-2" />
          <div className="flex gap-1">
            {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${filter === f ? "bg-red-600 text-white shadow-md shadow-red-200" : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map((app) => (
            <div key={app._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition group">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${app.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      app.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                  }`}>
                  {app.status}
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  ID: {app._id.slice(-6).toUpperCase()}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{app.serviceName}</h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{app.user?.name || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {new Date(app.scheduledTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {new Date(app.scheduledTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 font-bold">
                {app.status === 'pending' && (
                  <button
                    onClick={() => updateStatus(app._id, 'confirmed')}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Confirm
                  </button>
                )}
                {app.status === 'confirmed' && (
                  <button
                    onClick={() => updateStatus(app._id, 'completed')}
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Complete
                  </button>
                )}
                {(app.status === 'pending' || app.status === 'confirmed') && (
                  <button
                    onClick={() => updateStatus(app._id, 'cancelled')}
                    className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-700 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredAppointments.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <CalendarIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No appointments found</h3>
          <p className="text-gray-500 mt-2">When customers book slots, they'll appear here.</p>
        </div>
      )}
    </div>
  )
}
