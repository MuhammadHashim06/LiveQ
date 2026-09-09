import mongoose, { Schema, Document } from "mongoose"

export interface IQueue extends Document {
  business: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  name?: string; // For guest users or quick add
  status: "waiting" | "serving" | "completed" | "removed" | "cancelled";
  joinedAt: Date;
  estimatedServiceTime?: Date;
  sortOrder: number;
}

const QueueSchema: Schema = new Schema(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    appointment: { type: Schema.Types.ObjectId, ref: "Appointment" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String }, // Optional if user is not registered
    status: {
      type: String,
      enum: ["waiting", "serving", "completed", "removed", "cancelled"],
      default: "waiting"
    },
    joinedAt: { type: Date, default: Date.now },
    estimatedServiceTime: { type: Date },
    sortOrder: { type: Number, default: Date.now } // fallback initially to timestamp
  },
  { timestamps: true }
)

QueueSchema.index({ appointment: 1 }, { unique: true, sparse: true });
QueueSchema.index(
  { business: 1, user: 1 },
  {
    unique: true,
    partialFilterExpression: {
      user: { $exists: true },
      status: { $in: ["waiting", "serving"] }
    }
  }
);
QueueSchema.index({ business: 1, status: 1, sortOrder: 1, joinedAt: 1 });

export default mongoose.models.Queue || mongoose.model<IQueue>("Queue", QueueSchema)
