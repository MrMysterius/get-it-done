import Express from "express";
import fs from "fs";
import { generateErrorWithStatus } from "./generateErrorWithStatus";
import { logger } from "../main";
import path from "path";

export function findServableFile(start_path: string, req: Express.Request) {
  const literalPath = path.join(start_path, req.baseUrl);
  const resource = req.baseUrl.match(/(?<parent>^.*\/)(?<resource>[^\/]*$)/);
  const potentialFilePaths: Array<string> = [];

  if (!resource) throw generateErrorWithStatus("Couldn't filter out ressource", 500);

  logger.debug(resource);

  if (req.isAuthed) {
    const basicAuthedPath = path.join(start_path, `${resource.groups?.parent}`, `authed.${resource.groups?.resource}`);
    if (resource.groups?.resource != "") {
      potentialFilePaths.push(basicAuthedPath, `${basicAuthedPath}.html`, `${basicAuthedPath}.md`);
    }
    potentialFilePaths.push(path.join(literalPath, `authed.index.html`));
  }

  if (resource.groups?.resource != "") {
    potentialFilePaths.push(literalPath, `${literalPath}.html`, `${literalPath}.md`);
  }
  potentialFilePaths.push(path.join(literalPath, `index.html`));

  const existingPath = potentialFilePaths.find((p) => {
    const exists = fs.existsSync(p);
    logger.debug(`${p} ${exists}`);
    return exists;
  });

  return existingPath;
}
