import mongoose, { Schema, Document } from "mongoose"

export interface IAppointment extends Document {
  customerId: string
  businessId: string
  service: string
  date: string // "YYYY-MM-DD"
  time: string // "HH:mm"
}

const AppointmentSchema: Schema = new Schema(
  {
    customerId: { type: String, required: true },
    businessId: { type: String, required: true },
    service: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema)
