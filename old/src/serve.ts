import Express from "express";
import { findServableFile } from "./functions/findServableFile";
import fs from "fs";
import path from "path";
import { validateAuth } from "./middlewares/validateAuth";

export const ServeRouter = Express.Router();

ServeRouter.use(validateAuth);

ServeRouter.get("/*", (req, res, next) => {
  const filePath = findServableFile(path.join(__dirname, "serve"), req);
  if (!filePath) {
    next();
    return;
  }

  res.sendFile(filePath, { maxAge: 300000 });
});
