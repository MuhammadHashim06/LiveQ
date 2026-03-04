'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, RotateCcw, Check, X, Clock, Play, GripVertical, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface QueueItem {
  _id: string
  name: string
  status: string
  joinedAt: string
}

interface AppointmentItem {
  _id: string
  user: {
    _id: string
    name: string
  }
  serviceName: string
  scheduledTime: string
  status: string
  earlyArrivalRequested?: boolean
}

export default function QueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [appointments, setAppointments] = useState<AppointmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [lastRemoved, setLastRemoved] = useState<QueueItem | null>(null) // For local undo (simple version)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const prevQueueRef = useRef<QueueItem[]>([])
  const isFirstLoad = useRef(true)
  // Real undo would fetch 'removed' items from DB

  const fetchQueueAndAppointments = async () => {
    setLoading(true)
    try {
      // Fetch Live Queue
      const queueRes = await fetch('/api/queue')
      if (queueRes.ok) {
        const queueData = await queueRes.json()

        // Polling Notification Logic
        if (!isFirstLoad.current) {
          const newItems = queueData.filter((item: QueueItem) => !prevQueueRef.current.find(oldItem => oldItem._id === item._id))
          if (newItems.length > 0) {
            newItems.forEach((newItem: QueueItem) => {
              toast(`New customer joined the queue: ${newItem.name}`, { icon: '👋' })
            })
          }
        }

        prevQueueRef.current = queueData
        setQueue(queueData)
      }

      // Fetch Appointments
      const apptRes = await fetch('/api/business/appointments')
      if (apptRes.ok) {
        const apptData = await apptRes.json()
        setAppointments(apptData)
      }

      isFirstLoad.current = false
      setLastFetched(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    fetchQueueAndAppointments()
  }

  useEffect(() => {
    fetchQueueAndAppointments()
    // Poll every 10s for updates ONLY if not currently dragging
    const interval = setInterval(() => {
      // Checking document.body to see if dragging is active (dnd adds a class usually)
      if (!document.body.classList.contains('dragging')) {
        fetchQueueAndAppointments()
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const addToQueue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) {
      toast.error("Please enter a customer name")
      return
    }

    // Optional loading toast
    const toastId = toast.loading("Adding customer...");
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
      if (res.ok) {
        toast.success("Customer added to queue!", { id: toastId })
        setNewName('')
        fetchQueueAndAppointments()
      } else {
        const data = await res.json()
        toast.error(data.message || "Failed to add customer", { id: toastId })
      }
    } catch (e) {
      console.error(e)
      toast.error("Something went wrong", { id: toastId })
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
          // Keep track for local "Undo" toast
          const item = queue.find(q => q._id === id)
          if (item) setLastRemoved({ ...item, status: 'removed' })
        }
        fetchQueueAndAppointments()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    // Optimistically reorder local state
    const newQueue = Array.from(queue);
    const [moved] = newQueue.splice(sourceIndex, 1);
    newQueue.splice(destIndex, 0, moved);
    setQueue(newQueue);

    // Prepare payload for backend: map to [{ _id, sortOrder }]
    // For simplicity, sortOrder can just be the new index for now.
    // However, to keep it growing monotonically and handle concurrent additions safely,
    // using Date.now() based ordering is tricky to interpolate. 
    // Simply saving their new index (0, 1, 2...) works fine if we re-save ALL items.
    const updates = newQueue.map((item, index) => ({
      _id: item._id,
      sortOrder: index,
    }));

    try {
      const res = await fetch('/api/queue/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error("Failed to reorder");
      }
      toast.success("Order preserved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to reorder, reverting...");
      fetchQueueAndAppointments(); // Revert to database state
    }
  };

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

  const handleCheckInAppointment = async (appointmentId: string, priority: boolean = false) => {
    const toastId = toast.loading("Checking in...");
    try {
      const res = await fetch('/api/business/appointments/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, priority })
      });

      if (res.ok) {
        toast.success("Moved to Live Queue!", { id: toastId });
        fetchQueueAndAppointments();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to check in", { id: toastId });
      }
    } catch (err) {
      toast.error("Network error", { id: toastId });
    }
  }

  // Filter today's confirmed appointments
  const todaysAppointments = appointments.filter((a: AppointmentItem) => {
    if (a.status !== 'confirmed') return false;
    const apptDate = new Date(a.scheduledTime).toDateString();
    const today = new Date().toDateString();
    return apptDate === today;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900">Live Queue</h1>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 mt-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500 font-medium">{queue.length} customers waiting in line</p>
            {lastFetched && (
              <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                Last updated: {lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
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

      {/* Today's Appointments Section */}
      {todaysAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden p-5 border-l-4 border-l-blue-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            Waiting List / Appointments ({todaysAppointments.length})
          </h2>
          <div className="space-y-3">
            {todaysAppointments.map((appt: AppointmentItem) => (
              <div key={appt._id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border ${appt.earlyArrivalRequested ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'} gap-4`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">{appt.user?.name || 'Customer'}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                      {new Date(appt.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Service: {appt.serviceName}</p>

                  {appt.earlyArrivalRequested && (
                    <div className="mt-2 text-xs font-bold text-yellow-700 uppercase tracking-wider bg-yellow-100/50 inline-block px-2 py-1 rounded inline-flex items-center gap-1.5 border border-yellow-200">
                      ★ Arrived Early & Waiting
                    </div>
                  )}
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  {appt.earlyArrivalRequested && (
                    <button
                      onClick={() => handleCheckInAppointment(appt._id, true)}
                      className="flex-1 sm:flex-none border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg font-bold text-sm transition"
                    >
                      Priority Check-in
                    </button>
                  )}
                  <button
                    onClick={() => handleCheckInAppointment(appt._id, false)}
                    className="flex-1 sm:flex-none bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-bold text-sm transition flex items-center justify-center gap-1.5"
                  >
                    Check-in <span className="hidden sm:inline">to Queue</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {selectedIds.length > 0 && (
          <div className="bg-red-50 p-2 px-4 flex justify-between items-center text-red-700">
            <span>{selectedIds.length} selected</span>
            <button onClick={handleBulkRemove} className="text-sm font-bold hover:underline">Remove Selected</button>
          </div>
        )}
        <DragDropContext
          onDragEnd={(result) => {
            document.body.classList.remove('dragging')
            handleDragEnd(result)
          }}
          onDragStart={() => document.body.classList.add('dragging')}
        >
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-4 w-10"></th> {/* Drag Handle Column */}
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
            <Droppable droppableId="queue-list">
              {(provided: any) => (
                <tbody
                  className="divide-y"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {queue.map((item, index) => (
                    <Draggable key={item._id} draggableId={item._id} index={index}>
                      {(provided: any, snapshot: any) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`hover:bg-gray-50 transition ${snapshot.isDragging ? 'bg-red-50 shadow-md' : 'bg-white'}`}
                          style={{
                            ...provided.draggableProps.style,
                            // Prevent layout shifts while dragging table row:
                            display: snapshot.isDragging ? 'table' : ''
                          }}
                        >
                          <td className="p-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-900" {...provided.dragHandleProps}>
                            <GripVertical className="w-5 h-5" />
                          </td>
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
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
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
                            </div>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {queue.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">Queue is empty.</td>
                    </tr>
                  )}
                </tbody>
              )}
            </Droppable>
          </table>
        </DragDropContext>
      </div>
    </div>
  )
}
