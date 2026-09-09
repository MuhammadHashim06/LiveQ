"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, getApiErrorMessage } from "@/lib/apiClient";
import { useRealtime } from "@/lib/useRealtime";

export interface NotificationItem {
    _id: string;
    title: string;
    message: string;
    read: boolean;
    link?: string;
    createdAt: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setError(null);
            setNotifications(await apiRequest<NotificationItem[]>("/api/notifications"));
        } catch (error) {
            setError(getApiErrorMessage(error, "Failed to load notifications"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
        const interval = setInterval(() => void refresh(), 30_000);
        return () => clearInterval(interval);
    }, [refresh]);

    useRealtime("notification:changed", () => void refresh());

    const markAllAsRead = useCallback(async () => {
        await apiRequest("/api/notifications", { method: "PATCH" });
        setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        await apiRequest(`/api/notifications/${id}`, { method: "PATCH" });
        setNotifications((items) => items.map((item) => item._id === id ? { ...item, read: true } : item));
    }, []);

    return { notifications, loading, error, refresh, markAllAsRead, markAsRead };
}
