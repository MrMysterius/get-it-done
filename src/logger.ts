import winston from "winston";

export function createLogger() {
  return winston.createLogger({
    levels: { error: 0, warn: 1, info: 2, debug: 3 },
    level: process.env.LOG_LEVEL,
    format: winston.format.combine(winston.format.timestamp(), winston.format.json({ deterministic: true })),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ colors: { error: "red", warn: "yellow", debug: "green", info: "blue" }, all: true }),
          winston.format.timestamp(),
          winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} ${level}: ${message}`;
          })
        ),
      }),
      new winston.transports.File({ filename: "gid.log", level: "debug" }),
    ],
  });
}
