import { APIRouter } from "./api/APIRouter";
import Express from "express";
import Morgan from "morgan";
import { checkEnvironment } from "./functions/checkEnvironment";
import cookie from "cookie-parser";
import { createDatabase } from "./functions/createDatabase";
import dotenv from "dotenv";
import { getDatabaseInfo } from "./functions/getDatabaseInfo";
import path from "path";
import sqlite from "better-sqlite3";

// Config / Environment

console.log("# Loading Environment Config");
dotenv.config();
checkEnvironment();

export const app = Express();
export const db = sqlite(path.join(__dirname, "../gid_data.db"));

console.log("# Initializing Database");
const db_version = getDatabaseInfo("version");
if (!db_version && db_version != "0.1.0") {
  createDatabase();
}
console.log("# Initialized Database");

// Middleware

app.use(Morgan("dev")); // Logger Middleware
app.use(cookie(process.env.COOKIE_SECRET));
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

// Routes

app.use("/api", APIRouter);

// Error Catch

app.all("/*", (req, res) => {
  const error = new Error("Route or Method not Found");
  error.status = 404;
  throw error;
});

app.use((error: Error, req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  res.status(error.status || 500);
  console.log(error.message);
  res.json({
    status: error.status || 500,
    message: error.message || "Internal Server Error",
  });
});

// Application Start

console.log("# Listening on port:", process.env.APP_PORT || 3500);
app.listen(process.env.PORT || 3500);
