import mongoose, { Schema, Document } from "mongoose"

export interface IService {
  name: string;
  price: number;
  duration: number; // in minutes
  description?: string;
}

export interface IAvailability {
  day: string; // e.g., "Monday"
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isClosed: boolean;
}

export interface IBusiness extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  address?: string;
  category: string;
  email?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  isVerified: boolean;
  services: IService[];
  availability: IAvailability[];
  lat: number;
  lng: number;
  stats?: {
    totalCustomers?: number;
    rating?: number;
  }
}

const ServiceSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  description: { type: String }
});

const AvailabilitySchema = new Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isClosed: { type: Boolean, default: false }
});

const BusinessSchema: Schema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    address: { type: String },
    category: { type: String, default: "General" },
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    logoUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    services: [ServiceSchema],
    availability: [AvailabilitySchema],
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    stats: {
      totalCustomers: { type: Number, default: 0 },
      rating: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
)

export default mongoose.models.Business || mongoose.model<IBusiness>("Business", BusinessSchema)
