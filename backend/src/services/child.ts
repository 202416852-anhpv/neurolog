import * as childRepo from "../repos/child.js";
import * as taskRepo from "../repos/task.js";
import * as journalRepo from "../repos/journal.js";
import type { IChild } from "../models/child.js";
import type { CreateChildInput } from "../validations/child.js";

export const getAllChildren = async (): Promise<IChild[]> => {
  return childRepo.findAll();
};

export const getChildById = async (id: string): Promise<IChild | null> => {
  return childRepo.findById(id);
};

export const createChild = async (
  data: CreateChildInput,
): Promise<IChild> => {
  return childRepo.create(data);
};

export const updateChild = async (
  id: string,
  data: CreateChildInput,
): Promise<IChild | null> => {
  return childRepo.updateById(id, data);
};

export const deleteChild = async (id: string): Promise<IChild | null> => {
  const child = await childRepo.findById(id);
  if (!child) return null;
  await taskRepo.deleteByChildId(id);
  await journalRepo.deleteByChildId(id);
  return childRepo.deleteById(id);
};
