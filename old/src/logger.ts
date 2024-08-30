import winston from "winston";

const colorizer = winston.format.colorize({ colors: { error: "red", warn: "yellow", debug: "green", info: "blue" }, message: true });

export function createLogger() {
  return winston.createLogger({
    levels: { error: 0, warn: 1, info: 2, debug: 3 },
    level: process.env.LOG_LEVEL,
    format: winston.format.combine(winston.format.timestamp(), winston.format.json({ deterministic: true })),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          colorizer,
          winston.format.timestamp(),
          winston.format.printf(({ level, message, timestamp, stack }) => {
            if (stack && process.env.NODE_ENV === "dev")
              return `${timestamp} ${colorizer.colorize(level, level.toUpperCase())}: ${message}\n${colorizer.colorize(level, stack)}`;
            return `${timestamp} ${colorizer.colorize(level, level.toUpperCase())}: ${message}`;
          })
        ),
      }),
      new winston.transports.File({ filename: "gid.log", level: "debug" }),
    ],
  });
}
