import Fastify from "fastify";

import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import fastifyCookie from "@fastify/cookie";

import logConfig from "./core/config/logConfig.js";
import ErrorHook from "./core/hooks/ErrorHook.js";
import bootstrap from "./app.js";

import { PORT } from "./core/config/env.js";
import corsConfig from "./core/config/cors.js";

const fastify = Fastify(logConfig);

await fastify.register(fastifyCookie);
await fastify.register(corsConfig)

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

await fastify.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

await fastify.register(ErrorHook)

await fastify.register(bootstrap, { prefix: "/api/v1" });


await fastify
  .listen({ port: Number.parseInt(PORT), host: "0.0.0.0" })
  .then(() => {
    console.log(Number.parseInt(PORT));
    console.log(fastify.printRoutes());
    console.log(`Aplicação rodando na porta ${Number.parseInt(PORT)} \n`);
  })
  .catch((err) => {
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
  });
