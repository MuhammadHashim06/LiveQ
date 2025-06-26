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
        <h1 className="text-3xl font-bold mb-6">Book Appointment</h1>
        {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}
        
        <label className="block mb-2 font-medium">Select Business</label>
        <select
          className="w-full border px-4 py-2 mb-4 rounded"
          value={selectedBusiness}
          onChange={(e) => setSelectedBusiness(e.target.value)}
        >
          <option value="">-- Choose --</option>
          {businesses.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>

        <label className="block mb-2 font-medium">Service</label>
        <input
          className="w-full border px-4 py-2 mb-4 rounded"
          placeholder="e.g. Haircut, Dental Checkup"
          value={service}
          onChange={(e) => setService(e.target.value)}
        />

        <label className="block mb-2 font-medium">Date</label>
        <input
          type="date"
          className="w-full border px-4 py-2 mb-4 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label className="block mb-2 font-medium">Time</label>
        <input
          type="time"
          className="w-full border px-4 py-2 mb-4 rounded"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <button
          onClick={handleBooking}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Book Now
        </button>
      </div>
    </>
  )
}
