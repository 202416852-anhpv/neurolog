export type TaskStatus = "pending" | "submitted" | "done";

export interface Task {
  _id: string;
  title: string;
  childId: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  childId: string;
}
