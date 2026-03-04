import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Queue from "@/models/Queue";
import NotificationModel from "@/models/Notification";
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
                link: `/dashboard/customer/appointments`
            });
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
