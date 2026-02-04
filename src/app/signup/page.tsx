// "use client"
// import { useState } from "react"
// import { useRouter } from "next/navigation"

// export default function SignupPage() {
//   const router = useRouter()
//   const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" })
//   const [error, setError] = useState("")
//   const [loading, setLoading] = useState(false)

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setError("")
//     try {
//       const res = await fetch("/api/auth/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       })
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.message)
//       router.push("/login")
//     } catch (err: any) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
//       <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
//         <h1 className="text-2xl font-bold text-center">Create Account</h1>
//         {error && <p className="text-red-600 text-sm text-center">{error}</p>}
//         <input
//           type="text"
//           name="name"
//           value={form.name}
//           onChange={handleChange}
//           placeholder="Full Name"
//           className="w-full border px-4 py-2 rounded"
//           required
//         />
//         <input
//           type="email"
//           name="email"
//           value={form.email}
//           onChange={handleChange}
//           placeholder="Email"
//           className="w-full border px-4 py-2 rounded"
//           required
//         />
//         <input
//           type="password"
//           name="password"
//           value={form.password}
//           onChange={handleChange}
//           placeholder="Password"
//           className="w-full border px-4 py-2 rounded"
//           required
//         />
//         <select
//           name="role"
//           value={form.role}
//           onChange={handleChange}
//           className="w-full border px-4 py-2 rounded"
//         >
//           <option value="customer">Customer</option>
//           <option value="business">Business Owner</option>
//         </select>
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
//         >
//           {loading ? "Creating..." : "Sign Up"}
//         </button>
//       </form>
//     </div>
//   )
// }


"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Mail, Lock, Building, ArrowRight, Eye, EyeOff, ChevronDown } from "lucide-react"
import CustomSelect from "@/components/ui/CustomSelect"

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      if (form.role === "business") {
        // Automaticaly log them in if possible, or just send to login then redirect.
        // For now, let's just go to login. 
        // But a better UX is to go to onboarding after they log in the first time.
        router.push("/login?onboarding=true")
      } else {
        router.push("/login")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Side - Image/Branding */}
        <div className="w-full md:w-1/2 bg-gray-900 p-12 text-white flex flex-col justify-center relative overflow-hidden order-last md:order-first">
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-4">Join LiveQ</h2>
            <p className="text-gray-400 text-lg mb-8">
              Create an account to start booking appointments or managing your business.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="p-3 bg-gray-800 rounded-lg h-fit">
                  <User className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h4 className="font-bold">For Customers</h4>
                  <p className="text-sm text-gray-400">Find businesses, book slots, and avoid queues.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-3 bg-gray-800 rounded-lg h-fit">
                  <Building className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h4 className="font-bold">For Businesses</h4>
                  <p className="text-sm text-gray-400">Manage operations, track analytics, and grow.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Create Account
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <CustomSelect
              label="I am a"
              value={form.role}
              onChange={(val) => setForm({ ...form, role: val })}
              options={[
                { value: "customer", label: "Customer" },
                { value: "business", label: "Business Owner" },
              ]}
              icon={<User className="w-5 h-5" />}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black transition flex items-center justify-center gap-2 mt-4"
            >
              {loading ? "Creating Account..." : "Sign Up"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-red-600 font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
