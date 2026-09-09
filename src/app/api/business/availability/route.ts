import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { isSameOrigin, requireUser } from "@/lib/auth";
import { validateAvailability } from "@/lib/businessValidation";
import { getBusinessForOwner } from "@/lib/businessQuery";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const user = await requireUser("business");
        if (!user) return NextResponse.json({ message: "Business access only" }, { status: 403 });

        const business = await getBusinessForOwner(user.id);
        if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        return NextResponse.json(business.availability || []);
    } catch (error: any) {
        console.error("GET /api/business/availability Error:", error);
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

        const validated = validateAvailability(body);
        if (validated.error) return NextResponse.json({ message: validated.error }, { status: 400 });

        const business = await Business.findOneAndUpdate(
            { owner: user.id },
            { $set: { availability: validated.value } },
            { new: true }
        );

        if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        return NextResponse.json({ message: "Availability updated successfully", availability: business.availability }, { status: 200 });
    } catch (error: any) {
        console.error("PUT /api/business/availability Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
