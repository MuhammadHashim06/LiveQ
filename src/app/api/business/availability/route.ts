import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const payload = jwt.verify(token, JWT_SECRET) as any;

        const business = await Business.findOne({ owner: payload.id });
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
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const payload = jwt.verify(token, JWT_SECRET) as any;
        const body = await req.json();

        // Expect body to be the full array of availability objects
        if (!Array.isArray(body)) {
            return NextResponse.json({ message: "Invalid payload format. Expected array." }, { status: 400 });
        }

        const business = await Business.findOneAndUpdate(
            { owner: payload.id },
            { $set: { availability: body } },
            { new: true }
        );

        if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        return NextResponse.json({ message: "Availability updated successfully", availability: business.availability }, { status: 200 });
    } catch (error: any) {
        console.error("PUT /api/business/availability Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
