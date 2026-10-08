import mongoose, { type Document, Schema } from "mongoose";

export interface IChild extends Document {
  name: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

const childSchema = new Schema<IChild>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    age: { type: Number, required: true, min: 1, max: 18 },
  },
  { timestamps: true },
);

export const Child = mongoose.model<IChild>("Child", childSchema);
