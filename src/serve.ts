import Express from "express";
import { findServableFile } from "./functions/findServableFile";
import path from "path";

export const ServeRouter = Express.Router();

ServeRouter.get("/*", (req, res, next) => {
  const filePath = findServableFile(path.join(__dirname, "serve"), req);
  if (!filePath) {
    next();
    return;
  }

  res.status(200);
  res.sendFile(filePath);
});
