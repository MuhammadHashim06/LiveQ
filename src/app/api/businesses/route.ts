import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth";

// GET: Fetch all businesses (for customers) with optional filtering
export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const query: any = { isVerified: true };

        const service = searchParams.get("service");
        if (service) {
            // Search within services array
            const escapedService = service.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            query["services.name"] = { $regex: escapedService, $options: "i" };
        }

        const businesses = await Business.find(query);
        return NextResponse.json(businesses);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST: Create a new business (Protected)
export async function POST(req: Request) {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const payload = jwt.verify(token, JWT_SECRET) as any;
        if (payload.role !== "business") return NextResponse.json({ message: "Business access only" }, { status: 403 });

        const body = await req.json();

        // Check if user already has a business? (Optional constraint)

        const fields = ["name", "description", "address", "category", "email", "phone", "website", "logoUrl", "lat", "lng"];
        const businessData = Object.fromEntries(fields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
        const newBusiness = await Business.create({ ...businessData, owner: payload.id, isVerified: false });

        return NextResponse.json(newBusiness, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
