import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { isSameOrigin, requireUser } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();

        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const user = await requireUser("admin");
        if (!user) return NextResponse.json({ message: "Forbidden: Admin access only" }, { status: 403 });

        const { id } = await params;

        const business = await Business.findByIdAndDelete(id);

        if (!business) {
            return NextResponse.json({ message: "Business not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Business deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
