import bcrypt from "bcrypt";

export function generatePasswordHash(password: string) {
  const salt = bcrypt.genSaltSync(16);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}
