"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Tag, FileText, ArrowRight, ChevronDown } from "lucide-react"
import CustomSelect from "@/components/ui/CustomSelect"
import toast from "react-hot-toast"

export default function BusinessOnboarding() {
    const router = useRouter()
    const [form, setForm] = useState({
        name: "",
        category: "General",
        description: "",
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch("/api/business/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            if (!res.ok) throw new Error("Failed to save business profile")
            toast.success("Profile created! Now set your location.")
            router.push("/dashboard/business/location")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Setup Your Business</h1>
                    <p className="text-gray-500 mt-2">Just a few details to get your LiveQ profile ready.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Business Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Building2 className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Starbucks, Dr. Smith's Clinic..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <CustomSelect
                            label="Category"
                            value={form.category}
                            onChange={(val) => setForm({ ...form, category: val })}
                            options={[
                                { value: "Healthcare", label: "Healthcare" },
                                { value: "Salon & Beauty", label: "Salon & Beauty" },
                                { value: "Restaurant", label: "Restaurant" },
                                { value: "Retail", label: "Retail" },
                                { value: "Bank", label: "Bank" },
                                { value: "General", label: "General" },
                            ]}
                            icon={<Tag className="w-5 h-5" />}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Brief Description</label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                                <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Tell customers what you offer..."
                                rows={3}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                        {loading ? "Saving..." : "Continue to Location"}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    )
}
