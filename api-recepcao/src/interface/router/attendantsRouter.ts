
import { FastifyInstance } from "fastify";
import { authJWT } from "../factories/auth/auth.factory.js";
import { checkPermissions } from "../../core/middleware/checkPermissions.js";
import { AttendantsController } from "../controller/attendantsController.js";

const attendantBodySchema = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", minLength: 1, maxLength: 150 },
    description: { type: ["string", "null"] },
  },
  additionalProperties: false,
};

const updateAttendantBodySchema = {
  type: "object",
  minProperties: 1,
  properties: {
    name: { type: "string", minLength: 1, maxLength: 150 },
    description: { type: ["string", "null"] },
  },
  additionalProperties: false,
};

const attendantUuidParamsSchema = {
  type: "object",
  required: ["uuid"],
  properties: {
    uuid: { type: "string", format: "uuid" },
  },
  additionalProperties: false,
};

export async function attendantsRouter(app: FastifyInstance) {
  app.addHook("onRoute", (route) => {
    route.config = {
      ...route.config,
      permission: { resource: "attendants" },
    };
  });

  app.addHook("preHandler", authJWT);
  app.addHook("preHandler", checkPermissions);

  const controller = new AttendantsController();

  app.route({
    method: "GET",
    url: "/",
    handler: controller.list,
  });

  app.route({
    method: "GET",
    url: "/:uuid",
    schema: { params: attendantUuidParamsSchema },
    handler: controller.findById,
  });

  app.route({
    method: "POST",
    url: "/",
    schema: { body: attendantBodySchema },
    handler: controller.create,
  });

  app.route({
    method: "PUT",
    url: "/:uuid",
    schema: {
      params: attendantUuidParamsSchema,
      body: updateAttendantBodySchema,
    },
    handler: controller.update,
  });

  app.route({
    method: "DELETE",
    url: "/:uuid",
    schema: { params: attendantUuidParamsSchema },
    handler: controller.delete,
  });
}
