import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import { getUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        await dbConnect();

        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const notifications = await Notification.find({ recipient: user.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return NextResponse.json(notifications);
    } catch (error: any) {
        console.error("GET /api/notifications error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    // Mark ALL as read
    try {
        await dbConnect();

        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await Notification.updateMany(
            { recipient: user.id, read: false },
            { $set: { read: true } }
        );

        return NextResponse.json({ message: "All notifications marked as read" });
    } catch (error: any) {
        console.error("PATCH /api/notifications error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
