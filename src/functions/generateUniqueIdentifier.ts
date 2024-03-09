import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 20);

export function generateUniqueIdentifier(prefix: string = "") {
  return prefix.length > 0 ? `${prefix}_${nanoid()}` : nanoid();
}
