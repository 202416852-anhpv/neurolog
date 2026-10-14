import api from "./client";
import type { AuthRole } from "@/lib/auth";
import type { Child, ChildInput } from "@/types/child";
import type { Parent, ParentInput } from "@/types/parent";

export interface AuthSuggestion {
  name: string;
  email: string;
  picture: string;
}

export interface LoginResponse {
  token: string;
  role: AuthRole;
  profile: Parent | Child | null;
  suggested: AuthSuggestion | null;
}

export interface MeResponse {
  role: AuthRole;
  profile: Parent | Child | null;
}

export interface CompleteResponse<R> {
  role: AuthRole;
  profile: R;
}

export const loginWithGoogle = async (
  credential: string,
  role: AuthRole,
): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>("/auth/google", {
    credential,
    role,
  });
  return data;
};

export const fetchMe = async (): Promise<MeResponse> => {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data;
};

export const completeParentProfile = async (
  input: ParentInput,
): Promise<CompleteResponse<Parent>> => {
  const { data } = await api.post<CompleteResponse<Parent>>(
    "/auth/complete",
    input,
  );
  return data;
};

export const completeChildProfile = async (
  input: ChildInput,
): Promise<CompleteResponse<Child>> => {
  const { data } = await api.post<CompleteResponse<Child>>(
    "/auth/complete",
    input,
  );
  return data;
};
