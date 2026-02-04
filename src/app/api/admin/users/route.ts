import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: Request) {
    try {
        console.log("Admin Users API called");
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

        const users = await User.find({}).sort({ createdAt: -1 });
        console.log(`Found ${users.length} users`);
        return NextResponse.json(users);
    } catch (error: any) {
        console.error("Admin Users API error:", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
