import fastifyCors from "@fastify/cors";
import { FastifyInstance } from "fastify";
import { CORS_ORIGIN } from "./env.js";

const corsOptions = CORS_ORIGIN.split(",").map((origin: string) => origin.trim());

const corsConfig = (fastify: FastifyInstance) => {
  return (fastify.register(fastifyCors, {
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: corsOptions,
  }));
};

export default corsConfig;
