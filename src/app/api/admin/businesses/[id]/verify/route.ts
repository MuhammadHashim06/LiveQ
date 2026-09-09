import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Business from "@/models/Business";
import User from "@/models/User";
import { sendEmail, businessVerificationTemplate } from "@/lib/email";
import { isSameOrigin, requireUser } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();

        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
        const user = await requireUser("admin");
        if (!user) return NextResponse.json({ message: "Forbidden: Admin access only" }, { status: 403 });

        const body = await req.json();
        const { isVerified } = body;
        if (typeof isVerified !== "boolean") {
            return NextResponse.json({ message: "isVerified must be boolean" }, { status: 400 });
        }

        const { id } = await params;

        const business = await Business.findByIdAndUpdate(
            id,
            { isVerified },
            { new: true }
        ).populate('owner');

        if (!business) {
            return NextResponse.json({ message: "Business not found" }, { status: 404 });
        }

        // If newly verified, send congratulations email + in-app notification to the owner
        if (isVerified && business.owner) {
            try {
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

                // In-app notification
                const NotificationModel = (await import('@/models/Notification')).default;
                await NotificationModel.create({
                    recipient: owner._id || business.owner,
                    type: 'system',
                    title: '🎉 Business Verified!',
                    message: `Congratulations! Your business "${business.name}" has been verified by LiveQ. You're now visible to all customers.`,
                    link: '/dashboard/business'
                });
            } catch (emailErr) {
                console.error("Failed to send verification email or notification:", emailErr);
            }
        }

        // If unverified, send in-app notification
        if (!isVerified && business.owner) {
            try {
                const NotificationModel = (await import('@/models/Notification')).default;
                const owner = business.owner as any;
                await NotificationModel.create({
                    recipient: owner._id || business.owner,
                    type: 'system',
                    title: 'Business Verification Update',
                    message: `Your business "${business.name}" has been unverified by a LiveQ admin. Please contact support for more details.`,
                    link: '/dashboard/business/settings'
                });
            } catch (notifErr) {
                console.error("Failed to send unverification notification:", notifErr);
            }
        }

        return NextResponse.json({ message: `Business ${isVerified ? 'verified' : 'unverified'} successfully`, business });
    } catch (error: any) {
        console.error("Admin Verify API error:", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
