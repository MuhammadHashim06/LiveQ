"use client"

import { useState, useEffect, useRef } from "react"
import { User, Mail, Phone, Save, Loader2, Camera, Lock, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    profileImage: ""
  })

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [showPasswords, setShowPasswords] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/me")
        if (!res.ok) throw new Error("Failed to fetch profile")
        const data = await res.json()
        if (data) {
          setForm({
            name: data.name || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            profileImage: data.profileImage || ""
          })
        }
      } catch (err) {
        toast.error("Could not load profile")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/user/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phoneNumber: form.phoneNumber,
          profileImage: form.profileImage
        }),
      })

      if (!res.ok) throw new Error("Failed to update profile")
      toast.success("Profile saved successfully")
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, profileImage: data.url }));
        toast.success("Image uploaded temporarily. Don't forget to save profile!");
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Network error during upload");
    } finally {
      setUploadingImage(false);
    }
  };

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
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Profile</h1>
        <p className="text-gray-500 mt-2">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <div className="w-full h-full bg-red-50 text-red-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                {form.profileImage ? (
                  <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12" />
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-black transition-colors disabled:opacity-50"
              >
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-900">{form.name || "Customer Name"}</h2>
            <p className="text-sm font-semibold text-gray-400 mt-1">Customer</p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
              <User className="w-5 h-5 text-red-600" />
              Personal Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email Address (Read Only)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    readOnly
                    value={form.email}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none text-gray-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
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
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
              <Lock className="w-5 h-5 text-red-600" />
              Change Password
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={pwForm.current}
                    onChange={e => setPwForm({ ...pwForm, current: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-12 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowPasswords(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">New Password</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={pwForm.next}
                  onChange={e => setPwForm({ ...pwForm, next: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
                  placeholder="Min. 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Confirm New Password</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={pwForm.confirm}
                  onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
                  placeholder="Repeat new password"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={savingPw}
                onClick={async () => {
                  if (!pwForm.current || !pwForm.next || !pwForm.confirm) { toast.error('All fields are required'); return; }
                  if (pwForm.next !== pwForm.confirm) { toast.error('New passwords do not match'); return; }
                  if (pwForm.next.length < 8) { toast.error('Password must be at least 8 characters'); return; }
                  setSavingPw(true)
                  try {
                    const res = await fetch('/api/user/change-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next })
                    })
                    const data = await res.json()
                    if (res.ok) {
                      toast.success('Password changed successfully!')
                      setPwForm({ current: '', next: '', confirm: '' })
                    } else {
                      toast.error(data.message || 'Failed to change password')
                    }
                  } catch { toast.error('Network error') } finally { setSavingPw(false) }
                }}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {savingPw ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                <span>{savingPw ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
