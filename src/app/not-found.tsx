import Link from "next/link"
import { AlertCircle, ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-red-500/5 p-8 md:p-12 text-center border border-gray-100 relative overflow-hidden">

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gray-50 rounded-full blur-3xl opacity-50"></div>

                <div className="relative z-10">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-100 shadow-inner">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>

                    <h1 className="text-8xl font-black text-gray-900 tracking-tighter mb-4">404</h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight mb-4">Page Not Found</h2>

                    <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                        Oops! The page you're looking for seems to have wandered off. It might have been moved, deleted, or perhaps never existed.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 uppercase tracking-widest text-sm transform hover:scale-105"
                        >
                            <Home className="w-4 h-4" />
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">LiveQ Platform</p>
            </div>
        </div>
    )
}
