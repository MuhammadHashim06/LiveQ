import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Queue from "@/models/Queue";
import Business from "@/models/Business";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// PUT: Bulk update sortOrder for queue items (Drag and Drop)
export async function PUT(req: Request) {
    try {
        await dbConnect();

        // 1. Authenticate Business Owner
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const payload = jwt.verify(token, JWT_SECRET) as any;

        const business = await Business.findOne({ owner: payload.id });
        if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        // 2. Parse body: expecting [{ _id: string, sortOrder: number }]
        const updates = await req.json();

        if (!Array.isArray(updates)) {
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

        return NextResponse.json({ message: "Queue reordered successfully" }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
