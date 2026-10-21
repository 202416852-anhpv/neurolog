import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const HASH_PREFIX = "scrypt";

const deriveKey = (password: string, salt: string): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key);
    });
  });

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const key = await deriveKey(password, salt);
  return `${HASH_PREFIX}$${salt}$${key.toString("hex")}`;
};

export const verifyPassword = async (
  password: string,
  storedHash: string,
): Promise<boolean> => {
  const [prefix, salt, hash] = storedHash.split("$");
  if (prefix !== HASH_PREFIX || !salt || !hash) {
    return false;
  }
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== KEY_LENGTH) {
    return false;
  }
  const actual = await deriveKey(password, salt);
  return timingSafeEqual(expected, actual);
};
