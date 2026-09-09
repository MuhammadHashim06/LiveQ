import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { isSameOrigin, requireUser } from "@/lib/auth";
import { getBusinessForOwner } from "@/lib/businessQuery";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const user = await requireUser("business");
        if (!user) return NextResponse.json({ message: "Business access only" }, { status: 403 });

        const business = await getBusinessForOwner(user.id);
        if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        return NextResponse.json(business);
    } catch (error: any) {
        console.error("GET /api/business/me Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const user = await requireUser("business");
        if (!user) return NextResponse.json({ message: "Business access only" }, { status: 403 });

        const body = await req.json();
        if (!body || typeof body !== "object") {
            return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
        }
        const updates: Record<string, unknown> = {};
        for (const field of ["name", "description", "address", "category", "email", "phone", "website", "logoUrl", "timezone"] as const) {
            if (body[field] !== undefined) {
                if (typeof body[field] !== "string" || body[field].length > 1000) {
                    return NextResponse.json({ message: "Invalid business " + field }, { status: 400 });
                }
                updates[field] = body[field].trim();
            }
        }
        if (updates.name !== undefined && (String(updates.name).length < 2 || String(updates.name).length > 150)) {
            return NextResponse.json({ message: "Business name must be 2-150 characters" }, { status: 400 });
        }
        for (const field of ["lat", "lng"] as const) {
            if (body[field] !== undefined) {
                if (typeof body[field] !== "number" || !Number.isFinite(body[field])) {
                    return NextResponse.json({ message: "Invalid business location" }, { status: 400 });
                }
                updates[field] = body[field];
            }
        }

        const updatedBusiness = await Business.findOneAndUpdate(
            { owner: user.id },
            { $set: updates, $setOnInsert: { owner: user.id } },
            { new: true, upsert: true } // upsert true allows creating if not exists via this endpoint too
        );

        return NextResponse.json(updatedBusiness);
    } catch (error: any) {
        console.error("PUT /api/business/me Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
