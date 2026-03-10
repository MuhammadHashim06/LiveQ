import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail, verifyEmailTemplate } from "@/lib/email";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedVerificationToken = crypto.createHash('sha256').update(otpCode).digest('hex');

        // Set expiration to 15 minutes from now
        const verifyEmailExpire = new Date();
        verifyEmailExpire.setMinutes(verifyEmailExpire.getMinutes() + 15);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            isEmailVerified: false,
            verifyEmailToken: hashedVerificationToken,
            verifyEmailExpire: verifyEmailExpire
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
        return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 });
    }
}
