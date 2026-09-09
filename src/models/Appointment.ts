import mongoose, { Schema, Document } from "mongoose"

export interface IAppointment extends Document {
  user: mongoose.Types.ObjectId;
  business: mongoose.Types.ObjectId;
  serviceName: string; // Storing name snapshot or reference
  scheduledTime: Date;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  checkedInAt?: Date;
  earlyArrivalRequested?: boolean;
  notes?: string;
}

const AppointmentSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    serviceName: { type: String, required: true },
    scheduledTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending"
    },
    earlyArrivalRequested: { type: Boolean, default: false },
    checkedInAt: { type: Date },
    notes: { type: String }
  },
  { timestamps: true }
)

AppointmentSchema.index(
  { business: 1, user: 1, scheduledTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "confirmed"] } }
  }
);

export default mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema)
