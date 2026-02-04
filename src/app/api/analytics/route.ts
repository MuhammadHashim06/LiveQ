import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import Queue from "@/models/Queue";
import { headers } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const token = (await headers()).get("cookie")?.split("token=")[1]?.split(";")[0];
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        const business = await Business.findOne({ owner: payload.id });
        if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [todayCount, weekCount, monthCount] = await Promise.all([
            Queue.countDocuments({ business: business._id, joinedAt: { $gte: startOfDay } }),
            Queue.countDocuments({ business: business._id, joinedAt: { $gte: startOfWeek } }),
            Queue.countDocuments({ business: business._id, joinedAt: { $gte: startOfMonth } })
        ]);

        return NextResponse.json({
            today: todayCount,
            week: weekCount,
            month: monthCount
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
