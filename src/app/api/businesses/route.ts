import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET: Fetch all businesses (for customers) with optional filtering
export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const query: any = {};

        const service = searchParams.get("service");
        if (service) {
            // Search within services array
            query["services.name"] = { $regex: service, $options: "i" };
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

        const body = await req.json();

        // Check if user already has a business? (Optional constraint)

        const newBusiness = await Business.create({
            ...body,
            owner: payload.id
        });

        return NextResponse.json(newBusiness, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
