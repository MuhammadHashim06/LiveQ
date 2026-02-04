import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    // Paths that require auth
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        try {
            const secret = new TextEncoder().encode(JWT_SECRET);
            const { payload } = await jwtVerify(token, secret);
            const role = payload.role as string;

            // Role-based protection
            if (req.nextUrl.pathname.startsWith("/dashboard/business") && role !== "business") {
                return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
            }
            if (req.nextUrl.pathname.startsWith("/dashboard/customer") && role !== "customer") {
                return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
            }
            if (req.nextUrl.pathname.startsWith("/dashboard/admin") && role !== "admin") {
                return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
            }

        } catch (err) {
            // Invalid token
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    // Auth pages should restrict logged-in users
    if (req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup")) {
        if (token) {
            try {
                const secret = new TextEncoder().encode(JWT_SECRET);
                const { payload } = await jwtVerify(token, secret);
                return NextResponse.redirect(new URL(`/dashboard/${payload.role}`, req.url));
            } catch (e) {
                // Token invalid, allow login
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/signup"],
};
