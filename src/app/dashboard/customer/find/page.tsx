// 'use client'
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
// import { useEffect, useState } from 'react'
// import CustomerLayout from '@/components/dashboard/CustomerLayout'

// const containerStyle = {
//   width: '100%',
//   height: '500px',
// }

// export default function FindBusinessPage() {
//   const [businesses, setBusinesses] = useState<any[]>([])

//   useEffect(() => {
//     const fetchBusinesses = async () => {
//       const res = await fetch("/api/businesses")
//       const data = await res.json()
//       setBusinesses(data)
//     }
//     fetchBusinesses()
//   }, [])


//   return (
//     <CustomerLayout>
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold mb-6">Find Businesses Nearby</h1>

//         <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
//           <GoogleMap
//             mapContainerStyle={containerStyle}
//             center={{ lat: 31.5204, lng: 74.3587 }}
//             zoom={12}
//           >
//             {businesses.map((biz) => (
//               <Marker key={biz._id} position={{ lat: biz.lat, lng: biz.lng }} title={biz.name} />
//             ))}
//           </GoogleMap>
//         </LoadScript>

//         <ul className="mt-6 space-y-4">
//           {businesses.map((biz) => (
//             <li key={biz._id} className="p-4 bg-white shadow rounded">
//               <h2 className="text-xl font-bold">{biz.name}</h2>
//               <p className="text-sm text-gray-600">{biz.service}</p>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </CustomerLayout>
//   )
// }
'use client'

import { useEffect, useState, useMemo } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { Search, MapPin, Building2, Navigation2, Star, Users, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

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
}

