import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { AppError, ERROR_MESSAGES } from "../errors/index.js";
import type { IParent } from "../models/parent.js";
import type { IChild } from "../models/child.js";
import * as parentRepo from "../repos/parent.js";
import * as childRepo from "../repos/child.js";
import type {
  AuthRole,
  PasswordLoginInput,
  RegisterInput,
} from "../validations/auth.js";
import type { CreateParentInput } from "../validations/parent.js";
import type { CreateChildInput } from "../validations/child.js";
import { hashPassword, verifyPassword } from "./password.js";

const oauthClient = new OAuth2Client();

interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export interface TokenClaims {
  sub: string;
  role: AuthRole;
  provider?: "google" | "local";
  email?: string;
  profileId?: string;
}

export interface LoginSuggestion {
  name: string;
  email: string;
  picture: string;
}

export interface LoginResult {
  token: string;
  role: AuthRole;
  profile: IParent | IChild | null;
  suggested: LoginSuggestion | null;
}

export interface MeResult {
  role: AuthRole;
  profile: IParent | IChild | null;
}

const verifyCredential = async (credential: string): Promise<GoogleProfile> => {
  const audience = process.env.GOOGLE_CLIENT_ID;
  if (!audience) {
    throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
  try {
    const ticket = await oauthClient.verifyIdToken({
      idToken: credential,
      audience,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub) {
      throw new Error("Missing sub claim");
    }
    if (payload.email_verified === false) {
      throw new Error("Email not verified");
    }
    return {
      sub: payload.sub,
      email: payload.email ?? "",
      name: payload.name ?? payload.email ?? "Người dùng Google",
      picture: payload.picture ?? "",
    };
  } catch {
    throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIAL, 401);
  }
};

const signToken = (claims: TokenClaims): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
  return jwt.sign(claims, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "30d",
  } as jwt.SignOptions);
};

export const getClaimsFromHeader = (header?: string): TokenClaims => {
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) {
    throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
  }
  try {
    const decoded = jwt.verify(token, secret) as TokenClaims;
    if (!decoded.sub || !decoded.role) {
      throw new Error("Invalid claims");
    }
    return decoded;
  } catch {
    throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
  }
};

const signResult = (
  claims: TokenClaims,
  profile: IParent | IChild | null,
  suggested: LoginSuggestion | null,
): LoginResult => ({
  token: signToken(claims),
  role: claims.role,
  profile,
  suggested,
});

export const login = async (
  role: AuthRole,
  credential: string,
): Promise<LoginResult> => {
  const google = await verifyCredential(credential);

  if (role === "parent") {
    let parent = await parentRepo.findByGoogleSub(google.sub);
    if (!parent && google.email) {
      parent = await parentRepo.findByEmail(google.email);
      if (parent && !parent.googleSub) {
        parent = await parentRepo.attachGoogleSub(
          parent._id.toString(),
          google.sub,
        );
      }
    }
    if (parent) {
      return signResult(
        {
          sub: google.sub,
          role,
          provider: "google",
          email: google.email,
          profileId: parent._id.toString(),
        },
        parent,
        null,
      );
    }
    return signResult(
      { sub: google.sub, role, provider: "google", email: google.email },
      null,
      { name: google.name, email: google.email, picture: google.picture },
    );
  }

  let child = await childRepo.findByGoogleSub(google.sub);
  if (!child && google.email) {
    child = await childRepo.findByEmail(google.email);
    if (child && !child.googleSub) {
      child = await childRepo.attachGoogleSub(child._id.toString(), google.sub);
    }
  }
  if (child) {
    return signResult(
      {
        sub: google.sub,
        role,
        provider: "google",
        email: google.email,
        profileId: child._id.toString(),
      },
      child,
      null,
    );
  }
  return signResult(
    { sub: google.sub, role, provider: "google", email: google.email },
    null,
    { name: google.name, email: google.email, picture: google.picture },
  );
};

