"use client"

import { useState, useEffect } from "react"
import { Users, Mail, Shield, User as UserIcon, MoreVertical, Search, Trash2, Edit2, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

interface User {
    _id: string
    name: string
    email: string
    role: "customer" | "business" | "admin"
    createdAt: string
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchUsers = async () => {
            console.log("AdminUsersPage: Fetching users...");
            try {
                const res = await fetch("/api/admin/users")
                console.log("AdminUsersPage: Fetch response status:", res.status);
                if (res.ok) {
                    const data = await res.json()
                    console.log("AdminUsersPage: Data received:", data.length, "users");
                    setUsers(data)
                } else {
                    toast.error("Failed to load users")
                }
            } catch (err) {
                console.error("AdminUsersPage: Fetch error:", err);
                toast.error("Error connecting to server")
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    const [deletingId, setDeletingId] = useState<string | null>(null)

    const deleteUser = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete user ${name}? This action cannot be undone.`)) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("User deleted successfully");
                setUsers(users.filter(u => u._id !== id));
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to delete user");
            }
        } catch (err) {
            toast.error("An error occurred while deleting");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase border border-red-200 tracking-widest">Admin</span>
            case "business":
                return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase border border-blue-200 tracking-widest">Business</span>
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase border border-gray-200 tracking-widest">Customer</span>
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">SYSTEM USERS</h1>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Total Members: {users.length}</p>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all shadow-sm font-medium"
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">System Role</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined On</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded-lg w-48" /></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-gray-100 rounded-lg w-20" /></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-gray-100 rounded-lg w-24" /></td>
                                        <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded-lg ml-auto w-10" /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center text-red-600 font-black border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-all">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 tracking-tight">{user.name}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-bold">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-xs font-black text-gray-900 tracking-tight">
                                                {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Edit User">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(user._id, user.name)}
                                                    disabled={deletingId === user._id}
                                                    className={`p-2 rounded-lg transition-all ${deletingId === user._id ? 'text-gray-400 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                                    title="Delete User"
                                                >
                                                    {deletingId === user._id ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-gray-900 rounded-lg transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <UserIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-black text-gray-900 uppercase">No users found</p>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-1">Try a different search term</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
