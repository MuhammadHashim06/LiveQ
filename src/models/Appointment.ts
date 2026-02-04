import mongoose, { Schema, Document } from "mongoose"

export interface IAppointment extends Document {
  user: mongoose.Types.ObjectId;
  business: mongoose.Types.ObjectId;
  serviceName: string; // Storing name snapshot or reference
  scheduledTime: Date;
  status: "pending" | "confirmed" | "completed" | "cancelled";
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
    notes: { type: String }
  },
  { timestamps: true }
)

export default mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema)
