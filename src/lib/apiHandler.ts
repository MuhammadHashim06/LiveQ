import { NextResponse } from "next/server";

type ApiHandler = (req: Request, context: unknown) => Promise<NextResponse> | NextResponse;

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
            console.error(`[API ERROR] ${req.method} ${req.url}:`, error);

            // Log to external service like Sentry or Datadog here in the future

            return NextResponse.json(
                {
                    success: false,
                    message: "Internal server error"
                },
                { status: 500 }
            );
        }
    };
}
