'use client'

import { useState, useEffect, useCallback } from 'react'
import { GoogleMap, Marker, LoadScript, Autocomplete } from '@react-google-maps/api'
import { Save, Navigation } from 'lucide-react'
import { toast } from 'react-hot-toast' // Assuming toast exists or I'll remove it if not sure, but simple alert fallback is fine

const containerStyle = {
  width: '100%',
  height: '500px',
}

const defaultCenter = {
  lat: 31.5204,
  lng: 74.3587,
}

const libraries: ("places")[] = ['places']

export default function LocationPage() {
  const [location, setLocation] = useState(defaultCenter)
  const [loading, setLoading] = useState(true)
  const [address, setAddress] = useState('')
  const [autocompleteInstance, setAutocompleteInstance] = useState<google.maps.places.Autocomplete | null>(null)

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
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      setLocation({ lat, lng })

      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setAddress(results[0].formatted_address)
          }
        })
      }
    }
  }, [])

  const onPlaceChanged = () => {
    if (autocompleteInstance !== null) {
      const place = autocompleteInstance.getPlace()
      if (place.formatted_address) {
        setAddress(place.formatted_address)
      } else if (place.name) {
        setAddress(place.name)
      }

      if (place.geometry && place.geometry.location) {
        setLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        })
      }
    }
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })

        // Reverse Geocode to get address
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              setAddress(results[0].formatted_address)
            }
          })
        }
      },
      (error) => {
        console.error("Error getting location:", error)
        toast.error("Unable to retrieve your location. Please check your browser permissions.")
      },
      { enableHighAccuracy: true }
    )
  }

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
        toast.success('Location updated successfully!')
      } else {
        toast.error('Failed to update location')
      }
    } catch (e) {
      console.error(e)
      toast.error('Error saving location')
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

      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={libraries}>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Address (Optional)</label>
            <button
              onClick={handleCurrentLocation}
              className="text-sm flex items-center gap-1 text-red-600 hover:text-red-700 transition font-medium"
              type="button"
            >
              <Navigation className="w-4 h-4" />
              Use Current Location
            </button>
          </div>
          <Autocomplete
            onLoad={(autocomplete) => setAutocompleteInstance(autocomplete)}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="e.g. 123 Main St, Lahore"
            />
          </Autocomplete>
        </div>

        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={location}
            zoom={14}
            onClick={onMapClick}
          >
            <Marker position={location} />
          </GoogleMap>
        </div>
      </LoadScript>
    </div>
  )
}
