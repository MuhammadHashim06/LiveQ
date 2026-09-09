import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { isSameOrigin, requireUser } from "@/lib/auth";

// GET: Fetch all businesses (for customers) with optional filtering
export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const query: any = { isVerified: true };

        const service = searchParams.get("service");
        if (service) {
            if (service.length > 100) return NextResponse.json({ message: "Invalid service filter" }, { status: 400 });
            // Search within services array
            const escapedService = service.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            query["services.name"] = { $regex: escapedService, $options: "i" };
        }

        const businesses = await Business.find(query)
            .select("name description address category email phone website logoUrl timezone services availability lat lng stats")
            .lean();
        return NextResponse.json(businesses);
    } catch (error: any) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// POST: Create a new business (Protected)
export async function POST(req: Request) {
    try {
        await dbConnect();
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const user = await requireUser("business");
        if (!user) return NextResponse.json({ message: "Business access only" }, { status: 403 });

        const body = await req.json();
        if (!body || typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 150) {
            return NextResponse.json({ message: "Business name must be 2-150 characters" }, { status: 400 });
        }
        const businessData: Record<string, unknown> = { name: body.name.trim() };
        for (const field of ["description", "address", "category", "email", "phone", "website", "logoUrl", "timezone"] as const) {
            if (body[field] !== undefined) {
                if (typeof body[field] !== "string" || body[field].length > 1000) {
                    return NextResponse.json({ message: "Invalid business " + field }, { status: 400 });
                }
                businessData[field] = body[field].trim();
            }
        }
        for (const field of ["lat", "lng"] as const) {
            if (body[field] !== undefined) {
                if (typeof body[field] !== "number" || !Number.isFinite(body[field])) {
                    return NextResponse.json({ message: "Invalid business location" }, { status: 400 });
                }
                businessData[field] = body[field];
            }
        }
        const newBusiness = await Business.create({ ...businessData, owner: user.id, isVerified: false });

        return NextResponse.json(newBusiness, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
