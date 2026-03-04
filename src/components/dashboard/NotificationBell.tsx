'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Trash } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Notification {
    _id: string
    title: string
    message: string
    read: boolean
    link?: string
    createdAt: string
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()

        // Poll every 15 seconds
        const interval = setInterval(() => {
            fetchNotifications()
        }, 15000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMarkAllAsRead = async () => {
        try {
            const res = await fetch('/api/notifications', { method: 'PATCH' })
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleNotificationClick = async (notif: Notification) => {
        setIsOpen(false)

        // Mark as read if it's unread
        if (!notif.read) {
            try {
                await fetch(`/api/notifications/${notif._id}`, { method: 'PATCH' })
                setNotifications(prev => prev.map(n =>
                    n._id === notif._id ? { ...n, read: true } : n
                ))
            } catch (error) {
                console.error(error)
            }
        }

        // Navigate if there's a link
        if (notif.link) {
            router.push(notif.link)
        }
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 relative text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <Bell className="w-8 h-8 text-gray-300 mb-2" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map(notif => (
                                    <div
                                        key={notif._id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <h4 className={`text-sm ${!notif.read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                                    {notif.title}
                                                </h4>
                                                <p className={`text-sm mt-0.5 line-clamp-2 ${!notif.read ? 'text-gray-700' : 'text-gray-500'}`}>
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2 font-medium">
                                                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {!notif.read && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
