import mongoose, { type Document, Schema } from "mongoose";

export type Gender = "male" | "female" | "other";

export interface IChild extends Document {
  name: string;
  age: number;
  gender?: Gender;
  dateOfBirth?: Date;
  weight?: number | null;
  height?: number | null;
  interests?: string;
  healthNotes?: string;
  email?: string;
  username?: string;
  passwordHash?: string;
  googleSub?: string;
  createdAt: Date;
  updatedAt: Date;
}

const childSchema = new Schema<IChild>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    age: { type: Number, required: true, min: 1, max: 18 },
    gender: { type: String, enum: ["male", "female", "other"] },
    dateOfBirth: { type: Date },
    weight: { type: Number, min: 1, max: 300, default: null },
    height: { type: Number, min: 30, max: 250, default: null },
    interests: { type: String, trim: true, maxlength: 500, default: "" },
    healthNotes: { type: String, trim: true, maxlength: 500, default: "" },
    email: { type: String, trim: true, maxlength: 200 },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      minlength: 3,
      maxlength: 30,
    },
    passwordHash: { type: String, select: false },
    googleSub: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

export const Child = mongoose.model<IChild>("Child", childSchema);
