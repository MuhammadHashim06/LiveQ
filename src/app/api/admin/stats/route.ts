import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Business from "@/models/Business";
import Appointment from "@/models/Appointment";
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

        if (payload.role !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const [
            userCount,
            businessCount,
            appointmentCount,
            recentBusinesses,
            recentUsersCount // To calculate basic 30-day user growth
        ] = await Promise.all([
            User.countDocuments({}),
            Business.countDocuments({}),
            Appointment.countDocuments({ createdAt: { $gte: startOfDay } }),
            Business.find({}).sort({ createdAt: -1 }).limit(5).select('name isVerified createdAt'),
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
        ]);

        const recentActivity = recentBusinesses.map((b: any) => ({
            id: b._id,
            type: 'business',
            title: `New business registered: "${b.name}"`,
            date: b.createdAt,
            status: b.isVerified ? 'verified' : 'pending'
        }));

        // Calculate simple % growth over last 30 days
        let growth = 0;
        if (userCount > 0) {
            growth = Math.round((recentUsersCount / userCount) * 100);
        }

        return NextResponse.json({
            users: userCount,
            businesses: businessCount,
            todayAppointments: appointmentCount,
            growth,
            recentActivity
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
