'use client'
import { useEffect, useState } from "react"
import CustomerLayout from "@/components/dashboard/CustomerLayout"

export default function BookAppointmentPage() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState("")
  const [service, setService] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [message, setMessage] = useState("")

  // Dummy businesses (replace with actual API fetch later)
  useEffect(() => {
    setBusinesses([
      { _id: "b1", name: "Clinic One" },
      { _id: "b2", name: "Salon XYZ" },
      { _id: "b3", name: "Auto Repair Hub" }
    ])
  }, [])

  const handleBooking = async () => {
    if (!selectedBusiness || !service || !date || !time) {
      setMessage("Please fill all fields")
      return
    }

    const res = await fetch("/api/appointments/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: selectedBusiness, service, date, time }),
    })

    const data = await res.json()
    if (res.ok) {
      setMessage("Appointment booked successfully")
      setService("")
      setDate("")
      setTime("")
    } else {
      setMessage(data.message || "Something went wrong")
    }
  }

  return (
    <>
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">Book Appointment</h1>
        {message && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-center font-medium border border-red-100">{message}</div>}

        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Select Business</label>
        <select
          className="w-full border border-gray-200 px-4 py-3 mb-6 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all appearance-none cursor-pointer"
          value={selectedBusiness}
          onChange={(e) => setSelectedBusiness(e.target.value)}
        >
          <option value="">-- Choose Business --</option>
          {businesses.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>

        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Service</label>
        <input
          className="w-full border border-gray-200 px-4 py-3 mb-6 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all placeholder:text-gray-400"
          placeholder="e.g. Haircut, Dental Checkup"
          value={service}
          onChange={(e) => setService(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Date</label>
            <input
              type="date"
              className="w-full border border-gray-200 px-4 py-3 mb-6 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Time</label>
            <input
              type="time"
              className="w-full border border-gray-200 px-4 py-3 mb-6 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleBooking}
          className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200"
        >
          Confirm Appointment
        </button>
      </div>
    </>
  )
}
