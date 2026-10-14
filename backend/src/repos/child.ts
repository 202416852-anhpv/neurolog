import type { AnyKeys } from "mongoose";
import { Child, type IChild } from "../models/child.js";
import type { CreateChildInput } from "../validations/child.js";

const stripUndefined = (data: CreateChildInput): AnyKeys<IChild> => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) out[key] = value;
  }
  return out as AnyKeys<IChild>;
};

export const findAll = async (): Promise<IChild[]> => {
  return Child.find().sort({ createdAt: -1 });
};

export const create = async (data: CreateChildInput): Promise<IChild> => {
  return Child.create(stripUndefined(data));
};

export const findById = async (id: string): Promise<IChild | null> => {
  return Child.findById(id);
};

export const findByGoogleSub = async (
  sub: string,
): Promise<IChild | null> => {
  return Child.findOne({ googleSub: sub });
};

export const findByEmail = async (email: string): Promise<IChild | null> => {
  return Child.findOne({ email });
};

export const attachGoogleSub = async (
  id: string,
  sub: string,
): Promise<IChild | null> => {
  return Child.findByIdAndUpdate(id, { googleSub: sub }, { new: true });
};

export const createWithAuth = async (
  data: CreateChildInput,
  auth: { googleSub: string; email?: string },
): Promise<IChild> => {
  const payload: Record<string, unknown> = {
    ...stripUndefined(data),
    googleSub: auth.googleSub,
  };
  if (auth.email) payload.email = auth.email;
  return Child.create(payload);
};

export const deleteById = async (id: string): Promise<IChild | null> => {
  return Child.findByIdAndDelete(id);
};

export const updateById = async (
  id: string,
  data: CreateChildInput,
): Promise<IChild | null> => {
  return Child.findByIdAndUpdate(id, stripUndefined(data), { new: true });
};
