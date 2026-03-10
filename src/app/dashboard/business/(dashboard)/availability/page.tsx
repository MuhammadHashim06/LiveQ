"use client"

import { useState, useEffect } from "react"
import { Clock, Save, Loader2, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Helper function to generate time options in 30-min intervals
const generateTimeOptions = () => {
    const times = []
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hh = h.toString().padStart(2, "0")
            const mm = m.toString().padStart(2, "0")
            times.push(`${hh}:${mm}`)
        }
    }
    return times
}

const TIME_OPTIONS = generateTimeOptions()

export default function AvailabilityPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Default availability state structure based on DAYS_OF_WEEK
    const [availability, setAvailability] = useState(
        DAYS_OF_WEEK.map(day => ({
            day,
            startTime: "09:00",
            endTime: "17:00",
            isClosed: false
        }))
    )

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const res = await fetch("/api/business/availability")
                if (!res.ok) throw new Error("Failed to fetch")
                const data = await res.json()

                // Merge fetched data with default structure to ensure all days exist
                if (data && Array.isArray(data) && data.length > 0) {
                    const merged = DAYS_OF_WEEK.map(dayName => {
                        const found = data.find((d: any) => d.day === dayName)
                        return found || { day: dayName, startTime: "09:00", endTime: "17:00", isClosed: false }
                    })
                    setAvailability(merged as any)
                }
            } catch (err) {
                toast.error("Could not load availability")
            } finally {
                setLoading(false)
            }
        }
        fetchAvailability()
    }, [])

    const handleToggleClosed = (index: number) => {
        const newAvail = [...availability]
        newAvail[index].isClosed = !newAvail[index].isClosed
        setAvailability(newAvail)
    }

    const handleChangeTime = (index: number, field: "startTime" | "endTime", value: string) => {
        const newAvail = [...availability]
        newAvail[index][field] = value
        setAvailability(newAvail)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        // Quick validation to ensure start is before end
        let isValid = true;
        for (const day of availability) {
            if (!day.isClosed && day.startTime >= day.endTime) {
                toast.error(`${day.day}: End time must be after start time`)
                isValid = false;
                break;
            }
        }
        if (!isValid) {
            setSaving(false);
            return;
        }

        try {
            const res = await fetch("/api/business/availability", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(availability),
            })

            if (!res.ok) throw new Error("Failed to save")
            toast.success("Operating hours saved successfully")
        } catch (err) {
            toast.error("An error occurred while saving")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Availability</h1>
                <p className="text-gray-500 mt-2">Manage your business operating hours and days off.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Helper Banner */}
                <div className="bg-blue-50 border-b border-blue-100 p-4 flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                        These generic hours define when customers can book appointments with you. You can set specific days off later.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                    <div className="space-y-6">

                        {/* Header Row (Hidden on mobile) */}
                        <div className="hidden sm:grid sm:grid-cols-12 gap-4 pb-2 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-4">Day</div>
                            <div className="col-span-3">Opening Time</div>
                            <div className="col-span-3">Closing Time</div>
                            <div className="col-span-2 text-center">Status</div>
                        </div>

                        {/* Days List */}
                        {availability.map((day, index) => (
                            <div
                                key={day.day}
                                className={`grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 rounded-xl transition-colors ${day.isClosed ? 'bg-gray-50 opacity-70' : 'bg-white hover:bg-gray-50'}`}
                            >

                                {/* Day Name */}
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${day.isClosed ? 'bg-gray-200 text-gray-500' : 'bg-red-100 text-red-600'}`}>
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-gray-900">{day.day}</span>
                                </div>

                                {/* Times (Disabled if closed) */}
                                <div className="col-span-3">
                                    <label className="sm:hidden block text-xs font-bold text-gray-500 mb-1 uppercase">Opening</label>
                                    <select
                                        value={day.startTime}
                                        disabled={day.isClosed}
                                        onChange={(e) => handleChangeTime(index, "startTime", e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        {TIME_OPTIONS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-3">
                                    <label className="sm:hidden block text-xs font-bold text-gray-500 mb-1 uppercase">Closing</label>
                                    <select
                                        value={day.endTime}
                                        disabled={day.isClosed}
                                        onChange={(e) => handleChangeTime(index, "endTime", e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        {TIME_OPTIONS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Toggle */}
                                <div className="col-span-2 flex sm:justify-center items-center mt-2 sm:mt-0">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleClosed(index)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${!day.isClosed ? 'bg-red-600' : 'bg-gray-300'}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!day.isClosed ? 'translate-x-6' : 'translate-x-1'}`}
                                        />
                                    </button>
                                    <span className="ml-3 text-sm font-semibold sm:hidden">
                                        {day.isClosed ? "Closed" : "Open"}
                                    </span>
                                </div>

                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex justify-end border-t border-gray-100 pt-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{saving ? "Saving..." : "Save Operating Hours"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
