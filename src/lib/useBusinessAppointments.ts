"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, getApiErrorMessage } from "@/lib/apiClient";
import { useRealtime } from "@/lib/useRealtime";

export interface BusinessAppointment {
    _id: string;
    user: { name: string; email: string };
    serviceName: string;
    scheduledTime: string;
    status: "pending" | "confirmed" | "completed" | "cancelled";
}

export function useBusinessAppointments() {
    const [appointments, setAppointments] = useState<BusinessAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setError(null);
            setAppointments(await apiRequest<BusinessAppointment[]>("/api/business/appointments"));
        } catch (error) {
            setError(getApiErrorMessage(error, "Failed to load appointments"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
        const interval = setInterval(() => void refresh(), 30_000);
        return () => clearInterval(interval);
    }, [refresh]);

    useRealtime("appointment:changed", () => void refresh());

    const updateStatus = useCallback(async (appointmentId: string, status: string) => {
        await apiRequest("/api/business/appointments", {
            method: "PATCH",
            body: JSON.stringify({ appointmentId, status }),
        });
        await refresh();
    }, [refresh]);

    return { appointments, loading, error, refresh, updateStatus };
}
