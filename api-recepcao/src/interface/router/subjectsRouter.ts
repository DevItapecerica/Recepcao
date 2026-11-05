import { FastifyInstance } from "fastify";

import { authJWT } from "../factories/auth/auth.factory.js";
import { checkPermissions } from "../../core/middleware/checkPermissions.js";
import { SubjectsController } from "../controller/subjectsController.js";

const subjectBodySchema = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", minLength: 1, maxLength: 150 },
    description: { type: ["string", "null"] },
  },
  additionalProperties: false,
};

const updateSubjectBodySchema = {
  type: "object",
  minProperties: 1,
  properties: {
    name: { type: "string", minLength: 1, maxLength: 150 },
    description: { type: ["string", "null"] },
  },
  additionalProperties: false,
};

const subjectUuidParamsSchema = {
  type: "object",
  required: ["uuid"],
  properties: {
    uuid: { type: "string", format: "uuid" },
  },
  additionalProperties: false,
};

export async function subjectsRouter(app: FastifyInstance) {
  app.addHook("onRoute", (route) => {
    route.config = {
      ...route.config,
      permission: { resource: "subjects" },
    };
  });

  app.addHook("preHandler", authJWT);
  app.addHook("preHandler", checkPermissions);

  const controller = new SubjectsController();

  app.route({
    method: "GET",
    url: "/",
    handler: controller.list,
  });

  app.route({
    method: "GET",
    url: "/:uuid",
    schema: {
      params: subjectUuidParamsSchema,
    },
    handler: controller.findById,
  });

  app.route({
    method: "POST",
    url: "/",
    schema: {
      body: subjectBodySchema,
    },
    handler: controller.create,
  });

  app.route({
    method: "PUT",
    url: "/:uuid",
    schema: {
      params: subjectUuidParamsSchema,
      body: updateSubjectBodySchema,
    },
    handler: controller.update,
  });

  app.route({
    method: "DELETE",
    url: "/:uuid",
    schema: {
      params: subjectUuidParamsSchema,
    },
    handler: controller.delete,
  });
}