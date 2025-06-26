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

import { useEffect, useState } from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import CustomerLayout from '@/components/dashboard/CustomerLayout'

const containerStyle = {
  width: '100%',
  height: '500px',
}

type Business = {
  _id: string
  name: string
  service: string
  lat: number
  lng: number
}

export default function FindBusinessPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [typedSearch, setTypedSearch] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')

  const defaultCenter = { lat: 31.5204, lng: 74.3587 }

  const mapCenter =
    filteredBusinesses.length > 0
      ? { lat: filteredBusinesses[0].lat, lng: filteredBusinesses[0].lng }
      : defaultCenter

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await fetch('/api/businesses')
        const data = await res.json()
        setBusinesses(data)
        setFilteredBusinesses(data)
      } catch (err) {
        console.error('Error fetching businesses:', err)
      }
    }

    fetchBusinesses()
  }, [])

  useEffect(() => {
    let filtered = businesses

    if (searchQuery.trim()) {
      filtered = filtered.filter((biz) =>
        biz.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (serviceFilter) {
      filtered = filtered.filter((biz) =>
        biz.service.toLowerCase().includes(serviceFilter.toLowerCase())
      )
    }

    setFilteredBusinesses(filtered)
  }, [searchQuery, serviceFilter, businesses])

  const uniqueServices = Array.from(
    new Set(businesses.map((biz) => biz.service))
  )

  return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Find Businesses Nearby</h1>

        {/* Search & Filter Section */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 mb-6">
          {/* Custom Search Bar with Button */}
          <div className="flex w-full md:w-2/3">
            <input
              type="text"
              placeholder="Search"
              value={typedSearch}
              onChange={(e) => setTypedSearch(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none"
            />
            <button
              onClick={() => setSearchQuery(typedSearch)}
              className="px-4 py-2 border border-red-500 text-red-500 font-medium rounded-r-md hover:bg-red-50 transition"
            >
              Search
            </button>
          </div>

          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-4 py-2 border rounded w-full md:w-1/3"
          >
            <option value="">All Services</option>
            {uniqueServices.map((service, idx) => (
              <option key={idx} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>

        {/* Google Map */}
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={13}
          >
            {filteredBusinesses.map((biz) => (
              <Marker
                key={biz._id}
                position={{ lat: biz.lat, lng: biz.lng }}
                title={biz.name}
              />
            ))}
          </GoogleMap>
        </LoadScript>

        {/* Cards Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBusinesses.map((biz) => (
            <div
              key={biz._id}
              className="p-4 bg-white rounded-lg shadow border hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-blue-800">{biz.name}</h2>
              <p className="text-gray-600">{biz.service}</p>
            </div>
          ))}

          {filteredBusinesses.length === 0 && (
            <p className="text-gray-500 col-span-full">No businesses found.</p>
          )}
        </div>
      </div>
  )
}
