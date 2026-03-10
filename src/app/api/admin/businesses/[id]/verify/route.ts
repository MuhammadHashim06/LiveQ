import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import User from "@/models/User";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sendEmail, businessVerificationTemplate } from "@/lib/email";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const payload = jwt.verify(token, JWT_SECRET) as any;

        if (payload.role !== "admin") {
            return NextResponse.json({ message: "Forbidden: Admin access only" }, { status: 403 });
        }

        const body = await req.json();
        const { isVerified } = body;

        const { id } = await params;

        const business = await Business.findByIdAndUpdate(
            id,
            { isVerified },
            { new: true }
        ).populate('owner');

        if (!business) {
            return NextResponse.json({ message: "Business not found" }, { status: 404 });
        }

        // If newly verified, send congratulations email to the owner
        if (isVerified && business.owner) {
            try {
                // Determine owner email (from populated user or from business contact email)
                // Business.owner is populated, so it has .email and .name
                const owner = business.owner as any;
                const ownerEmail = owner.email || business.email;
                if (ownerEmail) {
                    await sendEmail({
                        to: ownerEmail,
                        subject: "Your LiveQ Business is Verified! 🎉",
                        html: businessVerificationTemplate(owner.name || 'Business Owner', business.name)
                    });
                    console.log(`Verification email sent to ${ownerEmail}`);
                }
            } catch (emailErr) {
                console.error("Failed to send verification email:", emailErr);
                // Do not throw the error to avoid failing the verification API entirely
            }
        }

        return NextResponse.json({ message: `Business ${isVerified ? 'verified' : 'unverified'} successfully`, business });
    } catch (error: any) {
        console.error("Admin Verify API error:", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
