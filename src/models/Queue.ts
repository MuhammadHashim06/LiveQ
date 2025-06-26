import mongoose, { Schema, Document } from "mongoose"

export interface IQueue extends Document {
  businessId: string
  customerName: string
  createdAt: Date
}

const QueueSchema: Schema = new Schema(
  {
    businessId: { type: String, required: true },
    customerName: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.Queue || mongoose.model<IQueue>("Queue", QueueSchema)
