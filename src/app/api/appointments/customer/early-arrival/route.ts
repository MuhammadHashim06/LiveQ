import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment";
import Notification from "@/models/Notification";
import { getUser } from "@/lib/auth";

export async function PATCH(req: Request) {
    try {
        await dbConnect();

        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { appointmentId } = await req.json();

        if (!appointmentId) {
            return NextResponse.json({ message: "Appointment ID is required" }, { status: 400 });
        }

        const appointment = await Appointment.findOneAndUpdate(
            { _id: appointmentId, user: user.id },
            { $set: { earlyArrivalRequested: true } },
            { new: true }
        ).populate('business', 'owner name');

        if (!appointment) {
            return NextResponse.json({ message: "Appointment not found or you don't have permission" }, { status: 404 });
        }

        // Notify Business Owner
        if (appointment.business && appointment.business.owner) {
            const timeStr = new Date(appointment.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            await Notification.create({
                recipient: appointment.business.owner,
                type: "queue_update",
                title: "Early Arrival Request",
                message: `${user.name || 'A customer'} has arrived early for their ${timeStr} appointment. Check your Live Queue dashboard.`,
                link: "/dashboard/business/queue"
            });
        }

        return NextResponse.json(appointment);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
