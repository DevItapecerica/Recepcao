import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { AppError } from "../types/errorTypes.js";

const errorHook = (fastify: FastifyInstance) => {
  return fastify.setErrorHandler((error: AppError, request: FastifyRequest, reply: FastifyReply) => {
    reply.status(error.statusCode || 500).send({ message: error.message || "Internal Server Error", ok: false });

    fastify.log.error({
      method: request.method,
      url: request.url,
      statusCode: error.statusCode || 500,
      error,
      requestOptions: request.routeOptions.config.audit
    });
  });
};

export default fp(errorHook);