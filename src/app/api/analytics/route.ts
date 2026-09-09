import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import Queue from "@/models/Queue";
import Appointment from "@/models/Appointment";
import { requireUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const user = await requireUser("business");
        if (!user) return NextResponse.json({ message: "Business access only" }, { status: 403 });

        const business = await Business.findOne({ owner: user.id });
        if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Build 7-day daily breakdown for chart
        const dailyData: { date: string; customers: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date(startOfToday);
            dayStart.setDate(startOfToday.getDate() - i);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayStart.getDate() + 1);

            const count = await Queue.countDocuments({
                business: business._id,
                status: 'completed',
                joinedAt: { $gte: dayStart, $lt: dayEnd }
            });

            dailyData.push({
                date: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
                customers: count
            });
        }

        const [todayCount, weekCount, monthCount, activeQueueCount, pendingApptCount] = await Promise.all([
            Queue.countDocuments({ business: business._id, status: 'completed', joinedAt: { $gte: startOfToday } }),
            Queue.countDocuments({ business: business._id, status: 'completed', joinedAt: { $gte: startOfWeek } }),
            Queue.countDocuments({ business: business._id, status: 'completed', joinedAt: { $gte: startOfMonth } }),
            Queue.countDocuments({ business: business._id, status: { $in: ['waiting', 'serving'] } }),
            Appointment.countDocuments({ business: business._id, status: 'pending' }),
        ]);

        return NextResponse.json({
            today: todayCount,
            week: weekCount,
            month: monthCount,
            activeQueue: activeQueueCount,
            pendingAppointments: pendingApptCount,
            rating: business.stats?.rating || 0,
            totalCustomers: business.stats?.totalCustomers || 0,
            dailyData
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

