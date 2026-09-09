"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { useRealtime } from "@/lib/useRealtime";

export interface BusinessQueueItem {
    _id: string;
    name: string;
    status: string;
    joinedAt: string;
}

export interface BusinessQueueAppointment {
    _id: string;
    user: {
        _id: string;
        name: string;
    };
    serviceName: string;
    scheduledTime: string;
    status: string;
    earlyArrivalRequested?: boolean;
    checkedInAt?: string;
}

interface BusinessQueueOptions {
    onNewCustomer?: (item: BusinessQueueItem) => void;
}

export function useBusinessQueue(options: BusinessQueueOptions = {}) {
    const [queue, setQueue] = useState<BusinessQueueItem[]>([]);
    const [appointments, setAppointments] = useState<BusinessQueueAppointment[]>([]);
    const [loadingQueue, setLoadingQueue] = useState(true);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);
    const previousQueue = useRef<BusinessQueueItem[]>([]);
    const firstQueueLoad = useRef(true);
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const refreshQueue = useCallback(async () => {
        try {
            const data = await apiRequest<BusinessQueueItem[]>("/api/queue");
            if (!firstQueueLoad.current) {
                data
                    .filter((item) => !previousQueue.current.some((oldItem) => oldItem._id === item._id))
                    .forEach((item) => optionsRef.current.onNewCustomer?.(item));
            }
            previousQueue.current = data;
            firstQueueLoad.current = false;
            setQueue(data);
            setLastFetched(new Date());
        } catch (error) {
            console.error("Failed to load business queue", error);
        } finally {
            setLoadingQueue(false);
        }
    }, []);

    const refreshAppointments = useCallback(async () => {
        try {
            setAppointments(await apiRequest<BusinessQueueAppointment[]>("/api/business/appointments"));
            setLastFetched(new Date());
        } catch (error) {
            console.error("Failed to load business appointments", error);
        } finally {
            setLoadingAppointments(false);
        }
    }, []);

    useRealtime("queue:changed", () => void refreshQueue());
    useRealtime("appointment:changed", () => void refreshAppointments());

    useEffect(() => {
        void refreshQueue();
        void refreshAppointments();
        const interval = setInterval(() => {
            if (!document.body.classList.contains("dragging")) {
                void refreshQueue();
                void refreshAppointments();
            }
        }, 30_000);
        return () => clearInterval(interval);
    }, [refreshAppointments, refreshQueue]);

    return {
        queue,
        setQueue,
        appointments,
        loading: loadingQueue || loadingAppointments,
        lastFetched,
        refreshQueue,
        refreshAppointments,
    };
}
