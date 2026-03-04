import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const payload = jwt.verify(token, JWT_SECRET) as any;

        const { name, price, duration, description } = await req.json();

        const updatedBusiness = await Business.findOneAndUpdate(
            { owner: payload.id },
            {
                $push: {
                    services: { name, price, duration, description }
                }
            },
            { new: true }
        );

        if (!updatedBusiness) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        return NextResponse.json(updatedBusiness.services);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    // Return services for the logged in business
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const payload = jwt.verify(token, JWT_SECRET) as any;

        const business = await Business.findOne({ owner: payload.id });
        if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        return NextResponse.json(business.services);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
