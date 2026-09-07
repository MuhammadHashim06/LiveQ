export type RealtimeEvent =
    | "queue:changed"
    | "appointment:changed"
    | "notification:changed";

type RealtimeServer = {
    to: (room: string) => { emit: (event: RealtimeEvent, payload: unknown) => void };
};

function getRealtimeServer(): RealtimeServer | undefined {
    return (globalThis as typeof globalThis & { __LIVEQ_IO__?: RealtimeServer }).__LIVEQ_IO__;
}

export function emitUserEvent(userId: string | undefined, event: RealtimeEvent, payload: unknown = {}) {
    if (userId) getRealtimeServer()?.to(`user:${userId}`).emit(event, payload);
}

export function emitBusinessEvent(
    businessId: string,
    event: RealtimeEvent,
    payload: unknown = {},
    ownerId?: string
) {
    const server = getRealtimeServer();
    server?.to(`business:${businessId}`).emit(event, payload);
    emitUserEvent(ownerId, event, payload);
}
