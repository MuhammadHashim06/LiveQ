import mongoose, { Schema, Document } from "mongoose"

export interface IBusiness extends Document {
  name: string
  service: string
  lat: number
  lng: number
}

const BusinessSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    service: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.Business || mongoose.model<IBusiness>("Business", BusinessSchema)
