import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { isSameOrigin, requireUser } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();

        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const admin = await requireUser("admin");
        if (!admin) return NextResponse.json({ message: "Forbidden: Admin access only" }, { status: 403 });

        const { id } = await params;

        // Prevent deleting oneself
        if (admin.id === id) {
            return NextResponse.json({ message: "Cannot delete your own admin account" }, { status: 400 });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
