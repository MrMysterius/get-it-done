import Express from "express";
import Morgan from "morgan";

export const app = Express();

// Middleware

app.use(Morgan("dev")); // Logger Middleware

// Application Start

app.listen(process.env.APP_PORT || 3500);
