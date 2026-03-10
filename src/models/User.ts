import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "business" | "customer" | "admin";
  phoneNumber?: string;
  profileImage?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  isEmailVerified: boolean;
  verifyEmailToken?: string;
  verifyEmailExpire?: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["business", "customer", "admin"], required: true },
    phoneNumber: { type: String },
    profileImage: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    verifyEmailToken: { type: String },
    verifyEmailExpire: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
