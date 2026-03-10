import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Queue from "@/models/Queue";
import Business from "@/models/Business";
import NotificationModel from "@/models/Notification";
import User from "@/models/User";
import { sendEmail, queueUpdateTemplate } from "@/lib/email";
import { headers } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// PATCH: Update status (serving, completed, removed)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await dbConnect();
        const { status } = await req.json(); // "serving", "completed", "removed", "waiting" (for undo)

        // Auth check (omitted for brevity but should exist)

        const updatedQueue = await Queue.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('business', 'name');

        if (updatedQueue && updatedQueue.user && status === 'serving') {
            await NotificationModel.create({
                recipient: updatedQueue.user,
                type: 'queue_update',
                title: "It's your turn!",
                message: `The business ${updatedQueue.business?.name || ''} is ready to serve you.`,
                link: `/dashboard/customer/queue`
            });

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
        if (status === 'completed' && updatedQueue?.business) {
            await Business.findByIdAndUpdate(
                updatedQueue.business._id,
                { $inc: { 'stats.totalCustomers': 1 } }
            );
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
        await Queue.findByIdAndDelete(id);
        return NextResponse.json({ message: "Deleted" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
