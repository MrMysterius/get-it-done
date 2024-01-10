import { APIRouter } from "./api/APIRouter";
import Express from "express";
import Morgan from "morgan";
import { checkEnvironment } from "./functions/checkEnvironment";
import dotenv from "dotenv";

// Config / Environment

dotenv.config();
checkEnvironment();

export const app = Express();

// Middleware

app.use(Morgan("dev")); // Logger Middleware

app.use("/api", APIRouter);

// Application Start

app.listen(process.env.APP_PORT || 3500);
