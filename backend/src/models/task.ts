import mongoose, { type Document, Schema, type Types } from "mongoose";

export type TaskStatus = "pending" | "submitted" | "done";

export interface ITask extends Document {
  title: string;
  childId: Types.ObjectId;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true },
    status: {
      type: String,
      enum: ["pending", "submitted", "done"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export const Task = mongoose.model<ITask>("Task", taskSchema);
