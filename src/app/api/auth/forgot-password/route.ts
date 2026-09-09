import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import crypto from "crypto";
import { sendEmail, passwordResetTemplate } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

        if (!email || email.length > 254) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }
        const limit = rateLimit("forgot:" + getClientIp(req), 5, 15 * 60 * 1000);
        if (!limit.allowed) {
            return NextResponse.json(
                { message: "Too many requests" },
                { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
            );
        }

        const user = await User.findOne({ email });

        if (!user) {
            // Prevent email enumeration
            return NextResponse.json({ message: "If that email exists, a reset link has been sent." }, { status: 200 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
        if (!appUrl && process.env.NODE_ENV === "production") {
            return NextResponse.json({ message: "Password reset is not configured" }, { status: 500 });
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash it and save to DB 
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpire = resetPasswordExpire;
        await user.save();

        // Create reset url (frontend route we will build)
        // using the unhashed token for the URL
        const resetUrl = (appUrl || "http://localhost:3000").replace(/\/$/, "") + "/reset-password?token=" + resetToken;

        // Send Email
        const html = passwordResetTemplate(resetUrl);
        const emailResult = await sendEmail({
            to: user.email,
            subject: "LiveQ - Password Reset Request",
            html: html
        });

        if (!emailResult.success) {
            // Reset the token fields if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return NextResponse.json({ message: "Failed to send email. Please try again." }, { status: 500 });
        }

        return NextResponse.json({ message: "If that email exists, a reset link has been sent." }, { status: 200 });

    } catch (error: any) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
