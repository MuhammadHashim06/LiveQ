import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import Business from "@/models/Business";
import Appointment from "@/models/Appointment";
import Queue from "@/models/Queue";
import NotificationModel from "@/models/Notification";
import mongoose from "mongoose";
import { getUser, isSameOrigin } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const user = await getUser();
        if (!user || user.role !== "customer") {
            return NextResponse.json({ message: "Unauthorized only customers can leave reviews" }, { status: 401 });
        }
        if (!isSameOrigin(req)) return NextResponse.json({ message: "Invalid origin" }, { status: 403 });

        const body = await req.json();
        const { businessId, rating, comment } = body;

        if (
            typeof businessId !== "string" ||
            !mongoose.isValidObjectId(businessId) ||
            typeof rating !== "number" ||
            !Number.isFinite(rating) ||
            rating < 1 ||
            rating > 5 ||
            (comment !== undefined && (typeof comment !== "string" || comment.length > 1000))
        ) {
            return NextResponse.json({ message: "Invalid payload: rating 1-5 and businessId required" }, { status: 400 });
        }

        // Check if business exists
        const business = await Business.findById(businessId);
        if (!business) {
            return NextResponse.json({ message: "Business not found" }, { status: 404 });
        }

        const [completedAppointment, completedQueue] = await Promise.all([
            Appointment.exists({ business: businessId, user: user.id, status: "completed" }),
            Queue.exists({ business: businessId, user: user.id, status: "completed" })
        ]);
        if (!completedAppointment && !completedQueue) {
            return NextResponse.json({ message: "You can review a business after a completed visit" }, { status: 403 });
        }

        // Upsert the review to ensure 1 review per user per business
        let review = await Review.findOne({ business: businessId, user: user.id });
        if (review) {
            review.rating = rating;
            review.comment = typeof comment === "string" ? comment.trim() : undefined;
            await review.save();
        } else {
            review = await Review.create({
                business: businessId,
                user: user.id,
                rating,
                comment: typeof comment === "string" ? comment.trim() : undefined
            });
        }

        // Recalculate average rating for the business
        const allReviews = await Review.find({ business: businessId }).lean();
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 0;

        // Update the business stats
        business.stats = {
            ...business.stats,
            rating: Number(averageRating)
        };
        await business.save();

        // Notify the Business Owner
        await NotificationModel.create({
            recipient: business.owner,
            type: "system",
            title: "New Customer Review!",
            message: `${user.name || 'A customer'} left a ${rating}-star review on your profile.`,
            link: `/find/${business._id}` // Link to their public profile to see it
        });

        return NextResponse.json({ message: "Review saved successfully", review, newAverage: Number(averageRating) }, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/reviews Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');
        let userId = searchParams.get('userId');

        // Support 'me' alias — resolves to the authenticated user's ID
        if (userId === 'me') {
            const authUser = await getUser();
            userId = authUser?.id || null;
        }

        const filter: any = {};
        if (businessId) filter.business = businessId;
        if (userId) filter.user = userId;

        const reviews = await Review.find(filter)
            .populate('user', 'name profileImage') // Get user basic info
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(reviews);
    } catch (error: any) {
        console.error("GET /api/reviews Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
