import Fastify from "fastify";

import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import fastifyCookie from "@fastify/cookie";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyHelmet from "@fastify/helmet";

import logConfig from "./core/config/logConfig.js";
import ErrorHook from "./core/hooks/ErrorHook.js";
import bootstrap from "./app.js";

import { APPLICATION_ENVORIMENT, CORS_ORIGIN, PORT } from "./core/config/env.js";
import corsConfig from "./core/config/cors.js";

const fastify = Fastify(logConfig);

await fastify.register(fastifyCookie);
await fastify.register(corsConfig)
await fastify.register(fastifyRateLimit, { global: false });
await fastify.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", ...CORS_ORIGIN.split(",").map((origin) => origin.trim())],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
});

if (APPLICATION_ENVORIMENT !== "production") {
  await fastify.register(fastifySwagger, {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "API Recepção",
      description: "Docs via Fastify + Zod",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
  },
  });

  await fastify.register(fastifySwaggerUi, { routePrefix: "/docs" });
}

await fastify.register(ErrorHook)

await fastify.register(bootstrap, { prefix: "/api/v1" });


await fastify
  .listen({ port: Number.parseInt(PORT), host: "0.0.0.0" })
  .then(() => {
    fastify.log.info(`Aplicação rodando na porta ${Number.parseInt(PORT)}`);
    if (APPLICATION_ENVORIMENT !== "production") fastify.log.info(`Rotas:\n${fastify.printRoutes()}`);
  })
  .catch((err) => {
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
  });
