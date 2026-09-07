"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket-client";
import type { RealtimeEvent } from "@/lib/realtime";

export function useRealtime(
    event: RealtimeEvent,
    onEvent: () => void,
    businessId?: string
) {
    const handlerRef = useRef(onEvent);
    handlerRef.current = onEvent;

    useEffect(() => {
        const socket = getSocket();
        const handleEvent = () => handlerRef.current();
        const subscribe = () => {
            if (businessId) socket.emit("subscribe:business", businessId);
        };

        socket.on(event, handleEvent);
        socket.on("connect", subscribe);
        if (socket.connected) subscribe();
        else socket.connect();

        return () => {
            socket.off(event, handleEvent);
            socket.off("connect", subscribe);
            if (businessId) socket.emit("unsubscribe:business", businessId);
        };
    }, [event, businessId]);
}
