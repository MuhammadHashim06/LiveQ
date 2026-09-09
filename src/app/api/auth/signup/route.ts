import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendEmail, verifyEmailTemplate } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { createVerificationCode, normalizeEmail } from "@/lib/authHelpers";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { name, email, password, role } = await req.json();

        if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || !role) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        if (name.trim().length < 2 || name.length > 100 || password.length < 8) {
            return NextResponse.json({ message: "Name must be 2-100 characters and password must be at least 8 characters" }, { status: 400 });
        }

        if (role !== "customer" && role !== "business") {
            return NextResponse.json({ message: "Invalid role" }, { status: 400 });
        }

        const limit = rateLimit("signup:" + getClientIp(req), 5, 15 * 60 * 1000);
        if (!limit.allowed) {
            return NextResponse.json(
                { message: "Too many signup attempts" },
                { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
            );
        }

        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !normalizedEmail.includes("@") || normalizedEmail.length > 254) {
            return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { code: otpCode, token: hashedVerificationToken, expiresAt: verifyEmailExpire } = createVerificationCode();

        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role,
            isEmailVerified: false,
            verifyEmailToken: hashedVerificationToken,
            verifyEmailExpire: verifyEmailExpire,
            verifyAttempts: 0,
            verifyLastSentAt: new Date()
        });

        // Send Verification Email asynchronously
        sendEmail({
            to: newUser.email,
            subject: "Verify your email address - LiveQ",
            html: verifyEmailTemplate(newUser.name, otpCode)
        }).catch(err => console.error("Failed to send verification email:", err));

        return NextResponse.json({
            message: "User created successfully. Please check your email to verify your account.",
            user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } // Avoid returning full object with hashed tokens
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
