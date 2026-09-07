import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment";
import Queue from "@/models/Queue";
import Business from "@/models/Business";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getUser } from "@/lib/auth";
import { sendEmail, queueJoinedTemplate } from "@/lib/email";
import { emitBusinessEvent, emitUserEvent } from "@/lib/realtime";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const user = await getUser();
        if (!user || user.role !== "business") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { appointmentId, priority } = await req.json();

        if (!appointmentId) {
            return NextResponse.json({ message: "Appointment ID is required" }, { status: 400 });
        }

        const business = await Business.findOne({ owner: user.id });
        if (!business) {
            return NextResponse.json({ message: "Business not found" }, { status: 404 });
        }

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            business: business._id,
            status: "confirmed",
            checkedInAt: { $exists: false }
        });
        if (!appointment) {
            return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
        }

        const waitingQueue = await Queue.find({ business: business._id, status: "waiting" })
            .sort({ sortOrder: 1, joinedAt: 1 })
            .select("sortOrder")
            .lean();
        const firstSortOrder = waitingQueue[0]?.sortOrder;
        const lastSortOrder = waitingQueue[waitingQueue.length - 1]?.sortOrder;
        const newSortOrder = priority
            ? (firstSortOrder ?? Date.now()) - 1
            : (lastSortOrder ?? Date.now()) + 1;
        const newPosition = priority ? 1 : waitingQueue.length + 1;

        // Create the Queue Ticket
        const newQueueItem = await Queue.create({
            business: business._id,
            user: appointment.user,
            appointment: appointment._id,
            name: `(Apt) ${appointment.serviceName}`, // Visually denote it's from an appointment
            status: "waiting",
            sortOrder: newSortOrder
        });

        // Keep the appointment confirmed until the queue item is completed.
        appointment.checkedInAt = new Date();
        await appointment.save();
        const realtimePayload = { businessId: String(business._id), appointmentId: String(appointment._id) };
        emitBusinessEvent(String(business._id), "queue:changed", realtimePayload, String(business.owner));
        emitUserEvent(String(appointment.user), "queue:changed", realtimePayload);
        emitUserEvent(String(appointment.user), "appointment:changed", realtimePayload);

        // Notify the Customer
        await Notification.create({
            recipient: appointment.user,
            type: "queue_update",
            title: "Added to Live Queue",
            message: `Your appointment check-in was successful. You have been added to the Live Queue at position ${newPosition}.`,
            link: "/dashboard/customer/appointments" // They can view their live queue here
        });
        emitUserEvent(String(appointment.user), "notification:changed");

        // Send Email to Customer
        try {
            const customer = await User.findById(appointment.user);
            if (customer && customer.email) {
                await sendEmail({
                    to: customer.email,
                    subject: "You're in line! - LiveQ",
                    html: queueJoinedTemplate(
                        customer.name || 'Customer',
                        business.name,
                        newPosition
                    )
                });
            }
        } catch (e) {
            console.error("Email Error:", e);
        }

        return NextResponse.json(newQueueItem, { status: 201 });
    } catch (error: any) {
        console.error("Check-in Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
