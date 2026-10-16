
import { FastifyInstance } from "fastify";
import { AppError } from "../../core/types/errorTypes.js";
import { authJWT } from "../factories/auth/auth.factory.js";
import { checkPermissions } from "../../core/middleware/checkPermissions.js";
import { OccurrenceController } from "../controller/occurrence/occurrencesController.js";
import { errorSchema } from "../../core/shared/schema/errorSchema.js";
import { uuidParamsSchema } from "../../core/shared/schema/querySchemas.js";

// Schema para cadastrar uma ocorrência
const createOccurrenceSchema = {
  type: "object",
  required: ["visitor_uuid", "occurrence_uuid"],
  properties: {
    visitor_uuid: { type: "string", format: "uuid" },
    occurrence_uuid: { type: "string", format: "uuid" },
    severity: { type: "integer", minimum: 1, maximum: 5 },
    observation: { type: "string", maxLength: 2000 },
    occurredAt: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
};

// Schema para editar uma ocorrência
const updateOccurrenceSchema = {
  type: "object",
  minProperties: 1,
  properties: {
    occurrence_uuid: { type: "string", format: "uuid" },
    severity: { type: "integer", minimum: 1, maximum: 5 },
    observation: {
      type: ["string", "null"],
      maxLength: 2000,
    },
    occurredAt: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
};

export async function occurrencesRouter(app: FastifyInstance) {
  // Define o recurso utilizado pelo middleware de permissões
  app.addHook("onRoute", (route) => {
    route.config = {
      ...route.config,
      permission: { resource: "occurrences" },
    };
  });

  // Exige autenticação e verifica as permissões
  app.addHook("preHandler", authJWT);
  app.addHook("preHandler", checkPermissions);

  const controller = new OccurrenceController();

  // 1. Listar tipos de ocorrências
  app.route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Occurrences"],
      summary: "Listar tipos de ocorrências",
      response: { ...errorSchema },
    },
    handler: controller.getTypes,
  });

  // 2. Registrar uma ocorrência
  app.route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["Occurrences"],
      summary: "Registrar ocorrência",
      body: createOccurrenceSchema,
      response: { ...errorSchema },
    },
    handler: controller.createOccurrence,
  });

  // 3. Consultar histórico do munícipe
  app.route({
    method: "GET",
    url: "/visitor/:uuid",
    schema: {
      tags: ["Occurrences"],
      summary: "Consultar histórico de ocorrências do munícipe",
      params: uuidParamsSchema,
      response: { ...errorSchema },
    },
    handler: controller.getVisitorHistory,
  });

  // 4. Consultar pontuação e status
  app.route({
    method: "GET",
    url: "/visitor/:uuid/status",
    schema: {
      tags: ["Occurrences"],
      summary: "Consultar pontuação e status do munícipe",
      params: uuidParamsSchema,
      response: { ...errorSchema },
    },
    handler: controller.getVisitorStatus,
  });

  // 5. Editar uma ocorrência registrada
  app.route({
    method: "PUT",
    url: "/:uuid",
    schema: {
      tags: ["Occurrences"],
      summary: "Editar ocorrência registrada",
      params: uuidParamsSchema,
      body: updateOccurrenceSchema,
      response: { ...errorSchema },
    },
    handler: controller.updateOccurrence,
  });

  // 6. Excluir logicamente uma ocorrência
  app.route({
    method: "DELETE",
    url: "/:uuid",
    schema: {
      tags: ["Occurrences"],
      summary: "Excluir ocorrência sem apagar a auditoria",
      params: uuidParamsSchema,
      response: { ...errorSchema },
    },
    handler: controller.deleteOccurrence,
  });

  // 7. Consultar auditoria de uma ocorrência
  app.route({
    method: "GET",
    url: "/:uuid/audit",
    preHandler: async (request) => {
      const role = request.user?.role;

      if (role !== "admin" && role !== "superadmin") {
        throw new AppError(
          "Sem permissão para consultar a auditoria",
          403,
          "FORBIDDEN",
        );
      }
    },
    schema: {
      tags: ["Occurrences"],
      summary: "Consultar histórico de alterações e exclusões",
      params: uuidParamsSchema,
      response: { ...errorSchema },
    },
    handler: controller.getOccurrenceAudit,
  });
}
