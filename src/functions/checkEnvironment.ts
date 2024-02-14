export function checkEnvironment() {
  if (!process.env.COOKIE_SECRET) {
    throw new Error("X Environment Variable Missing: COOKIE_SECRET");
  }
  if (!process.env.TOKEN_SECRET) {
    throw new Error("X Environment Variable Missing: TOKEN_SECRET");
  }
  if (process.env.NODE_ENV == "dev") {
    process.env.LOG_LEVEL = "debug";
  }
  return true;
}
