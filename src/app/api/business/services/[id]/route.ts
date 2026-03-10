import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function getBusinessForOwner() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        return await Business.findOne({ owner: payload.id });
    } catch {
        return null;
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const business = await getBusinessForOwner();
        if (!business) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { id: serviceId } = await params;
        const { name, price, duration, description } = await req.json();

        const service = business.services.find((s: any) => s._id.toString() === serviceId);
        if (!service) return NextResponse.json({ message: "Service not found" }, { status: 404 });

        // Update only provided fields
        if (name !== undefined) service.name = name;
        if (price !== undefined) service.price = price;
        if (duration !== undefined) service.duration = duration;
        if (description !== undefined) service.description = description;

        await business.save();

        return NextResponse.json({ message: "Service updated", service }, { status: 200 });
    } catch (error: any) {
        console.error("PATCH /api/business/services/[id] Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const business = await getBusinessForOwner();
        if (!business) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const serviceId = (await params).id;

        // Filter out the service with the matching _id
        business.services = business.services.filter(
            (service: any) => service._id.toString() !== serviceId
        );

        await business.save();

        return NextResponse.json({ message: "Service deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("DELETE /api/business/services/[id] Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

