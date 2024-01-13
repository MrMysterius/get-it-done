export function checkEnvironment() {
  if (!process.env.COOKIE_SECRET) {
    throw new Error("X Environment Variable Missing: COOKIE_SECRET");
  }
  if (!process.env.TOKEN_SECRET) {
    throw new Error("X Environment Variable Missing: TOKEN_SECRET");
  }
  return true;
}
