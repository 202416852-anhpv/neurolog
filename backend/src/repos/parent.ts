import mongoose from "mongoose";
import { Parent, type IParent } from "../models/parent.js";
import type { CreateParentInput } from "../validations/parent.js";

export const findById = async (id: string): Promise<IParent | null> => {
  return Parent.findById(id);
};

export const findByGoogleSub = async (
  sub: string,
): Promise<IParent | null> => {
  return Parent.findOne({ googleSub: sub });
};

export const findByEmail = async (email: string): Promise<IParent | null> => {
  return Parent.findOne({ email });
};

export const findByUsername = async (
  username: string,
): Promise<IParent | null> => {
  return Parent.findOne({ username: username.toLowerCase() }).select(
    "+passwordHash",
  );
};

export const createWithPassword = async (
  data: CreateParentInput,
  auth: { username: string; passwordHash: string },
): Promise<IParent> => {
  return Parent.create({
    name: data.name,
    age: data.age,
    email: data.email,
    phone: data.phone ?? "",
    notes: data.notes ?? "",
    username: auth.username,
    passwordHash: auth.passwordHash,
  });
};

export const attachGoogleSub = async (
  id: string,
  sub: string,
): Promise<IParent | null> => {
  return Parent.findByIdAndUpdate(id, { googleSub: sub }, { new: true });
};

export const create = async (data: CreateParentInput): Promise<IParent> => {
  return Parent.create({
    name: data.name,
    age: data.age,
    email: data.email,
    phone: data.phone ?? "",
    notes: data.notes ?? "",
  });
};

export const createWithAuth = async (
  data: CreateParentInput,
  auth: { googleSub: string },
): Promise<IParent> => {
  return Parent.create({
    name: data.name,
    age: data.age,
    email: data.email,
    phone: data.phone ?? "",
    notes: data.notes ?? "",
    googleSub: auth.googleSub,
  });
};

export const updateById = async (
  id: string,
  data: CreateParentInput,
): Promise<IParent | null> => {
  return Parent.findByIdAndUpdate(
    id,
    {
      name: data.name,
      age: data.age,
      email: data.email,
      phone: data.phone ?? "",
      notes: data.notes ?? "",
    },
    { new: true },
  );
};

export const deleteById = async (id: string): Promise<IParent | null> => {
  return Parent.findByIdAndDelete(id);
};

export const addChild = async (
  id: string,
  childId: string,
): Promise<IParent | null> => {
  return Parent.findByIdAndUpdate(
    id,
    { $addToSet: { children: new mongoose.Types.ObjectId(childId) } },
    { new: true },
  );
};

export const removeChild = async (
  id: string,
  childId: string,
): Promise<IParent | null> => {
  return Parent.findByIdAndUpdate(
    id,
    { $pull: { children: new mongoose.Types.ObjectId(childId) } },
    { new: true },
  );
};
