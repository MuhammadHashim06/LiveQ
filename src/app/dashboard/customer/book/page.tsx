'use client'

import { useEffect, useState, useMemo } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { Search, MapPin, Building2, Navigation2, Star, Users, Calendar, Clock, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Haversine distance formula to calculate distance between two lat/lng points in km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

const containerStyle = {
  width: '100%',
  height: '100%',
}

type Business = {
  _id: string
  name: string
  category: string
  address?: string
  lat: number
  lng: number
  distance?: number // Distance from user if calculated
  stats?: {
    rating: number;
    totalCustomers: number;
  }
  services?: {
    _id: string;
    name: string;
    price: number;
    duration: number;
  }[]
}

export default function BookAppointmentPage() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)

  // Advanced Features State
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [isSortingByNearest, setIsSortingByNearest] = useState(false)

  // Booking Form State
  const [service, setService] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [isBooking, setIsBooking] = useState(false)

  const defaultCenter = { lat: 31.5204, lng: 74.3587 }

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await fetch('/api/businesses')
        if (res.ok) {
          const data = await res.json()
          setBusinesses(data)
        }
      } catch (err) {
        console.error('Error fetching businesses:', err)
      }
    }
    fetchBusinesses()
  }, [])

  // Geolocation for "Sort by Nearest"
  const handleSortByNearest = () => {
    if (isSortingByNearest) {
      setIsSortingByNearest(false)
      setUserLocation(null)
      return
    }

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    toast.loading('Detecting your location...', { id: 'geo' })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss('geo')
        toast.success('Location found! Sorting businesses...')
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setIsSortingByNearest(true)
      },
      (error) => {
        toast.dismiss('geo')
        console.error("Error obtaining location", error)
        toast.error('Unable to retrieve your location')
      }
    )
  }

  // Handle form submission
  const handleBooking = async () => {
    if (!selectedBusiness || !service || !date || !time) {
      toast.error("Please fill all booking fields")
      return
    }

    // Combine date + time in the browser (which knows the local timezone),
    // then convert to UTC ISO string. This prevents the 5-hour offset
    // that occurs when the server (UTC) tries to parse "2026-03-10T14:00"
    // as if it were server-local time.
    const localDateTimeStr = `${date}T${time}:00`
    const scheduledTime = new Date(localDateTimeStr)
    if (isNaN(scheduledTime.getTime())) {
      toast.error("Invalid date or time selected")
      return
    }

    setIsBooking(true)
    try {
      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: selectedBusiness._id,
          service,
          scheduledTime: scheduledTime.toISOString(), // UTC ISO string
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Appointment booked successfully!", { icon: '🎉' })
        setService("")
        setDate("")
        setTime("")

        // Push user to appointments to view success
        router.push('/dashboard/customer/appointments')
      } else {
        toast.error(data.message || "Something went wrong")
      }
    } catch (err) {
      toast.error("Network error occurred logging booking")
    } finally {
      setIsBooking(false)
    }
  }

  // Filter and Sort Logic
  const filteredBusinesses = useMemo(() => {
    let filtered = businesses

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(b => b.category === categoryFilter)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(q) ||
        (b.address && b.address.toLowerCase().includes(q))
      )
    }

    if (isSortingByNearest && userLocation) {
      filtered = filtered.map(b => ({
        ...b,
        distance: getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0))
    } else {
      // Optional: default sort by rating or name if not sorting by nearest
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    }

    return filtered
  }, [businesses, searchQuery, categoryFilter, isSortingByNearest, userLocation])

  const mapCenter = selectedBusiness
    ? { lat: selectedBusiness.lat, lng: selectedBusiness.lng }
    : (filteredBusinesses.length > 0
      ? { lat: filteredBusinesses[0].lat, lng: filteredBusinesses[0].lng }
      : defaultCenter)

  const uniqueCategories = ['All', ...Array.from(new Set(businesses.map(biz => biz.category || 'General')))]

  return (
    <>
      <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden bg-gray-50 border-t border-gray-200">

        {/* Left Sidebar - List */}
        <div className="w-full md:w-1/3 lg:w-2/5 h-1/2 md:h-full flex flex-col bg-white border-r border-gray-200 z-10 shadow-xl overflow-hidden shadow-right">

          {/* Search Header */}
          <div className="p-6 border-b border-gray-100 bg-white shadow-sm">
            <h1 className="text-2xl font-black text-gray-900 mb-2">Book Appointment</h1>
            <p className="text-gray-500 text-sm mb-6">Find a business and schedule your visit.</p>

            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or address..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2.5">
                {/* Categories */}
                <select
                  className="flex-1 border border-gray-200 bg-white px-3 py-3 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700 shadow-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Sort by Nearest Button */}
                <button
                  onClick={handleSortByNearest}
                  className={`px-4 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-sm ${isSortingByNearest
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  title="Sort by nearest to me"
                >
                  <Navigation2 className={`w-5 h-5 ${isSortingByNearest ? 'fill-blue-500' : ''}`} />
                  <span className="hidden sm:inline">{isSortingByNearest ? 'Nearest' : 'Near Me'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Business List */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
            {filteredBusinesses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-lg text-gray-700">No businesses found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-4 pb-20">
                {filteredBusinesses.map(biz => (
                  <div
                    key={biz._id}
                    onClick={() => {
                      if (selectedBusiness?._id !== biz._id) {
                        setSelectedBusiness(biz);
                        setService("");
                        setDate("");
                        setTime("");
                      }
                    }}
                    className={`bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden ${selectedBusiness?._id === biz._id
                      ? 'border-red-500 shadow-lg shadow-red-100 ring-4 ring-red-50'
                      : 'border-gray-200 hover:border-red-300 hover:shadow-md'
                      }`}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div className="pr-4">
                          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{biz.name}</h3>
                          <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold tracking-wide uppercase">
                            {biz.category || "General"}
                          </span>
                        </div>
                        {biz.stats && (
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-700 font-bold text-sm shrink-0">
                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                            {biz.stats.rating.toFixed(1)}
                          </div>
                        )}
                      </div>

                      {biz.address && (
                        <div className="flex items-start gap-1.5 text-sm text-gray-500 mt-3">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                          <p className="line-clamp-2 leading-relaxed">{biz.address}</p>
                        </div>
                      )}

                      {biz.distance !== undefined && (
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 mt-2 bg-blue-50 self-start px-2.5 py-1 rounded-lg inline-flex">
                          <Navigation2 className="w-4 h-4" />
                          {biz.distance.toFixed(1)} km away
                        </div>
                      )}
                    </div>

                    {/* Booking Form Expansion */}
                    {selectedBusiness?._id === biz._id && (
                      <div className="bg-red-50/50 p-5 border-t border-red-100">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-red-600" />
                          Schedule your visit
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Service Needed</label>
                            <input
                              type="text"
                              list={`services-${biz._id}`}
                              className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all placeholder:text-gray-400 bg-white"
                              placeholder="e.g. Haircut, Dental Checkup"
                              value={service}
                              onChange={(e) => setService(e.target.value)}
                            />
                            {biz.services && biz.services.length > 0 && (
                              <datalist id={`services-${biz._id}`}>
                                {biz.services.map((s, idx) => (
                                  <option key={s._id || idx} value={s.name} />
                                ))}
                              </datalist>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Date</label>
                              <input
                                type="date"
                                className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all bg-white"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Time</label>
                              <input
                                type="time"
                                className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all bg-white"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                              />
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBooking();
                            }}
                            disabled={isBooking || !service || !date || !time}
                            className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
                          >
                            {isBooking ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <Check className="w-5 h-5" />
                                Confirm Booking
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Content - Map */}
        <div className="hidden md:block w-2/3 lg:w-3/5 h-full relative relative z-0">
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={14}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                styles: [
                  {
                    featureType: "poi.business",
                    stylers: [{ visibility: "off" }],
                  },
                  {
                    featureType: "transit",
                    elementType: "labels.icon",
                    stylers: [{ visibility: "off" }],
                  },
                ],
              }}
            >
              {filteredBusinesses.map(biz => (
                <Marker
                  key={biz._id}
                  position={{ lat: biz.lat, lng: biz.lng }}
                  onClick={() => setSelectedBusiness(biz)}
                  animation={selectedBusiness?._id === biz._id ? google.maps.Animation.BOUNCE : undefined}
                  icon={selectedBusiness?._id === biz._id ? undefined : {
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                  }}
                />
              ))}

              {selectedBusiness && (
                <InfoWindow
                  position={{ lat: selectedBusiness.lat, lng: selectedBusiness.lng }}
                  onCloseClick={() => setSelectedBusiness(null)}
                >
                  <div className="p-2 max-w-[200px]">
                    <h3 className="font-bold text-gray-900 text-base mb-1">{selectedBusiness.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{selectedBusiness.category || 'General'}</p>

                    <button
                      onClick={() => setSelectedBusiness(selectedBusiness)}
                      className="w-full bg-red-600 text-white text-sm font-bold py-1.5 rounded hover:bg-red-700 transition"
                    >
                      Book Now
                    </button>
                  </div>
                </InfoWindow>
              )}

              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                  }}
                  title="Your Location"
                />
              )}
            </GoogleMap>
          </LoadScript>

          {/* Map Overlay Button (Sort by nearest floating) */}
          <div className="absolute top-4 right-4 z-[5]">
            <button
              onClick={handleSortByNearest}
              className="bg-white p-3 rounded-full shadow-lg border border-gray-100 text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all group"
              title="Find nearest to me"
            >
              <Navigation2 className="w-6 h-6 group-hover:fill-blue-500" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
