"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest, getApiErrorMessage } from "@/lib/apiClient";
import { useRealtime } from "@/lib/useRealtime";

export interface CustomerQueueItem {
    _id: string;
    status: "waiting" | "serving" | "completed" | "removed" | "cancelled";
    joinedAt: string;
    name: string;
    business: {
        _id: string;
        name: string;
        category: string;
        address?: string;
    };
    position?: number;
    peopleAhead?: number;
}

export interface CustomerAppointment {
    _id: string;
    business: {
        _id: string;
        name: string;
        category: string;
        address?: string;
    };
    serviceName: string;
    scheduledTime: string;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    earlyArrivalRequested?: boolean;
}

interface CustomerAppointmentsOptions {
    onTurn?: (queue: CustomerQueueItem) => void;
    onQueueError?: (message: string) => void;
    onAppointmentError?: (message: string) => void;
}

export function useCustomerAppointments(options: CustomerAppointmentsOptions = {}) {
    const [queues, setQueues] = useState<CustomerQueueItem[]>([]);
    const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
    const [loadingQueues, setLoadingQueues] = useState(true);
    const [loadingAppts, setLoadingAppts] = useState(true);
    const previousQueues = useRef<CustomerQueueItem[]>([]);
    const firstQueueLoad = useRef(true);
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const refreshQueues = useCallback(async () => {
        try {
            const data = await apiRequest<CustomerQueueItem[]>("/api/queue/customer");
            if (!firstQueueLoad.current) {
                data
                    .filter((item) =>
                        item.status === "serving" &&
                        previousQueues.current.some((old) => old._id === item._id && old.status === "waiting")
                    )
                    .forEach((item) => optionsRef.current.onTurn?.(item));
            }
            previousQueues.current = data;
            firstQueueLoad.current = false;
            setQueues(data);
        } catch (error) {
            optionsRef.current.onQueueError?.(getApiErrorMessage(error, "Failed to load your queues"));
        } finally {
            setLoadingQueues(false);
        }
    }, []);

    const refreshAppointments = useCallback(async () => {
        try {
            setAppointments(await apiRequest<CustomerAppointment[]>("/api/appointments/customer"));
        } catch (error) {
            optionsRef.current.onAppointmentError?.(getApiErrorMessage(error, "Failed to load appointments"));
        } finally {
            setLoadingAppts(false);
        }
    }, []);

    useRealtime("queue:changed", () => void refreshQueues());
    useRealtime("appointment:changed", () => void refreshAppointments());

    useEffect(() => {
        void refreshQueues();
        void refreshAppointments();
        const interval = setInterval(() => {
            void refreshQueues();
            void refreshAppointments();
        }, 30_000);
        return () => clearInterval(interval);
    }, [refreshAppointments, refreshQueues]);

    return { queues, appointments, loadingQueues, loadingAppts, refreshQueues, refreshAppointments };
}
