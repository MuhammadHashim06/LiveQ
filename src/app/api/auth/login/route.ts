import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail, verifyEmailTemplate } from "@/lib/email";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        // --- NEW: Strict OTP Verification Enforcement ---
        // If the user has explicitly `false` for isEmailVerified, block them.
        // We allow undefined/null to pass for backwards compatibility with old accounts.
        if (user.isEmailVerified === false) {
            // 1. Generate a new 6-digit OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const hashedVerificationToken = crypto.createHash('sha256').update(otpCode).digest('hex');

            // 2. Set new expiration to 15 minutes from now
            const verifyEmailExpire = new Date();
            verifyEmailExpire.setMinutes(verifyEmailExpire.getMinutes() + 15);

            // 3. Update user and save
            user.verifyEmailToken = hashedVerificationToken;
            user.verifyEmailExpire = verifyEmailExpire;
            await user.save();

            // 4. Send the email with the OTP code (Async)
            sendEmail({
                to: user.email,
                subject: "Verify your email address - LiveQ",
                html: verifyEmailTemplate(user.name, otpCode)
            }).catch((err: any) => console.error("Login OTP send error:", err));

            return NextResponse.json({
                message: "Email not verified. A new verification code has been sent to your email.",
                requireVerification: true,
                email: user.email
            }, { status: 403 });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        const response = NextResponse.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified ?? true // Fallback for older accounts
            },
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });

        return response;
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 });
    }
}
