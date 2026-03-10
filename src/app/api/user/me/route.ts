import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const payload = jwt.verify(token, JWT_SECRET) as any;

        // Fetch user without exposing the password
        const user = await User.findById(payload.id).select("-password -resetPasswordToken -resetPasswordExpire");
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
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const payload = jwt.verify(token, JWT_SECRET) as any;

        const body = await req.json();

        // Prevent updating sensitive fields directly through this endpoint
        delete body.password;
        delete body.email; // Usually emails shouldn't be updated loosely
        delete body.role;
        delete body.resetPasswordToken;
        delete body.resetPasswordExpire;

        const updatedUser = await User.findByIdAndUpdate(
            payload.id,
            { $set: body },
            { new: true }
        ).select("-password -resetPasswordToken -resetPasswordExpire");

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error("PUT /api/user/me Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
