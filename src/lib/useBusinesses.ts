"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, getApiErrorMessage } from "@/lib/apiClient";

export interface BusinessSummary {
    _id: string;
    name: string;
    category: string;
    address?: string;
    lat: number;
    lng: number;
    distance?: number;
    stats?: { rating: number; totalCustomers: number };
    services?: { _id: string; name: string; price: number; duration: number }[];
}

export function useBusinesses() {
    const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setError(null);
            setBusinesses(await apiRequest<BusinessSummary[]>("/api/businesses"));
        } catch (error) {
            setError(getApiErrorMessage(error, "Failed to load businesses"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    return { businesses, loading, error, refresh };
}
