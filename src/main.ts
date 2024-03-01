import { getDatabaseInfo, setDatabaseInfo } from "./functions/databaseInfos";

import { APIRouter } from "./api/APIRouter";
import { AuthRouter } from "./auth";
import Express from "express";
import { InboxRouter } from "./inbox";
import { ServeRouter } from "./serve";
import { SignUpRouter } from "./signup";
import { checkEnvironment } from "./functions/checkEnvironment";
import cookie from "cookie-parser";
import { createDatabase } from "./functions/createDatabase";
import { createLogger } from "./logger";
import { createMorganLogger } from "./middlewares/morganLogger";
import dotenv from "dotenv";
import { generateErrorWithStatus } from "./functions/generateErrorWithStatus";
import { migrateDatabase } from "./functions/migrateDatabase";
import path from "path";
import sqlite from "better-sqlite3";

// Config / Environment

export const CURRENT_APP_VERSION = "0.2.4";

console.log("# Loading Environment Config");
dotenv.config();
checkEnvironment();

export const app = Express();
export const db = sqlite(path.join(__dirname, "../gid_data.db"));
export const logger = createLogger();

main();

async function main() {
  logger.info("# Initializing Database");

  const db_version = getDatabaseInfo("version");

  if (db_version === null) {
    createDatabase();
  }
  if (db_version.value !== CURRENT_APP_VERSION) {
    logger.info(`> App Version is Newer than Database ${CURRENT_APP_VERSION} > ${db_version.value}`);
    await migrateDatabase(db_version.value);
    logger.info(`> Updating Database Version to ${CURRENT_APP_VERSION}`);
    setDatabaseInfo({ key: "version", value: CURRENT_APP_VERSION });
  }
  setDatabaseInfo({ key: "last_startup_timestamp", value: Date.now().toString() });

  logger.info("# Initialized Database");

  // Middleware

  app.use(createMorganLogger()); // Logger Middleware
  app.use(cookie(process.env.COOKIE_SECRET));
  app.use(Express.json());
  app.use(Express.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    req.extra = { params: {} };
    next();
  });

  // Routes

  app.use("/auth", AuthRouter);
  app.use("/deauth", (req, res) => {
    res.clearCookie("token");
    res.redirect(307, "/");
  });
  app.use("/signup", SignUpRouter);
  app.use("/api", APIRouter);
  app.use("/inbox", InboxRouter);
  app.use("/*", ServeRouter);

  // Error Catch

  app.all("/*", (req, res) => {
    throw generateErrorWithStatus("Route or Method not found", 404);
  });

  app.use((error: Error, req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    if (error.status == 500) logger.error(error.message, { stack: error.stack });
    else logger.warn(error.message, { stack: error.stack });

    const response: ErrorResponse = {
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    };
    if (error.details) response.details = error.details;

    res.status(error.status || 500);
    res.json(response);
  });

  // Application Start

  logger.info(`# Listening on port: ${process.env.APP_PORT || 3500}`);
  app.listen(process.env.PORT || 3500);
}
