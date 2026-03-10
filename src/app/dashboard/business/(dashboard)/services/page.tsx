'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, DollarSign, Clock, Pencil, X as XIcon, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

type Service = {
  _id: string
  name: string
  price: number
  duration: number
  description?: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', price: '', duration: '', description: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', price: '', duration: '', description: '' })
  const [saving, setSaving] = useState(false)

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/business/services')
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
      const res = await fetch('/api/business/services', {
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

  const startEdit = (service: Service) => {
    setEditingId(service._id)
    setEditForm({
      name: service.name,
      price: String(service.price),
      duration: String(service.duration),
      description: service.description || ''
    })
  }

  const handleSaveEdit = async (serviceId: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/business/services/${serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          price: Number(editForm.price),
          duration: Number(editForm.duration),
          description: editForm.description
        })
      })
      if (res.ok) {
        toast.success('Service updated!')
        setEditingId(null)
        fetchServices()
      } else {
        toast.error('Failed to update service')
      }
    } catch (e) {
      toast.error('Error updating service')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const res = await fetch(`/api/business/services/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Service deleted!')
        fetchServices()
      } else {
        toast.error('Failed to delete service')
      }
    } catch (e) {
      toast.error('Error deleting service')
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
        {services.map((service) => (
          <div key={service._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-red-100 transition-all">
            {editingId === service._id ? (
              /* --- Edit Mode --- */
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-semibold"
                  placeholder="Service name"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Price"
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="number"
                      value={editForm.duration}
                      onChange={e => setEditForm({ ...editForm, duration: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Duration (min)"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Description (optional)"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleSaveEdit(service._id)}
                    disabled={saving}
                    className="flex-1 bg-red-600 text-white text-sm font-bold py-2 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* --- View Mode --- */
              <div className="flex justify-between items-start">
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
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => startEdit(service)}
                    className="p-2 text-gray-300 hover:text-blue-500 transition-colors"
                    title="Edit service"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    title="Delete service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {services.length === 0 && !loading && (
          <p className="text-gray-500 col-span-2 text-center py-8">No services added yet.</p>
        )}
      </div>
    </div>
  )
}



