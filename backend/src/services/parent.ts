import * as parentRepo from "../repos/parent.js";
import * as childRepo from "../repos/child.js";
import type { IParent } from "../models/parent.js";
import type { CreateParentInput } from "../validations/parent.js";

export const getParentById = async (id: string): Promise<IParent | null> => {
  return parentRepo.findById(id);
};

export const createParent = async (
  data: CreateParentInput,
): Promise<IParent> => {
  return parentRepo.create(data);
};

export const updateParent = async (
  id: string,
  data: CreateParentInput,
): Promise<IParent | null> => {
  return parentRepo.updateById(id, data);
};

export const deleteParent = async (id: string): Promise<IParent | null> => {
  return parentRepo.deleteById(id);
};

export const linkChild = async (
  id: string,
  childId: string,
): Promise<{ parent: IParent | null; childExists: boolean }> => {
  const child = await childRepo.findById(childId);
  if (!child) return { parent: null, childExists: false };
  const parent = await parentRepo.addChild(id, childId);
  return { parent, childExists: true };
};

export const unlinkChild = async (
  id: string,
  childId: string,
): Promise<IParent | null> => {
  return parentRepo.removeChild(id, childId);
};
