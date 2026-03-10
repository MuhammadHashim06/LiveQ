import { NextResponse } from "next/server";

type ApiHandler = (req: Request, context: any) => Promise<NextResponse> | NextResponse;

/**
 * Global API Error Handling Middleware Wrapper
 * Wraps Next.js App Router API endpoints to catch all errors natively,
 * standardize response shapes, and log server-side faults robustly.
 */
export function withErrorHandling(handler: ApiHandler): ApiHandler {
    return async (req: Request, context: any) => {
        try {
            return await handler(req, context);
        } catch (error: any) {
            console.error(`[API ERROR] ${req.method} ${req.url}:`, error.message);
            console.error(error.stack);

            // Log to external service like Sentry or Datadog here in the future

            const isDev = process.env.NODE_ENV === "development";

            return NextResponse.json(
                {
                    success: false,
                    message: error.message || "An unexpected internal server error occurred.",
                    ...(isDev && { stack: error.stack })
                },
                { status: error.status || 500 }
            );
        }
    };
}
