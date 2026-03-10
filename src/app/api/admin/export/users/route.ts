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

        if (payload.role !== "admin") {
            return NextResponse.json({ message: "Forbidden: Admin access only" }, { status: 403 });
        }

        const users = await User.find({}).lean();

        // Convert to CSV
        const headers = ["ID", "Name", "Email", "Role", "Joined Date"];
        const rows = users.map(user => [
            user._id.toString(),
            `"${user.name || ''}"`,
            user.email,
            user.role,
            new Date(user.createdAt).toISOString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="liveq_users_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
