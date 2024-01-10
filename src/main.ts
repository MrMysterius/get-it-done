import { APIRouter } from "./api/APIRouter";
import Express from "express";
import Morgan from "morgan";
import { checkEnvironment } from "./functions/checkEnvironment";
import dotenv from "dotenv";
import path from "path";
import sqlite from "better-sqlite3";

// Config / Environment

dotenv.config();
checkEnvironment();

export const app = Express();
export const db = sqlite(path.join(__dirname, "../gid_data.db"));

// Middleware

app.use(Morgan("dev")); // Logger Middleware

app.use("/api", APIRouter);

// Application Start

app.listen(process.env.APP_PORT || 3500);
