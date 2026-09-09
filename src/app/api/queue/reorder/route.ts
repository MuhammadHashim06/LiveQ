import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Queue from "@/models/Queue";
import Business from "@/models/Business";
import { isSameOrigin, requireUser } from "@/lib/auth";
import { emitBusinessEvent } from "@/lib/realtime";

// PUT: Bulk update sortOrder for queue items (Drag and Drop)
export async function PUT(req: Request) {
    try {
        await dbConnect();

        // 1. Authenticate Business Owner
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const user = await requireUser("business");
        if (!user) return NextResponse.json({ message: "Business access only" }, { status: 403 });

        const business = await Business.findOne({ owner: user.id });
        if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        // 2. Parse body: expecting [{ _id: string, sortOrder: number }]
        const updates = await req.json();

        if (!Array.isArray(updates) || updates.length > 500 || updates.some((update) =>
            !update ||
            typeof update._id !== "string" ||
            !Number.isInteger(update.sortOrder) ||
            update.sortOrder < 0
        )) {
            return NextResponse.json({ message: "Invalid payload, array of updates expected." }, { status: 400 });
        }

        // 3. Perform bulk update
        const bulkOps = updates.map(update => ({
            updateOne: {
                filter: { _id: update._id, business: business._id }, // Ensure they only update their own queue
                update: { $set: { sortOrder: update.sortOrder } }
            }
        }));

        if (bulkOps.length > 0) {
            await Queue.bulkWrite(bulkOps);
        }
        emitBusinessEvent(
            String(business._id),
            "queue:changed",
            { businessId: String(business._id) },
            String(business.owner)
        );

        return NextResponse.json({ message: "Queue reordered successfully" }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
