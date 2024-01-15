import Express from "express";
import { generateErrorWithStatus } from "../functions/generateErrorWithStatus";
import { validationResult } from "express-validator";

export function validateData(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    throw generateErrorWithStatus("Bad Request", 400, { errors: result.array() });
  }

  next();
}
