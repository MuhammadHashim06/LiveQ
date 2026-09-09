import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Queue from "@/models/Queue";
import Business from "@/models/Business";
import Appointment from "@/models/Appointment";
import NotificationModel from "@/models/Notification";
import User from "@/models/User";
import { sendEmail, queueUpdateTemplate } from "@/lib/email";
import { getUser, isSameOrigin } from "@/lib/auth";
import { emitBusinessEvent, emitUserEvent } from "@/lib/realtime";

// PATCH: Update status (serving, completed, removed)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await dbConnect();
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const body = await req.json();
        const status = body?.status; // "serving", "completed", "removed", "waiting" (for undo)
        const allowedStatuses = ["waiting", "serving", "completed", "removed", "cancelled"];
        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({ message: "Invalid queue status" }, { status: 400 });
        }

        const user = await getUser();
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        let updatedQueue = await Queue.findById(id).populate('business', 'name owner');
        if (!updatedQueue) return NextResponse.json({ message: "Queue item not found" }, { status: 404 });
        const transitions: Record<string, string[]> = {
            waiting: ["serving", "removed", "cancelled"],
            serving: ["waiting", "completed", "removed", "cancelled"],
            completed: [],
            removed: [],
            cancelled: [],
        };
        if (!transitions[updatedQueue.status]?.includes(status)) {
            return NextResponse.json({ message: "Invalid queue status transition" }, { status: 409 });
        }

        const business = updatedQueue.business as any;
        const isBusinessOwner = user.role === "business" && business?.owner?.toString() === user.id;
        const isCustomerCancel = user.role === "customer" && status === "cancelled" &&
            ["waiting", "serving"].includes(updatedQueue.status) && updatedQueue.user?.toString() === user.id;
        if (!isBusinessOwner && !isCustomerCancel) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const previousStatus = updatedQueue.status;
        const wasCompleted = previousStatus === "completed";
        const transitionedQueue = await Queue.findOneAndUpdate(
            { _id: id, status: previousStatus },
            { $set: { status } },
            { new: true, runValidators: true }
        ).populate("business", "name owner");
        if (!transitionedQueue) {
            return NextResponse.json({ message: "Queue item was updated by another request" }, { status: 409 });
        }
        updatedQueue = transitionedQueue;
        const realtimePayload = { businessId: String(business._id), queueId: id };
        emitBusinessEvent(String(business._id), "queue:changed", realtimePayload, String(business.owner));
        emitUserEvent(updatedQueue.user?.toString(), "queue:changed", realtimePayload);

        if (updatedQueue && updatedQueue.user && status === 'serving') {
            await NotificationModel.create({
                recipient: updatedQueue.user,
                type: 'queue_update',
                title: "It's your turn!",
                message: `The business ${updatedQueue.business?.name || ''} is ready to serve you.`,
                link: `/dashboard/customer/queue`
            });
            emitUserEvent(updatedQueue.user.toString(), "notification:changed");

            // Send Email Notification
            const user = await User.findById(updatedQueue.user);
            if (user && user.email) {
                sendEmail({
                    to: user.email,
                    subject: "It's your turn! - LiveQ",
                    html: queueUpdateTemplate(user.name || 'Customer', updatedQueue.business?.name || 'Business', "It's your turn! Please head to the front desk now. They are ready to serve you.")
                }).catch(err => console.error("Email error:", err));
            }
        }

        if (updatedQueue && updatedQueue.user && status === 'cancelled') {
            await NotificationModel.create({
                recipient: updatedQueue.user,
                type: 'system',
                title: "Queue Update: No-Show",
                message: `Your position at ${updatedQueue.business?.name || ''} has been marked as No-Show and cancelled.`,
                link: `/dashboard/customer/queue`
            });
            emitUserEvent(updatedQueue.user.toString(), "notification:changed");

            // Send Email Notification
            const user = await User.findById(updatedQueue.user);
            if (user && user.email) {
                sendEmail({
                    to: user.email,
                    subject: "Queue Cancelled (No-Show) - LiveQ",
                    html: queueUpdateTemplate(user.name || 'Customer', updatedQueue.business?.name || 'Business', "Your position in the queue has been marked as a No-Show and cancelled by the business.")
                }).catch(err => console.error("Email error:", err));
            }
        }

        // Increment totalCustomers when a queue item is completed
        if (status === 'completed' && updatedQueue?.business && !wasCompleted) {
            await Business.findByIdAndUpdate(
                updatedQueue.business._id,
                { $inc: { 'stats.totalCustomers': 1 } }
            );
        }

        if (status === "completed" && updatedQueue.appointment) {
            await Appointment.findByIdAndUpdate(updatedQueue.appointment, { status: "completed" });
            emitUserEvent(updatedQueue.user?.toString(), "appointment:changed", { appointmentId: String(updatedQueue.appointment) });
        }

        return NextResponse.json(updatedQueue);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// DELETE: Remove permanently (or we use status="removed")
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await dbConnect();
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const user = await getUser();
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const queue = await Queue.findById(id).populate("business", "owner");
        if (!queue) return NextResponse.json({ message: "Queue item not found" }, { status: 404 });
        const business = queue.business as any;
        if (user.role !== "business" || business?.owner?.toString() !== user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await queue.deleteOne();
        emitBusinessEvent(String(business._id), "queue:changed", { businessId: String(business._id), queueId: id }, user.id);
        return NextResponse.json({ message: "Deleted" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
