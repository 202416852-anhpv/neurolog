export type Gender = "male" | "female" | "other";

export interface Child {
  _id: string;
  name: string;
  age: number;
  gender?: Gender;
  dateOfBirth?: string;
  weight?: number | null;
  height?: number | null;
  interests?: string;
  healthNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChildInput {
  name: string;
  age: number;
  gender?: Gender;
  dateOfBirth?: string;
  weight?: number | null;
  height?: number | null;
  interests?: string;
  healthNotes?: string;
}
