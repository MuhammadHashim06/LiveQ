import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
        }

        // 1. Get hashed OTP from the plaintext OTP
        const hashedVerificationToken = crypto.createHash('sha256').update(otp).digest('hex');

        // 2. Find user with that token (and email) and ensure it hasn't expired
        const user = await User.findOne({
            email,
            verifyEmailToken: hashedVerificationToken,
            verifyEmailExpire: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json({ message: "Invalid or expired verification code" }, { status: 400 });
        }

        // 3. Mark as verified and clear the token
        user.isEmailVerified = true;
        user.verifyEmailToken = undefined;
        user.verifyEmailExpire = undefined;
        await user.save();

        // 4. Generate a JWT token to log the user in directly
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                name: user.name,
                email: user.email,
                isEmailVerified: true
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 5. Send the success response with the cookie
        const response = NextResponse.json({
            message: "Email verified successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: true
            }
        }, { status: 200 });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });

        return response;

    } catch (error: any) {
        console.error("OTP Verification Error:", error);
        return NextResponse.json({ message: "Verification failed" }, { status: 500 });
    }
}
