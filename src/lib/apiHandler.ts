import { NextResponse } from "next/server";

type ApiHandler = (req: Request, context: unknown) => Promise<NextResponse> | NextResponse;

export function internalServerError(error: unknown, route: string) {
    console.error(`[API ERROR] ${route}:`, error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}

/**
 * Global API Error Handling Middleware Wrapper
 * Wraps Next.js App Router API endpoints to catch all errors natively,
 * standardize response shapes, and log server-side faults robustly.
 */
export function withErrorHandling(handler: ApiHandler): ApiHandler {
    return async (req: Request, context: unknown) => {
        try {
            return await handler(req, context);
        } catch (error: unknown) {
            return internalServerError(error, `${req.method} ${req.url}`);
        }
    };
}
