export class ApiError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = "ApiError";
    }
}

export async function apiRequest<T>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(input, {
        ...init,
        credentials: "same-origin",
        headers,
    });
    const text = await response.text();
    let data: unknown;

    try {
        data = text ? JSON.parse(text) : undefined;
    } catch {
        data = undefined;
    }

    if (!response.ok) {
        const message =
            typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
                ? data.message
                : `Request failed with status ${response.status}`;
        throw new ApiError(response.status, message);
    }

    return data as T;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}
