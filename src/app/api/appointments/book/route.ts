import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment";
import Business from "@/models/Business";
import Notification from "@/models/Notification";
import { getUser, isSameOrigin } from "@/lib/auth";
import { sendEmail, appointmentConfirmationTemplate } from "@/lib/email";
import { emitUserEvent } from "@/lib/realtime";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const user = await getUser();
        if (!user || user.role !== "customer") {
            return NextResponse.json({ message: "Unauthorized. Please log in to book an appointment." }, { status: 401 });
        }
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });

        const body = await req.json();
        const businessId = body?.businessId;
        const service = body?.service;
        const scheduledTimeISO = body?.scheduledTime;

        if (
            typeof businessId !== "string" ||
            !mongoose.isValidObjectId(businessId) ||
            typeof service !== "string" ||
            typeof scheduledTimeISO !== "string"
        ) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const business = await Business.findOne({ _id: businessId, isVerified: true });
        if (!business) {
            return NextResponse.json({ message: "Business not found" }, { status: 404 });
        }

        const serviceName = service.trim();
        if (!serviceName || !business.services.some((item: { name: string }) => item.name === serviceName)) {
            return NextResponse.json({ message: "Invalid service" }, { status: 400 });
        }

        // The client must send an ISO timestamp with its timezone offset.
        const scheduledTime = new Date(scheduledTimeISO);

        if (isNaN(scheduledTime.getTime())) {
            return NextResponse.json({ message: "Invalid date or time provided" }, { status: 400 });
        }

        // Prevent booking in the past (with a 5-minute grace period)
        const now = new Date();
        const bufferTime = new Date(now.getTime() - 5 * 60000);
        if (scheduledTime < bufferTime) {
            return NextResponse.json({ message: "Cannot book an appointment in the past." }, { status: 400 });
        }

        // --- Availability Enforcement ---
        // Availability is local to the business, not to the server process.
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const timezone = business.timezone || "Asia/Karachi";
        let localTime: Record<string, string>;
        try {
            localTime = Object.fromEntries(
                new Intl.DateTimeFormat("en-US", {
                    timeZone: timezone,
                    weekday: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                    hourCycle: "h23"
                }).formatToParts(scheduledTime).map(({ type, value }) => [type, value])
            );
        } catch {
            return NextResponse.json({ message: "Business timezone is invalid" }, { status: 400 });
        }

        const requestedDayName = localTime.weekday || dayNames[scheduledTime.getUTCDay()];
        const requestedHH = Number(localTime.hour);
        const requestedMM = Number(localTime.minute);
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


        const existingAppointment = await Appointment.exists({
            business: businessId,
            user: user.id,
            scheduledTime,
            status: { $in: ["pending", "confirmed"] }
        });
        if (existingAppointment) {
            return NextResponse.json({ message: "You already have an appointment at this time" }, { status: 409 });
        }

        const appointment = await Appointment.create({
            business: businessId,
            user: user.id,
            serviceName,
            scheduledTime,
            status: "pending"
        });

        // Notify Business Owner
        await Notification.create({
            recipient: business.owner,
            type: "system",
            title: "New Appointment Request",
            message: `${user.name || 'A customer'} requested an appointment for ${serviceName} on ${scheduledTime.toLocaleDateString()} at ${scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
            link: "/dashboard/business/appointments"
        });
        emitUserEvent(String(business.owner), "appointment:changed", { businessId: String(business._id) });
        emitUserEvent(String(business.owner), "notification:changed");

        // Send Email Confirmation to Customer
        if (user.email) {
            sendEmail({
                to: user.email as string,
                subject: "Appointment Confirmed! - LiveQ",
                html: appointmentConfirmationTemplate(
                    user.name || "Customer",
                    business.name,
                    serviceName,
                    scheduledTime.toISOString()
                )
            }).catch(err => console.error("Failed to send appointment email:", err));
        }

        return NextResponse.json(appointment, { status: 201 });
    } catch (error: any) {
        console.error("Booking API Error:", error);
        if (error?.code === 11000) {
            return NextResponse.json({ message: "You already have an appointment at this time" }, { status: 409 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
