const DAYS = new Set(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);

function validTime(value: unknown): value is string {
    if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) return false;
    const [hours, minutes] = value.split(":").map(Number);
    return hours < 24 && minutes < 60;
}

export function validateService(input: unknown, partial = false) {
    if (!input || typeof input !== "object") return { error: "Invalid service payload" };
    const body = input as Record<string, unknown>;
    const value: Record<string, unknown> = {};

    if (!partial || body.name !== undefined) {
        if (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 100) {
            return { error: "Service name must be 2-100 characters" };
        }
        value.name = body.name.trim();
    }
    if (!partial || body.price !== undefined) {
        const price = typeof body.price === "number" ? body.price : Number(body.price);
        if (!Number.isFinite(price) || price < 0 || price > 1_000_000) return { error: "Invalid service price" };
        value.price = price;
    }
    if (!partial || body.duration !== undefined) {
        const duration = typeof body.duration === "number" ? body.duration : Number(body.duration);
        if (!Number.isInteger(duration) || duration < 1 || duration > 1440) return { error: "Invalid service duration" };
        value.duration = duration;
    }
    if (body.description !== undefined) {
        if (typeof body.description !== "string" || body.description.length > 1000) {
            return { error: "Invalid service description" };
        }
        value.description = body.description.trim();
    }

    return { value };
}

export function validateAvailability(input: unknown) {
    if (!Array.isArray(input) || input.length > 7) return { error: "Availability must contain up to 7 days" };
    const seen = new Set<string>();
    const value = [];

    for (const item of input) {
        if (!item || typeof item !== "object") return { error: "Invalid availability entry" };
        const entry = item as Record<string, unknown>;
        if (typeof entry.day !== "string" || !DAYS.has(entry.day) || seen.has(entry.day)) {
            return { error: "Availability days must be unique and valid" };
        }
        if (!validTime(entry.startTime) || !validTime(entry.endTime)) {
            return { error: "Availability times must use HH:MM" };
        }
        if (typeof entry.isClosed !== "boolean") return { error: "Invalid closed status" };
        if (!entry.isClosed && String(entry.startTime) >= String(entry.endTime)) {
            return { error: "Start time must be before end time" };
        }
        seen.add(entry.day);
        value.push({
            day: entry.day,
            startTime: entry.startTime,
            endTime: entry.endTime,
            isClosed: entry.isClosed,
        });
    }

    return { value };
}
