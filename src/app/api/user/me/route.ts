import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { isSameOrigin, requireUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await requireUser();
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // Fetch user without exposing the password
        const user = await User.findById(session.id).select("-password -resetPasswordToken -resetPasswordExpire -verifyEmailToken -verifyEmailExpire");
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        return NextResponse.json(user);
    } catch (error: any) {
        console.error("GET /api/user/me Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const session = await requireUser();
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const updates: Record<string, string> = {};
        for (const field of ["name", "phoneNumber", "profileImage"] as const) {
            if (body[field] !== undefined) {
                if (typeof body[field] !== "string" || body[field].length > 500) {
                    return NextResponse.json({ message: "Invalid " + field }, { status: 400 });
                }
                updates[field] = body[field].trim();
            }
        }
        if (updates.name !== undefined && (updates.name.length < 2 || updates.name.length > 100)) {
            return NextResponse.json({ message: "Name must be 2-100 characters" }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            session.id,
            { $set: updates },
            { new: true }
        ).select("-password -resetPasswordToken -resetPasswordExpire -verifyEmailToken -verifyEmailExpire");

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error("PUT /api/user/me Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
