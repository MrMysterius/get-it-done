export function checkEnvironment() {
  if (!process.env.COOKIE_SECRET) {
    throw new Error("X Environment Variable Missing: COOKIE_SECRET");
  }
  return true;
}