export const loginWithPassword = async (
  input: PasswordLoginInput,
): Promise<LoginResult> => {
  const { role, username, password } = input;
  const account =
    role === "parent"
      ? await parentRepo.findByUsername(username)
      : await childRepo.findByUsername(username);

  if (!account?.passwordHash) {
    throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIAL, 401);
  }

  const valid = await verifyPassword(password, account.passwordHash);
  if (!valid) {
    throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIAL, 401);
  }

  const profile =
    role === "parent"
      ? await parentRepo.findById(account._id.toString())
      : await childRepo.findById(account._id.toString());
  if (!profile) {
    throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIAL, 401);
  }

  const profileId = profile._id.toString();
  const baseClaims = {
    sub: profileId,
    role,
    provider: "local" as const,
    profileId,
  };
  const email = profile.email;
  return signResult(
    email ? { ...baseClaims, email } : baseClaims,
    profile,
    null,
  );
};

export const register = async (input: RegisterInput): Promise<LoginResult> => {
  const username = input.username.toLowerCase();
  const [parentWithUsername, childWithUsername] = await Promise.all([
    parentRepo.findByUsername(username),
    childRepo.findByUsername(username),
  ]);
  if (parentWithUsername || childWithUsername) {
    throw new AppError(ERROR_MESSAGES.USERNAME_TAKEN, 409);
  }

  const passwordHash = await hashPassword(input.password);

  if (input.role === "parent") {
    if (!input.email) {
      throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, 400);
    }
    const existing = await parentRepo.findByEmail(input.email);
    if (existing) {
      throw new AppError(ERROR_MESSAGES.EMAIL_IN_USE, 409);
    }
    const parent = await parentRepo.createWithPassword(
      { name: input.name, age: input.age, email: input.email },
      { username, passwordHash },
    );
    const profileId = parent._id.toString();
    return signResult(
      {
        sub: profileId,
        role: input.role,
        provider: "local",
        profileId,
        email: input.email,
      },
      parent,
      null,
    );
  }

  if (input.email) {
    const existing = await childRepo.findByEmail(input.email);
    if (existing) {
      throw new AppError(ERROR_MESSAGES.EMAIL_IN_USE, 409);
    }
  }

  const child = await childRepo.createWithPassword(
    { name: input.name, age: input.age },
    {
      username,
      passwordHash,
      ...(input.email ? { email: input.email } : {}),
    },
  );
  const profileId = child._id.toString();
  const baseClaims = {
    sub: profileId,
    role: input.role,
    provider: "local" as const,
    profileId,
  };
  return signResult(
    input.email ? { ...baseClaims, email: input.email } : baseClaims,
    child,
    null,
  );
};

export const completeParentProfile = async (
  claims: TokenClaims,
  input: CreateParentInput,
): Promise<IParent> => {
  const existing = await parentRepo.findByGoogleSub(claims.sub);
  if (existing) return existing;

  const byEmail = input.email ? await parentRepo.findByEmail(input.email) : null;
  if (byEmail) {
    if (!byEmail.googleSub) {
      const linked = await parentRepo.attachGoogleSub(
        byEmail._id.toString(),
        claims.sub,
      );
      if (linked) return linked;
    }
    return byEmail;
  }

  return parentRepo.createWithAuth(input, { googleSub: claims.sub });
};

export const completeChildProfile = async (
  claims: TokenClaims,
  input: CreateChildInput,
): Promise<IChild> => {
  const existing = await childRepo.findByGoogleSub(claims.sub);
  if (existing) return existing;

  const email = claims.email || undefined;
  const byEmail = email ? await childRepo.findByEmail(email) : null;
  if (byEmail) {
    if (!byEmail.googleSub) {
      const linked = await childRepo.attachGoogleSub(
        byEmail._id.toString(),
        claims.sub,
      );
      if (linked) return linked;
    }
    return byEmail;
  }

  return childRepo.createWithAuth(input, {
    googleSub: claims.sub,
    ...(email ? { email } : {}),
  });
};

export const getMe = async (claims: TokenClaims): Promise<MeResult> => {
  const isLocal = claims.provider === "local";
  if (claims.role === "parent") {
    const parent = isLocal
      ? await parentRepo.findById(claims.sub)
      : await parentRepo.findByGoogleSub(claims.sub);
    return { role: claims.role, profile: parent };
  }
  const child = isLocal
    ? await childRepo.findById(claims.sub)
    : await childRepo.findByGoogleSub(claims.sub);
  return { role: claims.role, profile: child };
};
