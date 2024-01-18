import chalk from "chalk";

export const ColoredMethods: { [key: string]: any } = {
  GET: chalk.hex("#FF38A8").bold("GET"),
  POST: chalk.greenBright.bold("POST"),
  PUT: chalk.yellow.bold("PUT"),
  DELETE: chalk.red.bold("DELETE"),
};

export function statusColorRanges(status: string) {
  const s = parseInt(status);
  if (s >= 200 && s <= 299) {
    return chalk.green(s);
  } else if (s >= 400 && s <= 499) {
    return chalk.yellow(s);
  } else if (s >= 500 && s <= 599) {
    return chalk.red(s);
  } else {
    return chalk.gray(s);
  }
}
