import { APIRouter } from "./api/APIRouter";
import Express from "express";
import Morgan from "morgan";
import { checkEnvironment } from "./functions/checkEnvironment";
import { createDatabase } from "./functions/createDatabase";
import dotenv from "dotenv";
import { getDatabaseInfo } from "./functions/getDatabaseInfo";
import path from "path";
import sqlite from "better-sqlite3";

// Config / Environment

dotenv.config();
checkEnvironment();

export const app = Express();
export const db = sqlite(path.join(__dirname, "../gid_data.db"));

const db_version = getDatabaseInfo("version");
if (!db_version && db_version != "0.1.0") {
  createDatabase();
}

// Middleware

app.use(Morgan("dev")); // Logger Middleware

app.use("/api", APIRouter);

// Application Start

app.listen(process.env.APP_PORT || 3500);
