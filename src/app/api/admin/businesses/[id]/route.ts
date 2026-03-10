import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const payload = jwt.verify(token, JWT_SECRET) as any;

        if (payload.role !== "admin") {
            return NextResponse.json({ message: "Forbidden: Admin access only" }, { status: 403 });
        }

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
