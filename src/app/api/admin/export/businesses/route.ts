import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import { requireUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        await dbConnect();

        const user = await requireUser("admin");
        if (!user) return NextResponse.json({ message: "Forbidden: Admin access only" }, { status: 403 });

        const businesses = await Business.find({}).lean();

        // Convert to CSV
        const headers = ["ID", "Name", "Category", "Verified", "Address", "Created Date", "Rating", "Total Customers"];
        const rows = businesses.map((b: any) => [
            b._id.toString(),
            `"${b.name || ''}"`,
            `"${b.category || 'General'}"`,
            b.isVerified ? 'Yes' : 'No',
            `"${b.address || ''}"`,
            new Date(b.createdAt).toISOString(),
            b.stats?.rating || 0,
            b.stats?.totalCustomers || 0
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row: any) => row.join(","))
        ].join("\n");

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="liveq_businesses_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
