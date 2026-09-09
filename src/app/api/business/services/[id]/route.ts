import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { isSameOrigin, requireUser } from "@/lib/auth";
import { validateService } from "@/lib/businessValidation";

async function getBusinessForOwner() {
    const user = await requireUser("business");
    return user ? Business.findOne({ owner: user.id }) : null;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const business = await getBusinessForOwner();
        if (!business) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { id: serviceId } = await params;
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const body = await req.json();
        const validated = validateService(body, true);
        if (validated.error) return NextResponse.json({ message: validated.error }, { status: 400 });

        const service = business.services.find((s: any) => s._id.toString() === serviceId);
        if (!service) return NextResponse.json({ message: "Service not found" }, { status: 404 });

        // Update only provided fields
        Object.assign(service, validated.value);

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

        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const serviceId = (await params).id;
        const before = business.services.length;

        // Filter out the service with the matching _id
        business.services = business.services.filter(
            (service: any) => service._id.toString() !== serviceId
        );
        if (business.services.length === before) {
            return NextResponse.json({ message: "Service not found" }, { status: 404 });
        }

        await business.save();

        return NextResponse.json({ message: "Service deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("DELETE /api/business/services/[id] Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

