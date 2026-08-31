import fastify from "fastify";
import fastifyCors from "@fastify/cors";

import { fastifySwagger } from "@fastify/swagger";

import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { Router } from "./router/routes.js";

import { PORT } from "./core/config/env.js";
import { interfaceErrorResponse } from "./core/types/errorTypes.js";

const app = fastify({
  logger: {
    level: "info",
    file: "./log.json", // Will use pino.destination()
    serializers: {
      res(res) {
        // The default
        return {
          statusCode: res.statusCode,
        };
      },
      req(req) {
        return {
          method: req.method,
          url: req.url,
          parameters: req.params,
          // Including the headers in the log could be in violation
          // of privacy laws, e.g. GDPR. You should use the "redact" option to
          // remove sensitive fields. It could also leak authentication data in
          // the logs.
          headers: req.headers,
        };
      },
    },
  },
});

app.register(fastifyCors, { origin: "*" });

app.register(fastifySwagger, {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "API Recepção",
      description: "Docs via Fastify + Zod",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://192.168.16.13:3333`,
        description: "Development server",
      },
    ],
  },
});

app.register(fastifySwaggerUi, {
  routePrefix: "/documentation",
});

app.addHook("onRequest", (request, reply, done) => {
  done();
});

app.setErrorHandler((error, request, reply) => {
  const response: interfaceErrorResponse = {
    ok: false,
    code: Number(error.statusCode) || Number(error.code) || 500,
    message: error.message || "Internal Server Error",
  };

  reply.status(response.code).send({ message: response.message, ok: false });

  // Log the error details for debugging
  console.error("Error occurred:", error);
  console.error("Request details:", {
    method: request.method,
    url: request.url,
    headers: request.headers,
    body: request.body,
  });

  console.error("Reply details:", {
    statusCode: reply.statusCode,
  });

  console.error("Stack trace:", error.stack);
});

app.register(Router, { prefix: "/api/v1" });

app
  .listen({ port: parseInt(PORT), host: "0.0.0.0" })
  .then(() => {
    console.log(parseInt(PORT));
    console.log(app.printRoutes());
    console.log(`Aplicação rodando na porta ${parseInt(PORT)} \n`);
  })
  .catch((err) => {
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
  });
