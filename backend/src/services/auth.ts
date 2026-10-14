import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { AppError, ERROR_MESSAGES } from "../errors/index.js";
import type { IParent } from "../models/parent.js";
import type { IChild } from "../models/child.js";
import * as parentRepo from "../repos/parent.js";
import * as childRepo from "../repos/child.js";
import type { AuthRole } from "../validations/auth.js";
import type { CreateParentInput } from "../validations/parent.js";
import type { CreateChildInput } from "../validations/child.js";

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
        { sub: google.sub, role, email: google.email, profileId: parent._id.toString() },
        parent,
        null,
      );
    }
    return signResult(
      { sub: google.sub, role, email: google.email },
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
      { sub: google.sub, role, email: google.email, profileId: child._id.toString() },
      child,
      null,
    );
  }
  return signResult(
    { sub: google.sub, role, email: google.email },
    null,
    { name: google.name, email: google.email, picture: google.picture },
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
  if (claims.role === "parent") {
    const parent = await parentRepo.findByGoogleSub(claims.sub);
    return { role: claims.role, profile: parent };
  }
  const child = await childRepo.findByGoogleSub(claims.sub);
  return { role: claims.role, profile: child };
};
