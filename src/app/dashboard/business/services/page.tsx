'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, DollarSign, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', price: '', duration: '', description: '' })

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      if (res.ok) {
        const data = await res.json()
        setServices(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setForm({ name: '', price: '', duration: '', description: '' })
        fetchServices()
        toast.success('Service added!')
      } else {
        toast.error('Failed to add service')
      }
    } catch (e) {
      toast.error('Error adding service')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Services</h1>
          <p className="text-gray-500 font-medium">Manage your service menu and offerings</p>
        </div>
      </div>

      {/* Add Service Form */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-6 text-gray-900">Add New Service</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Service Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
              placeholder="e.g. Haircut"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Price ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                required
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
                placeholder="25"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Duration (min)</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                required
                value={form.duration}
                onChange={e => setForm({ ...form, duration: e.target.value })}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
                placeholder="30"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Description (Optional)</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
              placeholder="Includes wash and dry"
              rows={2}
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition flex justify-center items-center gap-2 shadow-lg shadow-red-100">
              <Plus className="w-5 h-5" /> Add Service
            </button>
          </div>
        </form>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start group hover:border-red-100 transition-all">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">{service.name}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.description}</p>
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Price</span>
                  <span className="text-sm font-bold text-gray-900">${service.price}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Duration</span>
                  <span className="text-sm font-bold text-gray-900">{service.duration}m</span>
                </div>
              </div>
            </div>
            <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {services.length === 0 && !loading && (
          <p className="text-gray-500 col-span-2 text-center py-8">No services added yet.</p>
        )}
      </div>
    </div>
  )
}
