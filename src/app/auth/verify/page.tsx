"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import toast from "react-hot-toast"
import { Loader2, Mail, ArrowRight } from "lucide-react"

function VerifyContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // We try to grab the email from the URL if they just signed up or got redirected from login
    const initialEmail = searchParams.get('email') || ''

    const [email, setEmail] = useState(initialEmail)
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [cooldown, setCooldown] = useState(0)

    // Refs for the 6 input boxes
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Focus first empty input on mount
    useEffect(() => {
        if (!email) {
            // If we don't know their email, they need to type it first
            return;
        }
        const firstEmptyIndex = otp.findIndex(val => !val);
        if (firstEmptyIndex !== -1 && inputRefs.current[firstEmptyIndex]) {
            inputRefs.current[firstEmptyIndex]?.focus();
        }
    }, [email])

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste of full code
            const pastedCode = value.slice(0, 6).split('');
            const newOtp = [...otp];
            for (let i = 0; i < pastedCode.length; i++) {
                if (index + i < 6) {
                    newOtp[index + i] = pastedCode[i];
                }
            }
            setOtp(newOtp);
            // Focus last filled or next empty
            const nextIndex = Math.min(index + pastedCode.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if typing a single digit
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Move to previous input on backspace if current is empty
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()

        const fullOtp = otp.join('')
        if (fullOtp.length !== 6) {
            toast.error("Please enter the complete 6-digit code.");
            return;
        }
        if (!email) {
            toast.error("Email address is required.");
            return;
        }

        setLoading(true)
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: fullOtp }),
            })

            const data = await res.json()

            if (res.ok) {
                toast.success("Email verified successfully!")
                // The API gives us a JWT cookie directly, so we can route to their dashboard
                if (data.user?.role === 'business') {
                    router.push("/dashboard/business")
                } else if (data.user?.role === 'admin') {
                    router.push("/dashboard/admin")
                } else {
                    router.push("/dashboard/customer/find")
                }
                router.refresh()
            } else {
                toast.error(data.message || "Invalid verification code.")
                // Clear the OTP inputs on failure
                setOtp(['', '', '', '', '', ''])
                inputRefs.current[0]?.focus()
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Use the existing resend API
    const handleResend = async () => {
        if (!email) {
            toast.error("Email address is required to resend code.");
            return;
        }

        setResendLoading(true)
        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (res.ok) {
                toast.success("New verification code sent!")
                setCooldown(60) // 1 minute cooldown
            } else {
                toast.error(data.message || "Failed to resend code.")
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.")
        } finally {
            setResendLoading(false)
        }
    }

    // Cooldown timer effect
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldown])

    return (
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gray-50 rounded-full blur-3xl opacity-50"></div>

            <div className="relative z-10">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-8 border border-red-100 shadow-inner">
                    <Mail className="w-8 h-8 text-red-600" />
                </div>

                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Check your email</h1>
                <p className="text-gray-500 mb-8 leading-relaxed font-medium">
                    We've sent a 6-digit verification code to <span className="font-bold text-gray-800">{email || "your email address"}</span>.
                </p>

                <form onSubmit={handleVerify} className="space-y-6">

                    {/* If they arrived without an email param, let them type it */}
                    {!initialEmail && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-4 font-medium transition-all"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider text-center block mb-4">Verification Code</label>
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6} // allow pasting full string
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-black text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all shadow-inner"
                                    required
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.join('').length !== 6 || !email}
                        className="w-full flex items-center justify-center gap-2 text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-bold rounded-xl text-sm px-5 py-4 text-center transition-all shadow-lg shadow-red-200 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed group transform hover:scale-[1.02]"
                    >
                        {loading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                        ) : (
                            <>Verify Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>

                    <div className="text-center pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 font-medium">
                            Didn't receive the code?{" "}
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendLoading || cooldown > 0}
                                className="text-red-600 hover:text-red-700 font-bold ml-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resendLoading ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-red-600" />}>
                <VerifyContent />
            </Suspense>
        </div>
    )
}
