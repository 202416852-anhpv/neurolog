export interface Parent {
  _id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  notes: string;
  children: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ParentInput {
  name: string;
  age: number;
  email: string;
  phone?: string;
  notes?: string;
}
