import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import crypto from "crypto";
import { sendEmail, verifyEmailTemplate } from "@/lib/email";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { JWT_SECRET } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        await dbConnect();

        // 1. Get user (either from cookie or from request body)
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const { email } = await req.json().catch(() => ({}));
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        let user;
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
            user = await User.findById(decoded.id);
        } else if (normalizedEmail) {
            user = await User.findOne({ email: normalizedEmail });
        }

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.isEmailVerified) {
            return NextResponse.json({ message: "Email is already verified" }, { status: 400 });
        }

        if (user.verifyLastSentAt && Date.now() - user.verifyLastSentAt.getTime() < 60_000) {
            return NextResponse.json({ message: "Please wait before requesting another code" }, { status: 429 });
        }

        // 3. Generate a new 6-digit OTP
        const otpCode = crypto.randomInt(100000, 1000000).toString();
        const hashedVerificationToken = crypto.createHash('sha256').update(otpCode).digest('hex');

        // 4. Set new expiration to 15 minutes from now
        const verifyEmailExpire = new Date();
        verifyEmailExpire.setMinutes(verifyEmailExpire.getMinutes() + 15);

        // 5. Update user and save
        user.verifyEmailToken = hashedVerificationToken;
        user.verifyEmailExpire = verifyEmailExpire;
        user.verifyAttempts = 0;
        user.verifyLastSentAt = new Date();
        await user.save();

        // 6. Send the email with the OTP code
        await sendEmail({
            to: user.email,
            subject: "Verify your email address - LiveQ",
            html: verifyEmailTemplate(user.name, otpCode)
        });

        return NextResponse.json({ message: "Verification code sent successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Resend Verification Error:", error);
        return NextResponse.json({ message: "Failed to resend verification email" }, { status: 500 });
    }
}
