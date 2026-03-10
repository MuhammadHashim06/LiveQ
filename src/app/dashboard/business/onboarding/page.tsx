"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    Building2, Tag, FileText, ArrowRight,
    Navigation, MapPin, CheckCircle2
} from "lucide-react"
import CustomSelect from "@/components/ui/CustomSelect"
import toast from "react-hot-toast"
import { GoogleMap, Marker, LoadScript, Autocomplete } from '@react-google-maps/api'

const containerStyle = {
    width: '100%',
    height: '400px',
}

const defaultCenter = {
    lat: 31.5204,
    lng: 74.3587,
}

const libraries: ("places")[] = ['places']

export default function BusinessOnboarding() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Form State
    const [form, setForm] = useState({
        name: "",
        category: "General",
        description: "",
        lat: 0,
        lng: 0,
        address: ""
    })

    // Map State
    const [mapCenter, setMapCenter] = useState(defaultCenter)
    const [hasSetLocation, setHasSetLocation] = useState(false)
    const [autocompleteInstance, setAutocompleteInstance] = useState<google.maps.places.Autocomplete | null>(null)

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault()
        if (step === 1 && form.name && form.category) {
            setStep(2)
        }
    }

    const handleSubmit = async (isSkippingLocation: boolean = false) => {
        setLoading(true)
        try {
            // If skipping, we send the default 0,0 location or just mapCenter
            const payload = {
                ...form,
                lat: isSkippingLocation ? 0 : form.lat,
                lng: isSkippingLocation ? 0 : form.lng,
                address: isSkippingLocation ? "" : form.address
            }

            const res = await fetch("/api/business/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error("Failed to save business profile")

            setStep(3) // Success Step

            // Redirect after brief pause
            setTimeout(() => {
                router.push("/dashboard/business")
            }, 1500)

        } catch (err: any) {
            toast.error(err.message)
            setLoading(false)
        }
    }

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat()
            const lng = e.latLng.lng()
            setMapCenter({ lat, lng })
            setForm(prev => ({ ...prev, lat, lng }))
            setHasSetLocation(true)

            if (window.google && window.google.maps) {
                const geocoder = new window.google.maps.Geocoder()
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results && results[0]) {
                        setForm(prev => ({ ...prev, address: results[0].formatted_address }))
                    }
                })
            }
        }
    }, [])

    const onPlaceChanged = () => {
        if (autocompleteInstance !== null) {
            const place = autocompleteInstance.getPlace()
            let newAddress = form.address
            if (place.formatted_address) {
                newAddress = place.formatted_address
            } else if (place.name) {
                newAddress = place.name
            }

            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat()
                const lng = place.geometry.location.lng()
                setMapCenter({ lat, lng })
                setForm(prev => ({ ...prev, lat, lng, address: newAddress }))
                setHasSetLocation(true)
            } else {
                setForm(prev => ({ ...prev, address: newAddress }))
            }
        }
    }

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser")
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setMapCenter({ lat: latitude, lng: longitude })
                setForm(prev => ({ ...prev, lat: latitude, lng: longitude }))
                setHasSetLocation(true)

                if (window.google && window.google.maps) {
                    const geocoder = new window.google.maps.Geocoder()
                    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                        if (status === 'OK' && results && results[0]) {
                            setForm(prev => ({ ...prev, address: results[0].formatted_address }))
                        }
                    })
                }
            },
            (error) => {
                console.error("Error getting location:", error)
                alert("Unable to retrieve your location. Please check your browser permissions.")
            },
            { enableHighAccuracy: true }
        )
    }


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full">

                {/* Progress Indicators */}
                <div className="mb-8 flex justify-center items-center gap-4">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>1</div>
                        <span className="font-medium">Profile</span>
                    </div>
                    <div className={`h-1 w-12 rounded ${step >= 2 ? 'bg-red-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>2</div>
                        <span className="font-medium">Location</span>
                    </div>
                    <div className={`h-1 w-12 rounded ${step >= 3 ? 'bg-red-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center gap-2 ${step >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300">

                    {/* STEP 1: Basic Info */}
                    {step === 1 && (
                        <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Setup Your Business</h1>
                                <p className="text-gray-500 mt-2">Just a few details to get your LiveQ profile ready.</p>
                            </div>

                            <form onSubmit={handleNextStep} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Business Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building2 className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="Starbucks, Dr. Smith's Clinic..."
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <CustomSelect
                                        label="Category"
                                        value={form.category}
                                        onChange={(val) => setForm({ ...form, category: val })}
                                        options={[
                                            { value: "Healthcare", label: "Healthcare" },
                                            { value: "Salon & Beauty", label: "Salon & Beauty" },
                                            { value: "Restaurant", label: "Restaurant" },
                                            { value: "Retail", label: "Retail" },
                                            { value: "Bank", label: "Bank" },
                                            { value: "General", label: "General" },
                                        ]}
                                        icon={<Tag className="w-5 h-5" />}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Brief Description</label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <textarea
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            placeholder="Tell customers what you offer..."
                                            rows={3}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                                >
                                    Next: Location Setup
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* STEP 2: Location Map */}
                    {step === 2 && (
                        <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-8 h-8" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Pin Your Location</h1>
                                <p className="text-gray-500 mt-2">Help customers find you easily. You can skip this and add it later.</p>
                            </div>

                            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={libraries}>
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Address Info</label>
                                        <button
                                            onClick={handleCurrentLocation}
                                            className="text-sm flex items-center gap-1 text-red-600 hover:text-red-700 transition font-medium bg-red-50 px-3 py-1.5 rounded-full"
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
                                            value={form.address}
                                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                                            placeholder="Search or type address (e.g. 123 Main St, Lahore)"
                                        />
                                    </Autocomplete>
                                </div>

                                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-8">
                                    <GoogleMap
                                        mapContainerStyle={containerStyle}
                                        center={mapCenter}
                                        zoom={14}
                                        onClick={onMapClick}
                                    >
                                        {hasSetLocation && <Marker position={mapCenter} />}
                                    </GoogleMap>
                                </div>
                            </LoadScript>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-3 font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => handleSubmit(true)}
                                    disabled={loading}
                                    className="px-6 py-3 font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                    title="You can always add your location later from settings"
                                >
                                    Skip for now
                                </button>
                                <button
                                    onClick={() => handleSubmit(false)}
                                    disabled={loading || !hasSetLocation}
                                    className={`flex-1 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 ${hasSetLocation
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-red-300 text-white cursor-not-allowed'
                                        }`}
                                >
                                    {loading ? "Saving..." : "Finish Setup"}
                                    {!loading && <CheckCircle2 className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Success Component */}
                    {step === 3 && (
                        <div className="p-12 text-center animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">You&apos;re All Set!</h1>
                            <p className="text-gray-500 mb-8 text-lg">Your business profile is ready. Redirecting you to your dashboard...</p>

                            <div className="flex justify-center">
                                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
