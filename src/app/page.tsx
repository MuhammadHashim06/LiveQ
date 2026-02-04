import Link from "next/link";
import {
  MapPin,
  Clock,
  BarChart3,
  Smartphone,
  Calendar,
  Users,
  Youtube
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-extrabold text-gray-900">
              Live<span className="text-red-600">Q</span>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="text-gray-600 hover:text-red-600 font-medium px-3 py-2">
                Login
              </Link>
              <Link href="/signup" className="bg-red-600 text-white px-5 py-2 rounded-full font-medium hover:bg-red-700 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 via-white to-red-50/30">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            Smart Queue & <br className="hidden md:block" />
            <span className="text-red-600">Appointment Management</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Eliminate waiting lines. LiveQ helps businesses manage queues efficiently and lets customers book, track, and arrive just in time.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup" className="px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-lg hover:bg-red-700 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
              Join as Business
            </Link>
            <Link href="/signup" className="px-8 py-4 bg-white text-gray-900 border border-gray-200 text-lg font-bold rounded-lg hover:bg-gray-50 shadow-md transition transform hover:-translate-y-1">
              Join as Customer
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Tailored for Everyone</h2>
            <p className="mt-4 text-gray-500">Powerful tools for owners, seamless experience for users.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-gray-50 rounded-2xl hover:bg-red-50 transition border border-gray-100 group">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Queue Management</h3>
              <p className="text-gray-600">Add walk-ins, remove served customers, and manage your live queue in real-time with ease.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-gray-50 rounded-2xl hover:bg-red-50 transition border border-gray-100 group">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Appointments</h3>
              <p className="text-gray-600">Allow customers to book slots in advance. Manage availability and reduce no-shows.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-gray-50 rounded-2xl hover:bg-red-50 transition border border-gray-100 group">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Business Insights</h3>
              <p className="text-gray-600">Track daily, weekly, and monthly visitors. Understand peak hours and grow your business.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-gray-50 rounded-2xl hover:bg-red-50 transition border border-gray-100 group">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Location & Discovery</h3>
              <p className="text-gray-600">Businesses pin their exact location. Customers find services nearby with our interactive map.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-gray-50 rounded-2xl hover:bg-red-50 transition border border-gray-100 group">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Youtube className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Entertainment Zone</h3>
              <p className="text-gray-600">Customers can watch Shorts or TikToks while they wait, making the waiting time fly by.</p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-gray-50 rounded-2xl hover:bg-red-50 transition border border-gray-100 group">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Live Estimated Time</h3>
              <p className="text-gray-600">Real-time updates on queue position and estimated wait times for transparency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Live<span className="text-red-500">Q</span></h2>
          <p className="mb-8">Simplify your scheduling. Empower your business.</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Contact Support</a>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-xs">
            &copy; {new Date().getFullYear()} LiveQ Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
