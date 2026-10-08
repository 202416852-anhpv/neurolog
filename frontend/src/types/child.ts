export interface Child {
  _id: string;
  name: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChildInput {
  name: string;
  age: number;
}
