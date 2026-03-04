import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Queue from "@/models/Queue";
import Business from "@/models/Business";
import { getUser } from "@/lib/auth";
import NotificationModel from "@/models/Notification";

// GET: Fetch queue count for a specific business
export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get("businessId");
        const action = searchParams.get("action");

        if (!businessId) {
            return NextResponse.json({ message: "Business ID is required" }, { status: 400 });
        }

        const query = {
            business: businessId,
            status: { $in: ["waiting", "serving"] } // Active queue size
        };

        const queueCount = await Queue.countDocuments(query);

        if (action === "list") {
            // Also return the sorted list of people in the queue
            const queueList = await Queue.find(query)
                .sort({ sortOrder: 1, joinedAt: 1 }) // Respect custom order first
                .select("name status joinedAt user") // Obscuring user id is not strictly necessary but keeping just vital info
                .lean();

            return NextResponse.json({ count: queueCount, list: queueList });
        }

        return NextResponse.json({ count: queueCount });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST: Add current logged-in customer to a business queue
export async function POST(req: Request) {
    try {
        await dbConnect();

        // We require the customer to be logged in to join a queue
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized. Please log in to join the queue." }, { status: 401 });
        }

        const body = await req.json();
        const { businessId, serviceId, notes, customerName } = body;

        if (!businessId) {
            return NextResponse.json({ message: "Business ID is required" }, { status: 400 });
        }

        const business = await Business.findById(businessId);
        if (!business) {
            return NextResponse.json({ message: "Business not found" }, { status: 404 });
        }

        // Use the provided customerName or fallback to the user's name from DB if we fetched it, 
        // currently user id is available via token payload. 
        // A simple fallback is "Registered Customer" if name is not explicitly provided in request.
        const nameToUse = customerName || "Customer";

        const newQueueItem = await Queue.create({
            business: business._id,
            user: user.id, // Linking the queue item to the registered customer
            name: nameToUse,
            service: serviceId || null,
            status: "waiting",
            joinedAt: new Date(),
        });

        // Notify the business owner
        await NotificationModel.create({
            recipient: business.owner,
            type: 'queue_join',
            title: 'New Customer',
            message: `${nameToUse} has joined your queue.`,
            link: '/dashboard/business/queue'
        });

        return NextResponse.json(newQueueItem, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
