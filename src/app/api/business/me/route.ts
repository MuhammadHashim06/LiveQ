import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const payload = jwt.verify(token, JWT_SECRET) as any;
        if (payload.role !== "business") return NextResponse.json({ message: "Business access only" }, { status: 403 });

        const business = await Business.findOne({ owner: payload.id });
        if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        return NextResponse.json(business);
    } catch (error: any) {
        console.error("GET /api/business/me Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const payload = jwt.verify(token, JWT_SECRET) as any;
        if (payload.role !== "business") return NextResponse.json({ message: "Business access only" }, { status: 403 });

        const body = await req.json();
        const fields = ["name", "description", "address", "category", "email", "phone", "website", "logoUrl", "lat", "lng"];
        const updates = Object.fromEntries(fields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));

        const updatedBusiness = await Business.findOneAndUpdate(
            { owner: payload.id },
            { $set: updates, $setOnInsert: { owner: payload.id } },
            { new: true, upsert: true } // upsert true allows creating if not exists via this endpoint too
        );

        return NextResponse.json(updatedBusiness);
    } catch (error: any) {
        console.error("PUT /api/business/me Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
