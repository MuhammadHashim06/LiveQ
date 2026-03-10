import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const authUser = await getUser();
        if (!authUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: "Both current and new password are required" }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ message: "New password must be at least 8 characters" }, { status: 400 });
        }

        // Fetch the user from DB (with password field)
        const user = await User.findById(authUser.id).select("+password");
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
        }

        // Hash new password and save
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error: any) {
        console.error("POST /api/user/change-password Error:", error);
        return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 });
    }
}