export default function FindBusinessPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)

  // Advanced Features State
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [isSortingByNearest, setIsSortingByNearest] = useState(false)
  const [isSortingByRating, setIsSortingByRating] = useState(false)
  const [queueCount, setQueueCount] = useState<number | null>(null)
  const [isJoiningQueue, setIsJoiningQueue] = useState(false)

  // Booking Form State
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingName, setBookingName] = useState('')

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

  // Fetch queue count when a business is selected
  useEffect(() => {
    const fetchQueueCount = async () => {
      if (!selectedBusiness) {
        setQueueCount(null)
        setShowBookingForm(false)
        return
      }
      try {
        const res = await fetch(`/api/queue/public?businessId=${selectedBusiness._id}`)
        if (res.ok) {
          const data = await res.json()
          setQueueCount(data.count)
        }
      } catch (err) {
        console.error('Failed to fetch queue count', err)
      }
    }
    fetchQueueCount()
  }, [selectedBusiness])

  const handleSortByNearest = () => {
    if (isSortingByNearest) {
      setIsSortingByNearest(false)
      return
    }

    setIsSortingByRating(false) // mutually exclusive for simplicity

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    toast.loading("Finding nearest businesses...", { id: 'location-toast' })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setIsSortingByNearest(true)
        toast.success("Sorted by nearest!", { id: 'location-toast' })
      },
      (error) => {
        console.error("Location error", error)
        toast.error("Could not get your location. Please check browser permissions.", { id: 'location-toast' })
      }
    )
  }

  const handleSortByRating = () => {
    if (isSortingByRating) {
      setIsSortingByRating(false)
    } else {
      setIsSortingByNearest(false)
      setIsSortingByRating(true)
    }
  }

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBusiness) return

    setIsJoiningQueue(true)
    try {
      const res = await fetch('/api/queue/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness._id,
          customerName: bookingName || undefined
        })
      })

      if (res.ok) {
        toast.success(`You have successfully joined the queue at ${selectedBusiness.name}!`)
        setShowBookingForm(false)
        setBookingName('')
        // Refresh the local queue count estimate
        setQueueCount(prev => (prev !== null ? prev + 1 : 1))
      } else {
        const data = await res.json()
        toast.error(data.message || 'Failed to join queue')
      }
    } catch (err) {
      toast.error('An error occurred while joining the queue')
    } finally {
      setIsJoiningQueue(false)
    }
  }

  const filteredBusinesses = useMemo(() => {
    let filtered = businesses.filter(biz => {
      const matchesSearch = biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (biz.address || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'All' || biz.category === categoryFilter
      return matchesSearch && matchesCategory
    })

    if (isSortingByNearest && userLocation) {
      filtered = filtered.map(biz => ({
        ...biz,
        distance: getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, biz.lat, biz.lng)
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0))
    } else if (isSortingByRating) {
      filtered = [...filtered].sort((a, b) => {
        const ratingA = a.stats?.rating || 0;
        const ratingB = b.stats?.rating || 0;
        return ratingB - ratingA; // highest to lowest
      })
    }

    return filtered
  }, [businesses, searchQuery, categoryFilter, isSortingByNearest, isSortingByRating, userLocation])

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
          <div className="p-6 border-b border-gray-100 bg-white">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Businesses</h1>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {uniqueCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${categoryFilter === cat
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSortByNearest}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${isSortingByNearest
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Navigation2 className="w-4 h-4" />
                  {isSortingByNearest ? 'Sorted Nearest' : 'Distance'}
                </button>

                <button
                  onClick={handleSortByRating}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${isSortingByRating
                    ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                  Top Rated
                </button>
              </div>
            </div>
          </div>

          {/* Business List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredBusinesses.map((biz) => (
              <div
                key={biz._id}
                onClick={() => setSelectedBusiness(biz)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${selectedBusiness?._id === biz._id
                  ? 'border-red-500 bg-red-50 shadow-md'
                  : 'border-transparent bg-white shadow-sm hover:shadow-md hover:border-red-200'
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{biz.name}</h2>
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold tracking-wide">
                    {biz.category || 'General'}
                  </span>
                </div>

                {biz.address && (
                  <div className="flex items-start gap-1.5 text-sm text-gray-500 mt-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                    <p className="line-clamp-2 leading-snug">{biz.address}</p>
                  </div>
                )}

                {biz.distance !== undefined && (
                  <div className="flex items-start gap-1.5 text-sm font-medium text-red-600 mt-1">
                    <Navigation2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>{biz.distance.toFixed(1)} km away</p>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{biz.stats?.rating ? biz.stats.rating.toFixed(1) : 'New'}</span>
                  </div>
                  <Link
                    href={`/dashboard/customer/business/${biz._id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="ml-auto text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    View Details &rarr;
                  </Link>
                </div>

                {/* Expanded Detail Panel if Selected */}
                {selectedBusiness?._id === biz._id && (
                  <div className="mt-4 pt-4 border-t border-red-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 bg-red-50 p-3 rounded-xl flex flex-col items-center justify-center border border-red-100">
                        <Users className="w-5 h-5 text-red-500 mb-1" />
                        <span className="text-xs text-red-600 font-medium uppercase tracking-wider">In Queue</span>
                        <span className="text-xl font-bold text-red-700">
                          {queueCount === null ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin mt-1" />
                          ) : queueCount}
                        </span>
                      </div>
                      <div className="flex-1 bg-blue-50 p-3 rounded-xl flex flex-col items-center justify-center border border-blue-100">
                        <Clock className="w-5 h-5 text-blue-500 mb-1" />
                        <span className="text-xs text-blue-600 font-medium uppercase tracking-wider">Est. Wait</span>
                        <span className="text-xl font-bold text-blue-700">
                          {queueCount === null ? '-' : `${queueCount * 15}m`}
                        </span>
                      </div>
                    </div>

                    {!showBookingForm ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBookingForm(true);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                      >
                        Join Queue Now
                      </button>
                    ) : (
                      <form onSubmit={handleJoinQueue} className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. John Doe"
                            value={bookingName}
                            onChange={(e) => setBookingName(e.target.value)}
                            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowBookingForm(false)}
                            className="flex-1 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isJoiningQueue}
                            className="flex-[2] py-2 bg-red-600 text-white rounded-lg text-sm font-bold flex justify-center items-center disabled:opacity-70"
                          >
                            {isJoiningQueue ? 'Joining...' : 'Confirm'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredBusinesses.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No businesses found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Content - Map */}
        <div className="w-full md:w-2/3 lg:w-3/5 h-1/2 md:h-full relative bg-gray-200">
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={selectedBusiness ? 15 : 13}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
              }}
            >
              {filteredBusinesses.map((biz) => (
                <Marker
                  key={biz._id}
                  position={{ lat: biz.lat, lng: biz.lng }}
                  onClick={() => setSelectedBusiness(biz)}
                  icon={selectedBusiness?._id === biz._id ? undefined : "http://maps.google.com/mapfiles/ms/icons/red-dot.png"}
                />
              ))}

              {selectedBusiness && (
                <InfoWindow
                  position={{ lat: selectedBusiness.lat, lng: selectedBusiness.lng }}
                  onCloseClick={() => setSelectedBusiness(null)}
                >
                  <div className="p-1 max-w-[200px]">
                    <p className="font-bold text-gray-900">{selectedBusiness.name}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{selectedBusiness.address}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>

          {/* Current Location FAB */}
          <button
            className="absolute bottom-6 right-6 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-gray-50 transition-colors z-10"
            title="My Location"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                  // Usually we'd fly to this, right now we just rely on the map center state which requires a slightly different approach
                  // To keep it simple, we could clear selected business and set default center, but we don't have a map ref.
                  // A quick hack is just alerting for now, or adding a user location marker.
                })
              }
            }}
          >
            <Navigation2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  )
}
