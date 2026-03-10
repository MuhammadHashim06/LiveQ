"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export default function GlobalErrorUI({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global UI Error Caught:", error);
        toast.error("A critical application error occurred.");
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Something went wrong!</h1>
            <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">
                An unexpected error occurred and we've been notified.
                {process.env.NODE_ENV === "development" && (
                    <span className="block mt-2 text-xs text-red-500 font-mono text-left bg-red-50 p-3 rounded-lg border border-red-100">{error.message}</span>
                )}
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="bg-red-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200"
                >
                    Try Again
                </button>
                <button
                    onClick={() => window.location.href = "/"}
                    className="bg-gray-100 text-gray-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
}
