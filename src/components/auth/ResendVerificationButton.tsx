"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"

export default function ResendVerificationButton() {
    const [loading, setLoading] = useState(false)
    const [cooldown, setCooldown] = useState(0)

    const handleResend = async () => {
        if (cooldown > 0 || loading) return;

        setLoading(true);
        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST"
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Verification email sent! Please check your inbox.");
                // Start a 60 second cooldown
                setCooldown(60);
                const timer = setInterval(() => {
                    setCooldown((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                toast.error(data.message || "Failed to resend email");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleResend}
            disabled={loading || cooldown > 0}
            className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ml-2 flex items-center gap-2 ${loading || cooldown > 0
                    ? 'bg-yellow-100 text-yellow-600 cursor-not-allowed'
                    : 'bg-yellow-200 hover:bg-yellow-300 text-yellow-800'
                }`}
        >
            {loading ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Sending...</>
            ) : cooldown > 0 ? (
                `Wait ${cooldown}s`
            ) : (
                "Resend Email"
            )}
        </button>
    )
}
