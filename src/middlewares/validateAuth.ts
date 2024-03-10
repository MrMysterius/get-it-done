import Express from "express";
import JWT from "jsonwebtoken";
import { createDataQuery } from "../functions/databaseFunctions";
import { updateLastActionTimestamp } from "../functions/updateLastActionTimestamp";

export function validateAuth(req: Express.Request, _res: Express.Response, next: Express.NextFunction) {
  const token = req.headers.authorization || req.signedCookies.token || null;

  req.isAuthed = false;
  req.authedUser = null;

  if (token == null) {
    next();
    return;
  }

  let tokenPayload: TokenUser | null = null;

  try {
    tokenPayload = JWT.verify(token, process.env.TOKEN_SECRET as string, { issuer: "GetItDone" }) as TokenUser;
  } catch (_err) {
    next();
    return;
  }

  const userQuery = createDataQuery<GIDData.user>()(`SELECT * FROM users WHERE user_id = @user_id`);

  const user = userQuery.get({ user_id: tokenPayload?.user_id || "" });

  if (user.isSuccessful && user.data && user.data.user_active) {
    req.isAuthed = true;
    req.authedUser = {
      user_id: user.data.user_id,
      user_name: user.data.user_name,
      user_displayname: user.data.user_displayname,
      user_role: user.data.user_role,
      user_active: user.data.user_active,
      user_invited_from: user.data.user_invited_from,
    };
    updateLastActionTimestamp(user.data.user_id);
  }

  next();
}
