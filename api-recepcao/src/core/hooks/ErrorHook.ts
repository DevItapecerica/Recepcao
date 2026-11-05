
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { AppError } from "../types/errorTypes.js";

const errorHook = (fastify: FastifyInstance) => {
  return fastify.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
    const expected = error instanceof AppError;

    const validationError = "validation" in error;

    const statusCode = expected
      ? error.statusCode
      : validationError
        ? 400
        : 500;

    const message = expected
      ? error.message
      : validationError
        ? "Dados invalidos ou campos obrigatorios nao informados"
        : "Internal Server Error";

    const code = expected
      ? error.code
      : validationError
        ? "VALIDATION_ERROR"
        : "INTERNAL_SERVER_ERROR";

    reply.status(statusCode).send({ message, code, ok: false });

    fastify.log.error({
      method: request.method,
      url: request.url,
      statusCode,
      error,
      requestOptions: request.routeOptions.config.audit
    });
  });
};

export default fp(errorHook);
