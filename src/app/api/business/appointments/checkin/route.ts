import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment";
import Queue from "@/models/Queue";
import Business from "@/models/Business";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getUser } from "@/lib/auth";
import { sendEmail, queueJoinedTemplate } from "@/lib/email";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const user = await getUser();
        if (!user) {
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

        const appointment = await Appointment.findOne({ _id: appointmentId, business: business._id });
        if (!appointment) {
            return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
        }

        // Prevent double check-ins
        if (appointment.status === 'completed') {
            return NextResponse.json({ message: "Appointment is already completed/checked-in" }, { status: 400 });
        }

        // Determine Position
        let newPosition = 1;
        if (!priority) {
            // Put them at the end of the line
            const lastInQueue = await Queue.findOne({ business: business._id, status: 'waiting' }).sort('-position');
            newPosition = lastInQueue ? (lastInQueue.position || 0) + 1 : 1;
        } else {
            // Push everyone else down (VIP insertion at position 1)
            await Queue.updateMany(
                { business: business._id, status: 'waiting' },
                { $inc: { position: 1 } }
            );
        }

        // Create the Queue Ticket
        const newQueueItem = await Queue.create({
            business: business._id,
            user: appointment.user,
            name: `(Apt) ${appointment.serviceName}`, // Visually denote it's from an appointment
            status: "waiting",
            position: newPosition,
            estimatedWaitTime: priority ? 0 : (newPosition - 1) * 15
        });

        // Mark Appointment as Completed (since it's now in the live queue)
        appointment.status = 'completed';
        await appointment.save();

        // Notify the Customer
        await Notification.create({
            recipient: appointment.user,
            type: "queue_update",
            title: "Added to Live Queue",
            message: `Your appointment check-in was successful. You have been added to the Live Queue at position ${newPosition}.`,
            link: "/dashboard/customer/appointments" // They can view their live queue here
        });

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
