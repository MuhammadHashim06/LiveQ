import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Queue from "@/models/Queue";
import { getUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        await dbConnect();

        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Fetch all queues for this user, populated with business info
        const userQueues = await Queue.find({ user: user.id })
            .populate("business", "name category address lat lng")
            .sort({ joinedAt: -1 })
            .lean();

        // For active queues (waiting/serving), calculate their relative position
        const queuesWithPosition = await Promise.all(
            userQueues.map(async (q: any) => {
                let position = null;
                let peopleAhead = 0;

                if (q.status === "waiting" || q.status === "serving") {
                    // To get the exact position respecting custom drag-and-drop sorts,
                    // we fetch the ordered list of active queues for this business
                    const activeQueue = await Queue.find({
                        business: q.business._id,
                        status: { $in: ["waiting", "serving"] }
                    })
                        .sort({ sortOrder: 1, joinedAt: 1 })
                        .select("_id")
                        .lean();

                    // Find where this specific queue ticket sits in the sorted list
                    const index = activeQueue.findIndex((item: any) => item._id.toString() === q._id.toString());

                    if (index !== -1) {
                        peopleAhead = index;
                        position = index + 1;
                    }
                }

                return {
                    ...q,
                    position,
                    peopleAhead
                };
            })
        );

        return NextResponse.json(queuesWithPosition);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
