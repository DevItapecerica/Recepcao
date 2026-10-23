import { type FastifyServerOptions } from "fastify";
import { TRUSTED_PROXIES } from "./env.js";

const logg = { translateTime: "HH:MM:ss", ignore: "hostname" };

const logConfig: FastifyServerOptions = {
  disableRequestLogging: true,
  trustProxy: TRUSTED_PROXIES,
  bodyLimit: 7 * 1024 * 1024,
  logger: {
    level: "info",
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie", "request.headers.authorization", "request.headers.cookie", "request.body.password", "request.body.old_password", "request.body.new_password", "request.body.token", "request.body.cpf", "request.body.photo"],
      censor: "[REDACTED]",
    },
    transport: {
      target: "pino-pretty",
      options: logg,
    },
  },
};

export default logConfig;
