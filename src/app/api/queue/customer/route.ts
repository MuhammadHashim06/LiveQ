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

        // Fetch each active business queue once, then calculate all positions in memory.
        const businessIds = [...new Set(
            userQueues
                .filter((q: any) => q.status === "waiting" || q.status === "serving")
                .map((q: any) => q.business?._id?.toString())
                .filter(Boolean)
        )];
        const activeQueue = await Queue.find({
            business: { $in: businessIds },
            status: { $in: ["waiting", "serving"] }
        })
            .sort({ sortOrder: 1, joinedAt: 1 })
            .select("_id business")
            .lean();
        const positions = new Map<string, { position: number; peopleAhead: number }>();
        const byBusiness = new Map<string, typeof activeQueue>();
        for (const item of activeQueue) {
            const key = item.business.toString();
            const list = byBusiness.get(key) || [];
            list.push(item);
            byBusiness.set(key, list);
        }
        for (const list of byBusiness.values()) {
            list.forEach((item, index) => {
                positions.set((item as any)._id.toString(), { position: index + 1, peopleAhead: index });
            });
        }
        const queuesWithPosition = userQueues.map((q: any) => ({
            ...q,
            ...(positions.get(q._id.toString()) || { position: null, peopleAhead: 0 })
        }));

        return NextResponse.json(queuesWithPosition);
    } catch (error: any) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
