import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { requireUser } from "@/lib/auth";

export async function GET() {
    try {
        console.log("Admin Businesses API called");
        await dbConnect();

        const user = await requireUser("admin");
        if (!user) return NextResponse.json({ message: "Forbidden: Admin access only" }, { status: 403 });

        const businesses = await Business.find({}).sort({ createdAt: -1 });
        console.log(`Found ${businesses.length} businesses`);
        return NextResponse.json(businesses);
    } catch (error: any) {
        console.error("Admin Businesses API error:", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
