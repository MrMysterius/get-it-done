import JWT from "jsonwebtoken";

export function generateAuthToken(user: TokenUser) {
  return JWT.sign(user, process.env.TOKEN_SECRET as string, { expiresIn: "7d", issuer: "GetItDone" });
}
