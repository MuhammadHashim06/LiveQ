import mongoose, { Schema, Document } from "mongoose"

export interface IReview extends Document {
    business: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
    {
        business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, maxlength: 1000 },
    },
    { timestamps: true }
)

// Ensure a user can only review a business once (optional, but good practice)
ReviewSchema.index({ business: 1, user: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema)
