import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { getUser } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    // Mark SINGLE notification as read
    try {
        await dbConnect();
        const resolvedParams = await params;

        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: resolvedParams.id, recipient: user.id },
            { $set: { read: true } },
            { new: true }
        );

        if (!notification) {
            return NextResponse.json({ message: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json(notification);
    } catch (error: any) {
        console.error(`PATCH /api/notifications/${params} error:`, error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
