import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment";
import Business from "@/models/Business";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getUser } from "@/lib/auth";
import { sendEmail, appointmentStatusUpdateTemplate } from "@/lib/email";

// GET: Fetch appointments for the logged-in business owner
export async function GET(req: Request) {
    try {
        await dbConnect();

        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const business = await Business.findOne({ owner: user.id });
        if (!business) {
            return NextResponse.json({ message: "Business not found" }, { status: 404 });
        }

        const appointments = await Appointment.find({ business: business._id })
            .populate('user', 'name email')
            .sort({ scheduledTime: 1 }) // Sort by upcoming
            .lean();

        return NextResponse.json(appointments);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// PATCH: Update an appointment's status
export async function PATCH(req: Request) {
    try {
        await dbConnect();

        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Technically, we should verify that this business owner truly owns the appointment they are modifying.
        const business = await Business.findOne({ owner: user.id });
        if (!business) {
            return NextResponse.json({ message: "Business not found" }, { status: 404 });
        }

        const { appointmentId, status } = await req.json();

        if (!appointmentId || !status) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const appointment = await Appointment.findOneAndUpdate(
            { _id: appointmentId, business: business._id },
            { $set: { status } },
            { new: true }
        ).populate('user', 'name');

        if (!appointment) {
            return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
        }

        // Trigger Notification if confirmed or cancelled
        if (['confirmed', 'cancelled', 'completed'].includes(status) && appointment.user) {
            let msg = `Your appointment for ${appointment.serviceName} has been ${status}.`;
            if (status === 'confirmed') msg = `Your appointment for ${appointment.serviceName} is confirmed for ${new Date(appointment.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}.`;

            await Notification.create({
                recipient: appointment.user._id,
                type: "queue_update",
                title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: msg,
                link: "/dashboard/customer/appointments"
            });
        }

        // Send Email to Customer
        try {
            const customer = await User.findById(appointment.user);
            if (customer && customer.email) {
                await sendEmail({
                    to: customer.email,
                    subject: `Appointment ${status === 'approved' ? 'Approved' : 'Updated'} - LiveQ`,
                    html: appointmentStatusUpdateTemplate(
                        customer.name || 'Customer',
                        appointment.business?.name || 'The Business',
                        status
                    )
                });
            }
        } catch (e) {
            console.error("Email error:", e);
        }

        return NextResponse.json(appointment);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
