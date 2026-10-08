import { Child, type IChild } from "../models/child.js";
import type { CreateChildInput } from "../validations/child.js";

export const findAll = async (): Promise<IChild[]> => {
  return Child.find().sort({ createdAt: -1 });
};

export const create = async (data: CreateChildInput): Promise<IChild> => {
  return Child.create(data);
};

export const findById = async (id: string): Promise<IChild | null> => {
  return Child.findById(id);
};

export const deleteById = async (id: string): Promise<IChild | null> => {
  return Child.findByIdAndDelete(id);
};

export const updateById = async (
  id: string,
  data: CreateChildInput,
): Promise<IChild | null> => {
  return Child.findByIdAndUpdate(id, data, { new: true });
};
