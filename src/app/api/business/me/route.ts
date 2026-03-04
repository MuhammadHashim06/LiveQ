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

        const body = await req.json();

        const updatedBusiness = await Business.findOneAndUpdate(
            { owner: payload.id },
            { $set: body },
            { new: true, upsert: true } // upsert true allows creating if not exists via this endpoint too
        );

        return NextResponse.json(updatedBusiness);
    } catch (error: any) {
        console.error("PUT /api/business/me Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
