export type AuthRole = "parent" | "child";

const TOKEN_KEY = "neurolog.token";
const ROLE_KEY = "neurolog.role";
const USER_NAME_KEY = "neurolog.userName";
const USER_EMAIL_KEY = "neurolog.userEmail";
const USER_PICTURE_KEY = "neurolog.userPicture";
const PARENT_ID_KEY = "neurolog.parentId";
const CHILD_ID_KEY = "neurolog.childId";

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getRole = (): AuthRole | null => {
  const value = localStorage.getItem(ROLE_KEY);
  return value === "parent" || value === "child" ? value : null;
};

export const getStoredUserName = (): string | null => {
  return localStorage.getItem(USER_NAME_KEY);
};

export const getStoredUserPicture = (): string | null => {
  return localStorage.getItem(USER_PICTURE_KEY);
};

export const getStoredUserEmail = (): string | null => {
  return localStorage.getItem(USER_EMAIL_KEY);
};

export const setAuth = (
  token: string,
  role: AuthRole,
  user: { name: string; email?: string; picture?: string },
): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(USER_NAME_KEY, user.name);
  if (user.email) {
    localStorage.setItem(USER_EMAIL_KEY, user.email);
  } else {
    localStorage.removeItem(USER_EMAIL_KEY);
  }
  if (user.picture) {
    localStorage.setItem(USER_PICTURE_KEY, user.picture);
  } else {
    localStorage.removeItem(USER_PICTURE_KEY);
  }
};

export const storeProfileId = (role: AuthRole, id: string): void => {
  if (role === "parent") {
    localStorage.setItem(PARENT_ID_KEY, id);
  } else {
    localStorage.setItem(CHILD_ID_KEY, id);
  }
};

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(USER_PICTURE_KEY);
  localStorage.removeItem(PARENT_ID_KEY);
  localStorage.removeItem(CHILD_ID_KEY);
};

export const roleHome = (role: AuthRole): string => {
  return role === "parent" ? "/parent" : "/child";
};
