import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Business from "@/models/Business";
import Appointment from "@/models/Appointment";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: Request) {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));

        const [userCount, businessCount, appointmentCount] = await Promise.all([
            User.countDocuments({}),
            Business.countDocuments({}),
            Appointment.countDocuments({ createdAt: { $gte: startOfDay } })
        ]);

        return NextResponse.json({
            users: userCount,
            businesses: businessCount,
            todayAppointments: appointmentCount,
            growth: 15 // Placeholder for now
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
