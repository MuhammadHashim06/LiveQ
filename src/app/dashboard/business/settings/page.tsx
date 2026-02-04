"use client"

import { useState, useEffect } from "react"
import { Building2, Mail, Phone, MapPin, Globe, Save, Loader2, Image as ImageIcon } from "lucide-react"
import toast from "react-hot-toast"

export default function BusinessSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    website: ""
  })

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch("/api/business/me")
        if (res.ok) {
          const data = await res.json()
          setForm({
            name: data.name || "",
            category: data.category || "",
            description: data.description || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            website: data.website || ""
          })
        }
      } catch (err) {
        toast.error("Failed to load business settings")
      } finally {
        setLoading(false)
      }
    }
    fetchBusiness()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/business/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        toast.success("Settings saved successfully")
      } else {
        toast.error("Failed to save settings")
      }
    } catch (err) {
      toast.error("Error saving settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Settings</h1>
          <p className="text-gray-500 font-medium">Overview and configuration of your business profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
              <Building2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{form.name || "Business Name"}</h2>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mt-1">{form.category || "Uncategorized"}</p>

            <button className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
              <ImageIcon className="w-4 h-4" /> Change Logo
            </button>
          </div>

          <div className="bg-red-600 p-6 rounded-2xl shadow-lg shadow-red-200 text-white">
            <h3 className="font-bold mb-2">Live Information</h3>
            <p className="text-sm text-red-100 mb-4 opacity-90">Your profile details are visible to customers searching for services in your area.</p>
            <div className="text-xs font-bold uppercase tracking-tighter bg-red-700/50 inline-block px-2 py-1 rounded">
              Status: Public
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Business Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Business Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium"
                    placeholder="123 Main St, City, Country"
                  />
                </div>
              </div>

              <div className="md:col-span-2 font-medium">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
                  placeholder="Tell your customers about your business..."
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-red-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition shadow-lg shadow-red-100"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
