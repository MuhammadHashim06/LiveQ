import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: Request) {
    try {
        console.log("Admin Businesses API called");
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            console.log("No token found in cookies");
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        console.log("Token verified. Role:", payload.role);

        if (payload.role !== "admin") {
            console.log("Forbidden access for role:", payload.role);
            return NextResponse.json({ message: "Forbidden: Admin access only" }, { status: 403 });
        }

        const businesses = await Business.find({}).sort({ createdAt: -1 });
        console.log(`Found ${businesses.length} businesses`);
        return NextResponse.json(businesses);
    } catch (error: any) {
        console.error("Admin Businesses API error:", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
