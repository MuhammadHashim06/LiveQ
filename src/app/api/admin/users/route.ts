import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        console.log("Admin Users API called");
        await dbConnect();

        const user = await requireUser("admin");
        if (!user) return NextResponse.json({ message: "Forbidden: Admin access only" }, { status: 403 });

        const users = await User.find({})
            .select("-password -resetPasswordToken -resetPasswordExpire -verifyEmailToken -verifyEmailExpire")
            .sort({ createdAt: -1 });
        console.log(`Found ${users.length} users`);
        return NextResponse.json(users);
    } catch (error: any) {
        console.error("Admin Users API error:", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
