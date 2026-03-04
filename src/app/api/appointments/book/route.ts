import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment";
import Business from "@/models/Business";
import Notification from "@/models/Notification";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized. Please log in to book an appointment." }, { status: 401 });
        }

        const { businessId, service, date, time } = await req.json();

        if (!businessId || !service || !date || !time) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const business = await Business.findById(businessId);
        if (!business) {
            return NextResponse.json({ message: "Business not found" }, { status: 404 });
        }

        const scheduledTime = new Date(`${date}T${time}`);
        if (isNaN(scheduledTime.getTime())) {
            return NextResponse.json({ message: "Invalid date or time provider" }, { status: 400 });
        }

        const appointment = await Appointment.create({
            business: businessId,
            user: user.id,
            serviceName: service,
            scheduledTime,
            status: "pending"
        });

        // Notify Business Owner
        await Notification.create({
            recipient: business.owner,
            type: "system",
            title: "New Appointment Request",
            message: `${user.name || 'A customer'} requested an appointment for ${service} on ${scheduledTime.toLocaleDateString()} at ${scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
            link: "/dashboard/business/appointments"
        });

        return NextResponse.json(appointment, { status: 201 });
    } catch (error: any) {
        console.error("Booking API Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
