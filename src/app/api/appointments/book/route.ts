import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment";
import Business from "@/models/Business";
import Notification from "@/models/Notification";
import { getUser } from "@/lib/auth";
import { sendEmail, appointmentConfirmationTemplate } from "@/lib/email";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized. Please log in to book an appointment." }, { status: 401 });
        }

        const { businessId, service, scheduledTime: scheduledTimeISO, date, time } = await req.json();

        if (!businessId || !service || (!scheduledTimeISO && (!date || !time))) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const business = await Business.findById(businessId);
        if (!business) {
            return NextResponse.json({ message: "Business not found" }, { status: 404 });
        }

        // Prefer the pre-converted ISO string from the browser (correct timezone).
        // Fall back to the old date+time combination for backward compatibility.
        const scheduledTime = scheduledTimeISO
            ? new Date(scheduledTimeISO)
            : new Date(`${date}T${time}:00`);

        if (isNaN(scheduledTime.getTime())) {
            return NextResponse.json({ message: "Invalid date or time provided" }, { status: 400 });
        }

        // --- Availability Enforcement ---
        // Map JS day index (0=Sun) to day names matching the Business model
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const requestedDayName = dayNames[scheduledTime.getDay()];
        const requestedHH = scheduledTime.getHours();
        const requestedMM = scheduledTime.getMinutes();
        const requestedMinutes = requestedHH * 60 + requestedMM;

        if (business.availability && business.availability.length > 0) {
            const dayAvailability = business.availability.find(
                (a: any) => a.day.toLowerCase() === requestedDayName.toLowerCase()
            );

            if (dayAvailability) {
                if (dayAvailability.isClosed) {
                    return NextResponse.json({
                        message: `${business.name} is closed on ${requestedDayName}. Please choose another day.`
                    }, { status: 400 });
                }

                // Parse HH:MM strings to minutes
                const [openH, openM] = dayAvailability.startTime.split(":").map(Number);
                const [closeH, closeM] = dayAvailability.endTime.split(":").map(Number);
                const openMinutes = openH * 60 + openM;
                const closeMinutes = closeH * 60 + closeM;

                if (requestedMinutes < openMinutes || requestedMinutes >= closeMinutes) {
                    return NextResponse.json({
                        message: `${business.name} is open ${dayAvailability.startTime}–${dayAvailability.endTime} on ${requestedDayName}. Please choose a time within business hours.`
                    }, { status: 400 });
                }
            }
        }
        // --------------------------------


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

        // Send Email Confirmation to Customer
        if (user.email) {
            sendEmail({
                to: user.email as string,
                subject: "Appointment Confirmed! - LiveQ",
                html: appointmentConfirmationTemplate(
                    user.name || "Customer",
                    business.name,
                    service,
                    scheduledTime.toISOString()
                )
            }).catch(err => console.error("Failed to send appointment email:", err));
        }

        return NextResponse.json(appointment, { status: 201 });
    } catch (error: any) {
        console.error("Booking API Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
