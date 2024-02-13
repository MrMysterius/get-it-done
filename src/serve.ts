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

  const lastModified = fs.statSync(filePath).mtime;

  if (req.headers["if-modified-since"] == lastModified.toString()) {
    res.status(304);
    res.send();
    return;
  }

  res.status(200);
  res.setHeader("Cache-Control", "public, max-age=300");
  res.setHeader("Last-Modified", lastModified.toString());
  res.sendFile(filePath);
});
