import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import User from "@/models/User"; // Ensure referenced models are available

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const resolvedParams = await params;

        // 1. Get the business object
        // Fetch public data only (name, email, category, address, phone, lat, lng, services)
        // Ensure you omit private owner data if necessary 
        const business = await Business.findById(resolvedParams.id).lean();

        if (!business) {
            return NextResponse.json({ message: "Business not found" }, { status: 404 });
        }

        // Return the clean public payload
        return NextResponse.json(business);

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
