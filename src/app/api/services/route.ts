import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { headers } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const token = (await headers()).get("cookie")?.split("token=")[1]?.split(";")[0];
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

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
        const token = (await headers()).get("cookie")?.split("token=")[1]?.split(";")[0];
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        const business = await Business.findOne({ owner: payload.id });
        if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        return NextResponse.json(business.services);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
