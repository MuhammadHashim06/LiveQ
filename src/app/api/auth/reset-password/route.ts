import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import crypto from "crypto";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ message: "Token and new password are required" }, { status: 400 });
        }

        // Hash the token from the URL to compare with DB
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with that token that hasn't expired
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
