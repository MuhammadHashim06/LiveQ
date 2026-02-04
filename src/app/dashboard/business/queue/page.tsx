'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, RotateCcw, Check, X, Clock, Play } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface QueueItem {
  _id: string
  name: string
  status: string
  joinedAt: string
}

export default function QueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [lastRemoved, setLastRemoved] = useState<QueueItem | null>(null) // For local undo (simple version)
  // Real undo would fetch 'removed' items from DB

  const fetchQueue = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/queue')
      if (res.ok) {
        const data = await res.json()
        setQueue(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueue()
    // Poll every 10s for updates
    const interval = setInterval(fetchQueue, 10000)
    return () => clearInterval(interval)
  }, [])

  const addToQueue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
      if (res.ok) {
        setNewName('')
        fetchQueue()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/queue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        if (status === 'removed') {
          // Keep track for local "Undo" toast? Or just refresh
          const item = queue.find(q => q._id === id)
          if (item) setLastRemoved({ ...item, status: 'removed' })
        }
        fetchQueue()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleBulkRemove = async () => {
    if (!confirm(`Remove ${selectedIds.length} customers?`)) return

    // Parallel requests or new bulk endpoint (using parallel for now)
    await Promise.all(selectedIds.map(id => updateStatus(id, 'removed')))
    setSelectedIds([])
  }

  const handleUndo = async () => {
    if (!lastRemoved) return
    await updateStatus(lastRemoved._id, 'waiting')
    setLastRemoved(null)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Live Queue</h1>
          <p className="text-gray-500 font-medium">{queue.length} customers waiting in line</p>
        </div>
        {lastRemoved && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Undo Remove
          </button>
        )}
      </div>

      {/* Add Customer Form */}
      <form onSubmit={addToQueue} className="bg-white p-2 rounded-2xl shadow-sm border flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New customer name..."
          className="flex-grow px-4 py-3 border-none outline-none text-gray-700 placeholder:text-gray-400 font-medium rounded-xl"
        />
        <button
          type="submit"
          className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 active:scale-95 transition shadow-lg shadow-red-200 flex items-center gap-2 font-bold"
        >
          <Plus className="w-5 h-5" /> Add to Queue
        </button>
      </form>

      {/* Queue List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {selectedIds.length > 0 && (
          <div className="bg-red-50 p-2 px-4 flex justify-between items-center text-red-700">
            <span>{selectedIds.length} selected</span>
            <button onClick={handleBulkRemove} className="text-sm font-bold hover:underline">Remove Selected</button>
          </div>
        )}
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-4 w-10">
                <input type="checkbox" onChange={(e) => {
                  if (e.target.checked) setSelectedIds(queue.map(q => q._id))
                  else setSelectedIds([])
                }} checked={queue.length > 0 && selectedIds.length === queue.length} />
              </th>
              <th className="p-4">Name</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {queue.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item._id)}
                    onChange={() => toggleSelect(item._id)}
                  />
                </td>
                <td className="p-4 font-medium text-gray-900">{item.name}</td>
                <td className="p-4 text-gray-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {new Date(item.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${item.status === 'serving' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                  `}>
                    {item.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  {item.status === 'waiting' && (
                    <button
                      onClick={() => updateStatus(item._id, 'serving')}
                      className="bg-red-600 text-white p-2.5 rounded-xl hover:bg-red-700 transition shadow-sm"
                      title="Start Serving"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  {item.status === 'serving' && (
                    <button
                      onClick={() => updateStatus(item._id, 'completed')}
                      className="bg-green-600 text-white p-2.5 rounded-xl hover:bg-green-700 transition shadow-sm"
                      title="Complete"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(item._id, 'removed')}
                    className="bg-gray-100 text-gray-500 p-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 transition"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {queue.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">Queue is empty.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
