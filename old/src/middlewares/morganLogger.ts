import { ColoredMethods, statusColorRanges } from "./morganLoggerExtras";

import Morgan from "morgan";
import chalk from "chalk";
import { logger } from "../main";

export function createMorganLogger() {
  return Morgan((tokens, req, res) => {
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const status = tokens.status(req, res);
    const content_length = tokens.res(req, res, "content-length");
    const response_time = tokens["response-time"](req, res);
    const remote_addr = tokens["remote-addr"](req, res);

    const message = ":method :url :status :response-time ms - :res[content-length] :remote-addr"
      .replace(/\:method/g, ColoredMethods[method as string] || method)
      .replace(/\:url/g, chalk.cyan(url))
      .replace(/\:status/g, statusColorRanges(status as string))
      .replace(/\:res\[content-length\]/g, chalk.green(content_length))
      .replace(/\:response-time/g, response_time as string)
      .replace(/\:remote-addr/g, remote_addr as string);

    const uncolored_message = ":method :url :status :response-time ms - :res[content-length] :remote-addr"
      .replace(/\:method/g, method as string)
      .replace(/\:url/g, url as string)
      .replace(/\:status/g, status as string)
      .replace(/\:res\[content-length\]/g, content_length as string)
      .replace(/\:response-time/g, response_time as string)
      .replace(/\:remote-addr/g, remote_addr as string);

    logger.debug(uncolored_message);

    return message;
  });
}
