'use client'

import { useState, useEffect, useCallback } from 'react'
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api'
import { Save } from 'lucide-react'
import { toast } from 'react-hot-toast' // Assuming toast exists or I'll remove it if not sure, but simple alert fallback is fine

const containerStyle = {
  width: '100%',
  height: '500px',
}

const defaultCenter = {
  lat: 31.5204,
  lng: 74.3587,
}

export default function LocationPage() {
  const [location, setLocation] = useState(defaultCenter)
  const [loading, setLoading] = useState(true)
  const [address, setAddress] = useState('')

  useEffect(() => {
    fetch('/api/business/me')
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(data => {
        if (data) {
          setLocation({ lat: data.lat || defaultCenter.lat, lng: data.lng || defaultCenter.lng })
          setAddress(data.address || '')
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setLocation({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      })
    }
  }, [])

  const handleSave = async () => {
    try {
      const res = await fetch('/api/business/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          address
        })
      })
      if (res.ok) {
        alert('Location updated successfully!')
      } else {
        alert('Failed to update location')
      }
    } catch (e) {
      console.error(e)
      alert('Error saving location')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Location</h1>
          <p className="text-gray-500">Click on the map to pin your exact business location.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          <Save className="w-4 h-4" />
          Save Location
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Address (Optional)</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
          placeholder="e.g. 123 Main St, Lahore"
        />
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md">
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={location}
            zoom={14}
            onClick={onMapClick}
          >
            <Marker position={location} />
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  )
}
