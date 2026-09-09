export default function MapFallback() {
    return (
        <div className="flex h-full min-h-64 items-center justify-center bg-gray-100 p-6 text-center text-sm text-gray-600" role="status">
            Maps are unavailable. Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable location features.
        </div>
    )
}
