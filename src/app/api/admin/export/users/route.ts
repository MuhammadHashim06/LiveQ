import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        await dbConnect();

        const user = await requireUser("admin");
        if (!user) return NextResponse.json({ message: "Forbidden: Admin access only" }, { status: 403 });

        const users = await User.find({}).lean();

        // Convert to CSV
        const headers = ["ID", "Name", "Email", "Role", "Joined Date"];
        const rows = users.map(user => [
            String(user._id),
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
