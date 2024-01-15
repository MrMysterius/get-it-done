import Express from "express";
import { generateErrorWithStatus } from "../functions/generateErrorWithStatus";

export function checkAuthStatus(need_auth = true) {
  return (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    if (need_auth && !req.isAuthed) throw generateErrorWithStatus("Unauthorized Access", 403);
    next();
  };
}
