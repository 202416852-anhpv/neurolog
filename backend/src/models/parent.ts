import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IParent extends Document {
  name: string;
  age: number;
  email: string;
  phone?: string;
  notes?: string;
  username?: string;
  passwordHash?: string;
  googleSub?: string;
  children: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const parentSchema = new Schema<IParent>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    age: { type: Number, required: true, min: 1, max: 100 },
    email: { type: String, required: true, trim: true, maxlength: 200 },
    phone: { type: String, trim: true, maxlength: 20, default: "" },
    notes: { type: String, trim: true, maxlength: 500, default: "" },
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
    children: [{ type: Schema.Types.ObjectId, ref: "Child" }],
  },
  { timestamps: true },
);

export const Parent = mongoose.model<IParent>("Parent", parentSchema);
