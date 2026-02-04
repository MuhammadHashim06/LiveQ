"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface Option {
    value: string
    label: string
}

interface CustomSelectProps {
    options: Option[]
    value: string
    onChange: (value: string) => void
    label?: string
    icon?: React.ReactNode
}

export default function CustomSelect({ options, value, onChange, label, icon }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find((opt) => opt.value === value)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">{label}</label>}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-full bg-white border cursor-pointer rounded-xl px-4 py-3 flex items-center justify-between transition-all ${isOpen ? "ring-4 ring-red-500/10 border-red-500 shadow-sm" : "border-gray-200 hover:border-gray-300"
                    }`}
            >
                <div className="flex items-center gap-3">
                    {icon && <div className="text-gray-400">{icon}</div>}
                    <span className={`text-gray-700 font-medium ${!selectedOption ? "text-gray-400" : ""}`}>
                        {selectedOption ? selectedOption.label : "Select option..."}
                    </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {isOpen && (
                <div className="absolute z-[60] mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in duration-200">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onChange(option.value)
                                setIsOpen(false)
                            }}
                            className={`px-4 py-2.5 cursor-pointer flex items-center gap-3 transition-colors ${value === option.value
                                    ? "bg-red-50 text-red-700 font-semibold"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-red-600"
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full transition-all ${value === option.value ? "bg-red-500" : "bg-transparent"}`} />
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
