import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Queue from "@/models/Queue";
import Business from "@/models/Business";
import Notification from "@/models/Notification";
import { isSameOrigin, requireUser } from "@/lib/auth";
import { emitBusinessEvent, emitUserEvent } from "@/lib/realtime";

// GET: Fetch queue for current business
export async function GET(req: Request) {
    try {
        await dbConnect();
        const user = await requireUser("business");
        if (!user) return NextResponse.json({ message: "Business access only" }, { status: 403 });

        const business = await Business.findOne({ owner: user.id });
        if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        const queue = await Queue.find({
            business: business._id,
            status: { $in: ["waiting", "serving"] } // Only active queue
        }).sort({ sortOrder: 1, joinedAt: 1 });

        return NextResponse.json(queue);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST: Add customer to queue
export async function POST(req: Request) {
    try {
        await dbConnect();
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const user = await requireUser("business");
        if (!user) return NextResponse.json({ message: "Business access only" }, { status: 403 });

        const business = await Business.findOne({ owner: user.id });
        if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        const body = await req.json();
        const name = body?.name;
        if (name !== undefined && (typeof name !== "string" || name.trim().length > 100)) {
            return NextResponse.json({ message: "Invalid customer name" }, { status: 400 });
        }

        const newQueueItem = await Queue.create({
            business: business._id,
            name: typeof name === "string" && name.trim() ? name.trim() : "Walk-in Customer",
            status: "waiting",
            joinedAt: new Date(),
        });
        const realtimePayload = { businessId: String(business._id) };
        emitBusinessEvent(String(business._id), "queue:changed", realtimePayload, String(business.owner));

        // Create a system notification for the business owner as a paper trail (Optional, but good practice)
        await Notification.create({
            recipient: business.owner,
            type: 'system',
            title: 'Manual Entry',
            message: `You manually added ${newQueueItem.name} to the queue.`,
            link: '/dashboard/business/queue'
        });
        emitUserEvent(String(business.owner), "notification:changed");

        return NextResponse.json(newQueueItem, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
